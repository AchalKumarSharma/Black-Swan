"""Director M - Orchestrator, Intent Routing, and Strategic Decomposition Agent."""

import json
import logging
import re
import uuid
from typing import Any, Dict, List, Optional, Tuple

from app.config import get_settings
from app.core.duckdb import sanitize_table_name
from app.core.entity_resolver import resolve_query_dimension_and_entities
from app.core.llm_router import extract_json_payload, route_completion

logger = logging.getLogger("blackswan.agents.m")

VALID_INTENTS = {
    "TREND_GROWTH",
    "PROFITABILITY_FORECAST",
    "ANOMALY_INVESTIGATION",
    "SEGMENT_BREAKDOWN",
    "GENERAL_INQUIRY",
    "OUT_OF_SCOPE",
}

OUT_OF_SCOPE_PATTERNS = [
    r"\bweather\b", r"\btemperature\b", r"\brain\b", r"\bsnow\b", r"\bsunny\b",
    r"\bfootball\b", r"\bsoccer\b", r"\bcricket\b", r"\bnba\b", r"\bnfl\b", r"\bmatch score\b",
    r"\brecipe\b", r"\bhow to cook\b", r"\bhow to bake\b", r"\bpizza\b", r"\bpasta\b",
    r"\bjoke\b", r"\bwho are you\b", r"\bhow are you\b", r"\bwhat is your name\b",
    r"\bcapital of\b", r"\bwho is the president\b", r"\bmovie\b", r"\bcinema\b",
    r"\bsong\b", r"\blyrics\b", r"\bhoroscope\b", r"\bwho won\b", r"\bwho is\b",
]

FINANCIAL_KEYWORDS = {
    "revenue", "profit", "margin", "cogs", "cost", "costs", "sales", "sale",
    "expense", "expenses", "opex", "ebitda", "ebit", "budget", "variance",
    "growth", "drop", "dropping", "spike", "contraction", "covenant", "anomaly",
    "invoice", "invoices", "customer", "customers", "product", "products",
    "region", "regions", "segment", "segments", "quarter", "q1", "q2", "q3", "q4",
    "units", "sold", "volume", "ledger", "price", "pricing", "discount",
    "financial", "financials", "spend", "spending", "earning", "earnings",
    "forecast", "run rate", "run-rate", "performance", "breakdown", "category",
    "gross margin", "net profit", "loss"
}


def classify_intent_heuristic(
    query: str,
    resolved_entities: Optional[List[str]] = None,
    conversation_history: Optional[List[Dict[str, Any]]] = None,
) -> str:
    """Classify user query intent into one of 6 discrete categories using keyword heuristics."""
    q_lower = query.lower().strip()

    # Check for Greetings / Chit-chat without financial context
    is_pure_greeting = bool(re.match(r"^(hi|hello|hey|greetings|good morning|good afternoon|good evening|howdy)[!.,\s]*$", q_lower))
    has_financial_term = any(k in q_lower for k in FINANCIAL_KEYWORDS)

    # 0. OUT_OF_SCOPE: Off-topic questions or greetings without financial terms
    if (is_pure_greeting and not has_financial_term) or (
        not has_financial_term
        and any(re.search(pat, q_lower) for pat in OUT_OF_SCOPE_PATTERNS)
    ):
        return "OUT_OF_SCOPE"

    # Contextual resolution for follow-ups (e.g. "which product contributed the most?")
    if conversation_history and ("contributed" in q_lower or "which" in q_lower or "what about" in q_lower):
        if "product" in q_lower or "segment" in q_lower:
            return "SEGMENT_BREAKDOWN"
        if "why" in q_lower or "drop" in q_lower or "cause" in q_lower:
            return "ANOMALY_INVESTIGATION"

    # Direct ledger / profit / loss verification checks route cleanly to GENERAL_INQUIRY (Ledger Inquiry)
    # Handles direct questions (with or without conversational prefixes like "just give me a one liner answer, ")
    is_alt_inquiry = bool(re.search(r"\b(profit\s+or\s+loss|gain\s+or\s+loss|up\s+or\s+down)\b", q_lower))
    is_direct_pl_verification = (
        is_alt_inquiry
        or bool(re.search(r"\b(am|is|are|do|does|did|have|has)\b.*?\b(loss|losses|profitable|profit|profits|losing money|losing|incur loss|any loss)\b", q_lower))
        or any(k in q_lower for k in ["profit or loss", "huge profit", "huge profits", "am i profitable", "facing loss", "incur loss", "any loss"])
    )
    is_anomaly_why = any(k in q_lower for k in ["why did", "why has", "why is", "root cause", "culprit", "drop in", "covenant", "anomaly", "spike"])
    is_explicit_forecast = any(k in q_lower for k in ["forecast", "projection", "predict", "next year", "next quarter", "future", "outlook"])

    if is_direct_pl_verification and not is_anomaly_why and not is_explicit_forecast:
        return "GENERAL_INQUIRY"

    # 1. ANOMALY_INVESTIGATION: Specific root cause questions, why questions, drop/spike anomalies, loss inquiries
    if any(k in q_lower for k in [
        "why did", "why has", "why is", "root cause", "culprit", "covenant",
        "anomaly", "spike", "compression", "contraction", "drop in q2", "margin drop",
        "gross margin drop", "violation", "breach", "loss", "losses", "any loss", "net loss"
    ]):
        return "ANOMALY_INVESTIGATION"

    # 2. PROFITABILITY_FORECAST: Forward looking, profit projections, run rates, next year
    if any(k in q_lower for k in [
        "forecast", "future", "next year", "next quarter", "projection", "predict",
        "will we make", "profitable next", "run-rate", "forward looking",
        "run rate", "expected revenue", "expect revenue", "expected profit", "expected",
        "outlook", "target revenue", "what will be"
    ]):
        return "PROFITABILITY_FORECAST"

    # 3. SEGMENT_BREAKDOWN: Slices, product, customer or regional comparisons, or named entities
    if (resolved_entities and len(resolved_entities) >= 2) or any(k in q_lower for k in [
        "breakdown", "by segment", "by product", "by region", "by category",
        "compare", "comparison", "between", "versus", "vs", "slice", "distribution", "per region", "per product"
    ]):
        return "SEGMENT_BREAKDOWN"

    # 4. TREND_GROWTH: Trajectory, revenue growth/decline over time, momentum
    if any(k in q_lower for k in [
        "grow", "growing", "growth", "drop", "dropping", "trend", "trajectory",
        "increase", "decreasing", "decrease", "over time", "evolution",
        "momentum", "pace", "accelerat", "rising", "falling"
    ]):
        return "TREND_GROWTH"

    # 5. GENERAL_INQUIRY: Factual ledger queries
    return "GENERAL_INQUIRY"


def generate_synthesis_instruction(query: str) -> str:
    """Generate precise synthesis instruction for LLM/Agent Q/Agent Eve based on inquiry structure."""
    q_lower = query.lower().strip()
    instructions = []

    # 1. Alternative / Choice Question Check
    is_alt = bool(re.search(r"\b(profit\s+or\s+loss|gain\s+or\s+loss|up\s+or\s+down)\b", q_lower))
    # 2. Polar Yes/No Question Check
    is_polar = bool(re.search(r"\b(am|is|are|did|do|does|has|have|was|were)\b", q_lower)) and not is_alt
    # 3. Brevity Requested Check
    is_brief = bool(re.search(r"\b(one[\s-]liner|one\s+line|briefly|short\s+answer|in\s+one\s+sentence)\b", q_lower))

    if is_alt:
        instructions.append(
            "Do NOT begin with 'Yes.' or 'No.'. State the financial outcome directly (e.g., 'The business generated a net profit of ₹16.07L (19.95% margin)...')."
        )
    elif is_polar:
        instructions.append(
            "Answer with a decisive 'Yes.' or 'No.' followed strictly by the single factual data point supporting it."
        )

    if is_brief:
        instructions.append(
            "CONSTRAINT: Return strictly ONE sentence under 25 words stating only the decisive metric. No preamble, no multi-clause padding."
        )

    return " ".join(instructions)


def classify_response_style(query: str, intent: str) -> str:
    """Classify inquiry response style: DIRECT_BINARY vs EXPLORATORY_DETAILED."""
    q_lower = query.lower().strip()

    # Explicit exploratory/comparative markers
    exploratory_markers = [
        "why did", "why has", "why is", "why are", "root cause", "what caused", "cause of",
        "compare", "comparison", "between", "versus", "vs", "breakdown", "by segment",
        "by product", "by region", "decompose", "investigate", "deep dive", "explain",
        "detailed", "walk me through", "driver of", "drivers of", "culprit"
    ]
    if any(marker in q_lower for marker in exploratory_markers):
        return "EXPLORATORY_DETAILED"

    # Explicit binary / single-check verification questions
    # e.g., "Am I facing loss?", "Am I profitable?", "Are we losing money?", "Is there any loss?", "Are sales growing?", "Did we beat target?"
    binary_patterns = [
        r"\b(am|is|are|did|do|does|has|have|can|will|was|were)\b",
        r"\bis there (any|a)\b",
        r"\bare there (any)?\b",
        r"\bany loss(es)?\b",
        r"\bprofitable\b",
        r"\bhuge profits?\b",
        r"\blosing money\b",
        r"\bbeat target\b",
        r"\bon track\b",
        r"\bgrowing or dropping\b",
        r"\bgrowing or falling\b",
        r"\bgrowth or decline\b",
        r"\bprofit\s+or\s+loss\b",
        r"\bgain\s+or\s+loss\b",
        r"\bup\s+or\s+down\b",
        r"\bone[\s-]liner\b",
        r"\bone\s+line\b",
        r"\bbriefly\b",
        r"\bshort\s+answer\b",
        r"\bin\s+one\s+sentence\b",
    ]
    if any(re.search(pat, q_lower) for pat in binary_patterns):
        return "DIRECT_BINARY"

    # Intent-based defaults
    if intent in ("ANOMALY_INVESTIGATION", "SEGMENT_BREAKDOWN"):
        return "EXPLORATORY_DETAILED"
    elif intent in ("TREND_GROWTH", "PROFITABILITY_FORECAST"):
        if any(w in q_lower for w in ["growing or", "dropping or", "higher or", "lower or"]):
            return "DIRECT_BINARY"
        return "EXPLORATORY_DETAILED"

    return "DIRECT_BINARY"


def get_intent_defaults(
    intent: str,
    query: str,
    period_col: str,
    dimension_col: str,
    revenue_col: str,
    cogs_col: str,
    target_entities: Optional[List[str]] = None,
    requested_metrics: Optional[List[str]] = None,
) -> Tuple[List[str], List[str], str, str]:
    """Provide tailored hypotheses, metrics, sql_objective, and strategic_focus per intent."""
    if intent == "TREND_GROWTH":
        hypotheses = [
            f"Top-line '{revenue_col}' has experienced inflection points across '{period_col}' periods due to shifting demand velocity.",
            f"Period-over-period momentum in '{revenue_col}' is pacing below historical averages in recent periods.",
            f"Direct '{cogs_col}' scaling has outpaced '{revenue_col}' growth, moderating operating leverage over time.",
        ]
        metrics = [period_col, revenue_col, "revenue_growth_pct", cogs_col, "gross_margin_pct"]
        sql_objective = (
            f"Aggregate total '{revenue_col}' and '{cogs_col}' chronologically by '{period_col}', "
            f"computing period-over-period percentage growth to determine if revenue is expanding or dropping."
        )
        strategic_focus = f"Evaluate chronological {revenue_col} trajectory and volume momentum over {period_col} intervals."

    elif intent == "PROFITABILITY_FORECAST":
        hypotheses = [
            f"Linear extrapolation of recent '{period_col}' revenue run rates projects forward top-line momentum for the upcoming year.",
            f"Direct '{cogs_col}' cost pacing and margin sustainability dictate attainable revenue and gross profit targets next year.",
            f"Recent '{revenue_col}' velocity supports positive net earnings for the upcoming annual cycle under constant margin assumptions.",
        ]
        metrics = [period_col, revenue_col, cogs_col, "gross_profit", "gross_margin_pct", "annual_run_rate_profit"]
        sql_objective = (
            f"Aggregate chronological '{period_col}' revenue, COGS, and gross margin run rates to extrapolate forward-looking expected revenue and earnings for next year."
        )
        strategic_focus = f"Model forward-looking expected revenue projection and run-rate margin targets based on historical momentum."

    elif intent == "SEGMENT_BREAKDOWN":
        if target_entities:
            entities_str = ", ".join(f"'{e}'" for e in target_entities)
            hypotheses = [
                f"Comparative analysis between {', '.join(target_entities)} reveals distinct unit economics and margin realization profiles.",
                f"Top-line revenue and unit sales are differentiated across {', '.join(target_entities)} with varying contribution to enterprise profitability.",
            ]
            metrics = [dimension_col, revenue_col, cogs_col, "gross_profit", "gross_margin_pct", "revenue_share_pct"]
            if requested_metrics:
                metrics.extend([m for m in requested_metrics if m not in metrics])
            extra_metrics_str = f"{', '.join(requested_metrics)}, " if requested_metrics else ""
            sql_objective = (
                f"Filter for '{dimension_col}' IN ({entities_str}) and group by '{dimension_col}', "
                f"aggregating total '{revenue_col}', {extra_metrics_str}'{cogs_col}', and gross margin percentage to compare relative performance between {', '.join(target_entities)}."
            )
            strategic_focus = f"Comparative entity breakdown and unit economics across {', '.join(target_entities)}."
        else:
            hypotheses = [
                f"Gross margin and volume are highly concentrated within top '{dimension_col}' tiers.",
                f"Product/regional mix shifts have impacted consolidated profitability across '{dimension_col}' partitions.",
            ]
            metrics = [dimension_col, revenue_col, cogs_col, "gross_profit", "gross_margin_pct", "revenue_share_pct"]
            sql_objective = (
                f"Group ledger by '{dimension_col}', aggregating total '{revenue_col}', '{cogs_col}', and gross margin percentage to compare relative segment performance."
            )
            strategic_focus = f"Comparative breakdown of revenue and margin health across {dimension_col} segments."

    elif intent == "GENERAL_INQUIRY":
        if any(k in query.lower() for k in ["loss", "losses", "profit", "net profit", "profitable", "any loss", "losing money", "losing"]):
            hypotheses = [
                f"Consolidated top-line '{revenue_col}' exceeds total operating expenditures across '{dimension_col}', delivering overall enterprise profitability.",
                f"Individual cost components (COGS, marketing, opex) have remained within budget thresholds without causing net operating deficit.",
                f"Operating margin remains positive across the evaluated intervals with no material solvency concerns.",
            ]
            metrics = [revenue_col, cogs_col, "total_revenue", "total_cogs", "net_profit_loss"]
            sql_objective = (
                f"Calculate total revenue, total COGS, and all operational expenses across the dataset to determine if the business operates at a net profit or net loss."
            )
            strategic_focus = "Enterprise net profitability verification and expense solvency audit."
        else:
            hypotheses = [
                f"Underlying ledger entries provide factual resolution for user inquiry '{query}'.",
            ]
            metrics = [period_col, dimension_col, revenue_col, cogs_col]
            sql_objective = f"Query ledger aggregates, metrics, and summary distributions answering: {query}"
            strategic_focus = f"Factual ledger inquiry resolution for {query}"

    elif intent == "OUT_OF_SCOPE":
        hypotheses = [
            "User inquiry is outside the financial transaction ledger domain.",
        ]
        metrics = []
        sql_objective = "No SQL execution required."
        strategic_focus = "Inquiry out of scope: Direct user to financial ledger analysis."

    else:  # ANOMALY_INVESTIGATION
        if any(k in query.lower() for k in ["loss", "losses", "profit", "net profit", "profitable", "any loss"]):
            hypotheses = [
                f"Consolidated top-line '{revenue_col}' exceeds total operating expenditures across '{dimension_col}', delivering overall enterprise profitability.",
                f"Individual cost components (COGS, marketing, opex) have remained within budget thresholds without causing net operating deficit.",
                f"Operating margin remains positive across the evaluated intervals with no material solvency concerns.",
            ]
            metrics = [revenue_col, cogs_col, "total_revenue", "total_cogs", "net_profit_loss"]
            sql_objective = (
                f"Calculate total revenue, total COGS, and all operational expenses across the dataset to determine if the business operates at a net profit or net loss."
            )
            strategic_focus = f"Evaluate enterprise profitability and verify whether operations incurred a net financial loss."
        else:
            hypotheses = [
                f"Gross margin compression is driven by acute COGS expansion in specific '{dimension_col}' partitions rather than systemic enterprise erosion.",
                f"Top-line '{revenue_col}' variance across '{period_col}' intervals caused negative operating leverage on fixed delivery costs.",
                f"Contractual or logistics cost spikes in outlier regions created disproportionate basis-point drag on consolidated margins.",
            ]
            metrics = [
                revenue_col,
                cogs_col,
                "gross_profit",
                "gross_margin_pct",
                "revenue_delta_pct",
                "cogs_delta_pct",
                "gm_variance_bps",
            ]
            sql_objective = (
                f"Compute regional baseline vs comparison period revenue, COGS, gross margins, and basis-point variance across '{dimension_col}' to isolate anomalies."
            )
            strategic_focus = f"Decompose {revenue_col} and {cogs_col} variance across {dimension_col} to isolate root cause anomalies."

    return hypotheses, metrics, sql_objective, strategic_focus


async def run_m_director(
    query: str,
    dataset_id: str = "",
    inferred_schema: Optional[Dict[str, Any]] = None,
    sanitized_table_name: Optional[str] = None,
    dataset_name: str = "",
    conversation_history: Optional[List[Dict[str, Any]]] = None,
) -> Dict[str, Any]:
    """Execute Director M strategic decomposition and intent routing.

    Consumes: user query, dataset column metadata/schema, conversation history.
    Produces: Decomposed plan, classified intent, tailored hypotheses, required metrics, and sql_objective.
    """
    settings = get_settings()
    task_id = f"task-{uuid.uuid4().hex[:8]}"

    ds_id = dataset_id or dataset_name or "default_dataset"
    table_name = sanitized_table_name or sanitize_table_name(ds_id)
    inferred_schema = inferred_schema or {}

    period_col = inferred_schema.get("period_col") or "period"
    dimension_col = inferred_schema.get("dimension_col") or "dimension"
    revenue_col = inferred_schema.get("revenue_col") or "revenue"
    cogs_col = inferred_schema.get("cogs_col") or "cogs"
    columns = [c.get("name") for c in inferred_schema.get("columns", []) if c.get("name")]

    # Resolve entities and target dimension from query
    resolved = resolve_query_dimension_and_entities(query, table_name, inferred_schema)
    detected_dim = resolved.get("dimension_col")
    target_entities = resolved.get("target_entities") or []
    requested_metrics = resolved.get("requested_metrics") or []
    units_col = resolved.get("units_col")

    if detected_dim:
        dimension_col = detected_dim

    # Compute synthesis directive for LLM/Agent Q/Agent Eve
    synthesis_instruction = generate_synthesis_instruction(query)

    # Compute heuristic intent & baseline defaults
    heuristic_intent = classify_intent_heuristic(query, target_entities, conversation_history)
    def_hypotheses, def_metrics, def_sql_obj, def_focus = get_intent_defaults(
        heuristic_intent, query, period_col, dimension_col, revenue_col, cogs_col, target_entities, requested_metrics
    )

    intent = heuristic_intent
    response_style = classify_response_style(query, heuristic_intent)
    hypotheses = def_hypotheses
    required_metrics = def_metrics
    sql_objective = def_sql_obj
    strategic_focus = def_focus

    default_subtasks = [
        {
            "step_id": "step-1",
            "agent_assigned": "Q",
            "goal": (
                f"Execute dynamic DuckDB SQL targeting '{table_name}' fulfilling SQL objective: {sql_objective}"
                + (f" Synthesis Directive: {synthesis_instruction}" if synthesis_instruction else "")
            ),
        },
        {
            "step_id": "step-2",
            "agent_assigned": "Eve",
            "goal": (
                "Conduct adversarial audit on Q's variance calculations, verify statistical robustness, "
                "test covenant thresholds, and compile formula execution ledger."
                + (f" Synthesis Directive: {synthesis_instruction}" if synthesis_instruction else "")
            ),
        },
        {
            "step_id": "step-3",
            "agent_assigned": "007",
            "goal": (
                "Synthesize 3 concrete remediation levers with projected margin recovery, "
                "actionable execution horizons, and interactive sensitivity parameters."
            ),
        },
    ]

    quota_exceeded = False

    # Attempt LLM Router-powered decomposition if API key is provided
    if (settings.GEMINI_API_KEY and settings.GEMINI_API_KEY != "your_gemini_api_key_here") or settings.GROQ_API_KEY:
        try:
            history_context = ""
            if conversation_history:
                formatted_history = []
                for turn in conversation_history[-3:]:
                    q_text = turn.get("query", "")
                    ans_text = turn.get("summary") or turn.get("narrative") or ""
                    if q_text:
                        formatted_history.append(f"User: {q_text}\nSystem: {ans_text}")
                if formatted_history:
                    history_context = "Recent Conversation History:\n" + "\n".join(formatted_history) + "\n\n"

            prompt = (
                f"You are Director M, the MI6 Strategic FP&A Orchestrator. "
                f"Decompose the following financial inquiry into a rigorous plan with intent classification.\n\n"
                f"{history_context}"
                f"User Inquiry: {query}\n"
                f"Dataset Table: {table_name}\n"
                f"Available Columns: {', '.join(columns)}\n"
                f"Detected Key Roles: Period=\"{period_col}\", Dimension=\"{dimension_col}\", Revenue=\"{revenue_col}\", COGS=\"{cogs_col}\"\n\n"
                f"Classify the query into EXACTLY ONE of these 6 discrete intents:\n"
                f"- TREND_GROWTH: Directional analysis (revenue growth/decline, volume trajectories over time).\n"
                f"- PROFITABILITY_FORECAST: Margin health, run-rate projections, forward estimates based on run rates.\n"
                f"- ANOMALY_INVESTIGATION: Forensic root-cause analysis, margin compression, cost spikes, covenant violations.\n"
                f"- SEGMENT_BREAKDOWN: Product, category, or regional slice comparisons.\n"
                f"- GENERAL_INQUIRY: Factual ledger queries (top customers, monthly totals, averages, record counts).\n"
                f"- OUT_OF_SCOPE: Inquiries completely outside financial transaction ledger analysis (e.g. weather, sports, general knowledge, chit-chat, recipes, movies).\n\n"
                f"Determine the response_style:\n"
                f"- DIRECT_BINARY: User asks a direct binary check, single verification, or yes/no question (e.g. 'Is there any loss?', 'Are sales growing?', 'Did we beat target?').\n"
                f"- EXPLORATORY_DETAILED: User asks an investigative, root-cause, or comparative question (e.g. 'Why did gross margin drop in Q2?', 'Compare Product A vs Product B').\n\n"
                f"Respond with JSON adhering to this exact schema:\n"
                f"{{\n"
                f'  "intent": "TREND_GROWTH" | "PROFITABILITY_FORECAST" | "ANOMALY_INVESTIGATION" | "SEGMENT_BREAKDOWN" | "GENERAL_INQUIRY" | "OUT_OF_SCOPE",\n'
                f'  "response_style": "DIRECT_BINARY" | "EXPLORATORY_DETAILED",\n'
                f'  "hypotheses": ["hypothesis 1", "hypothesis 2", "hypothesis 3"],\n'
                f'  "required_metrics": ["metric1", "metric2", ...],\n'
                f'  "sql_objective": "Concise natural language specification of what query Agent Q must generate",\n'
                f'  "strategic_focus": "1-sentence executive focus directive"\n'
                f"}}"
            )

            raw_resp = await route_completion(
                prompt=prompt,
                response_format={"type": "json_object"},
                temperature=0.2,
            )

            parsed = extract_json_payload(raw_resp)
            llm_intent = str(parsed.get("intent", "")).upper()
            if llm_intent in VALID_INTENTS:
                intent = llm_intent

            llm_style = str(parsed.get("response_style", "")).upper()
            if llm_style in ("DIRECT_BINARY", "EXPLORATORY_DETAILED"):
                response_style = llm_style

            # Direct ledger / profit / loss verification checks route cleanly to GENERAL_INQUIRY / DIRECT_BINARY
            q_clean = query.lower().strip()
            is_alt_inq = bool(re.search(r"\b(profit\s+or\s+loss|gain\s+or\s+loss|up\s+or\s+down)\b", q_clean))
            is_direct_pl = (
                is_alt_inq
                or bool(re.search(r"\b(am|is|are|do|does|did|have|has)\b.*?\b(loss|losses|profitable|profit|profits|losing money|losing|incur loss|any loss)\b", q_clean))
                or any(k in q_clean for k in ["profit or loss", "huge profit", "huge profits", "am i profitable", "facing loss", "incur loss", "any loss"])
            )
            is_why = any(k in q_clean for k in ["why did", "why has", "why is", "root cause", "culprit", "drop in", "covenant", "anomaly", "spike"])
            is_fc = any(k in q_clean for k in ["forecast", "projection", "predict", "next year", "next quarter", "future", "outlook"])

            if is_direct_pl and not is_why and not is_fc:
                intent = "GENERAL_INQUIRY"
                response_style = "DIRECT_BINARY"

            hypotheses = parsed.get("hypotheses") or hypotheses
            required_metrics = parsed.get("required_metrics") or required_metrics
            sql_objective = parsed.get("sql_objective") or sql_objective
            strategic_focus = parsed.get("strategic_focus") or strategic_focus

            # Update subtask 1 goal with specific sql_objective
            default_subtasks[0]["goal"] = (
                f"Execute dynamic DuckDB SQL targeting '{table_name}' fulfilling SQL objective: {sql_objective}"
                + (f" Synthesis Directive: {synthesis_instruction}" if synthesis_instruction else "")
            )

            logger.info("Director M classified intent '%s' (style: %s) via LiteLLM Router", intent, response_style)
        except Exception as e:
            err_str = str(e)
            if "429" in err_str or "RESOURCE_EXHAUSTED" in err_str or "quota" in err_str.lower():
                quota_exceeded = True
                logger.warning("LLM Router M quota exceeded (429), switching to deterministic routing: %s", e)
            else:
                logger.warning("LLM Router M generation failed, falling back to deterministic plan: %s", e)

    refusal_message = (
        "I cannot answer that question because this workspace is analyzing your financial transaction ledger. "
        "You can ask me about revenue trajectories, product sales, or gross margin anomalies."
    ) if intent == "OUT_OF_SCOPE" else None

    return {
        "task_id": task_id,
        "user_query": query,
        "intent": intent,
        "response_style": response_style,
        "dimension_col": dimension_col,
        "target_entities": target_entities,
        "requested_metrics": requested_metrics,
        "units_col": units_col,
        "hypotheses": hypotheses,
        "required_metrics": required_metrics,
        "sql_objective": sql_objective,
        "strategic_focus": strategic_focus,
        "synthesis_instruction": synthesis_instruction,
        "subtasks": [] if intent == "OUT_OF_SCOPE" else default_subtasks,
        "status": "completed",
        "quota_exceeded": quota_exceeded,
        "refusal_message": refusal_message,
    }
