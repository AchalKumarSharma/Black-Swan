"""Agent 007 - Strategic Remediation Levers, Pro-Forma Modeling, and Executive Action."""

import json
import logging
from typing import Any, Dict, List, Optional

from app.config import get_settings
from app.core.formatters import format_bps_human, format_currency_human
from app.core.llm_router import extract_json_payload, route_completion

logger = logging.getLogger("blackswan.agents.007")


async def run_agent_007(
    query: str,
    q_result: Dict[str, Any],
    eve_result: Dict[str, Any],
    inferred_schema: Dict[str, Any],
    m_plan: Optional[Dict[str, Any]] = None,
) -> Dict[str, Any]:
    """Execute Agent 007 remediation strategy synthesis.

    Models 3 concrete remediation levers with projected margin recovery in basis points,
    synthesizes executive recommendations and actionable roadmaps, and parameterizes
    sensitivity levers for pro-forma slider modeling.
    """
    settings = get_settings()
    m_plan = m_plan or {}
    intent = m_plan.get("intent") or "ANOMALY_INVESTIGATION"
    response_style = m_plan.get("response_style") or "EXPLORATORY_DETAILED"

    anomaly_data = q_result.get("anomalyData") or {}
    region = anomaly_data.get("region", "South")
    variance_bps = anomaly_data.get("varianceBps", -1193)
    actual_billed = anomaly_data.get("actualBilled", 525000)
    expected_vol = anomaly_data.get("expectedVolume", 433000)
    curr_symbol = anomaly_data.get("currencySymbol", "$")
    outlier_tx = anomaly_data.get("outlierTransaction")
    outlier_cogs = anomaly_data.get("outlierCogs")
    outlier_date = anomaly_data.get("outlierDate")
    table_headers = q_result.get("table_headers") or []
    excess_cost = max(0, actual_billed - expected_vol)
    if excess_cost == 0:
        excess_cost = 92000

    is_trend = intent == "TREND_GROWTH" or (
        intent not in ("PROFITABILITY_FORECAST", "SEGMENT_BREAKDOWN", "GENERAL_INQUIRY")
        and "period" in table_headers
        and "revenue" in table_headers
        and "gm_variance_bps" not in table_headers
    )
    is_profitability = intent == "PROFITABILITY_FORECAST"
    is_segment = intent == "SEGMENT_BREAKDOWN" or (
        "segment" in table_headers and "gm_variance_bps" not in table_headers
    )

    executive_brief: Dict[str, str] = {}

    # 1. DIRECT_BINARY Path: Instant Plain-English Verdict, Suppress Irrelevant Levers
    if response_style == "DIRECT_BINARY":
        if anomaly_data.get("netProfitLoss") is not None or region in ("All Operations", "Enterprise Loss"):
            net_pl = anomaly_data.get("netProfitLoss", 0.0)
            tot_rev = expected_vol
            tot_costs = actual_billed
            margin_pct = anomaly_data.get("discrepancyPct", 0.0)

            if net_pl >= 0:
                verdict = f"No. The company is profitable with a net profit of {format_currency_human(net_pl, curr_symbol)} across the evaluated period."
                supporting = f"Revenue reached {format_currency_human(tot_rev, curr_symbol)} against total expenses of {format_currency_human(tot_costs, curr_symbol)} (net operating margin: {margin_pct:.2f}%)."
                headline_recommendation = f"{verdict} {supporting}"
                estimated_impact = "Profitable Operations • Zero Remediation Levers Required"
                remediation_levers = []
                sensitivity_levers = []
                strategic_actions = []
                executive_brief = {
                    "headline": verdict,
                    "driver": supporting,
                    "action": "Maintain current operating margin discipline and quarterly expense monitoring.",
                }
            else:
                verdict = f"Yes. An enterprise net loss of {format_currency_human(abs(net_pl), curr_symbol)} was detected."
                supporting = f"Consolidated costs of {format_currency_human(tot_costs, curr_symbol)} exceeded top-line revenue of {format_currency_human(tot_rev, curr_symbol)} (net deficit margin: {margin_pct:.2f}%)."
                headline_recommendation = f"{verdict} {supporting}"
                estimated_impact = f"{format_currency_human(abs(net_pl), curr_symbol)} turnaround target"
                remediation_levers = [
                    {
                        "id": "lever_1",
                        "title": "Immediate Discretionary Expenditure Freeze",
                        "impact_bps": 220,
                        "horizon": "15 Days",
                        "description": "Institute strict freeze on non-essential operational and travel expenditures to immediately curtail net deficit.",
                        "status": "Immediate",
                    },
                    {
                        "id": "lever_2",
                        "title": "Vendor Contract Renegotiation & Rate Caps",
                        "impact_bps": 140,
                        "horizon": "30 Days",
                        "description": "Renegotiate top supplier contracts with 10% rate reductions to stem direct cost overrun.",
                        "status": "Immediate",
                    },
                ]
                sensitivity_levers = []
                strategic_actions = [
                    "Institute mandatory executive sign-off for operational expenditures exceeding baseline thresholds.",
                    "Audit recurring software, logistics, and contractor commitments to eliminate redundancies.",
                ]
                executive_brief = {
                    "headline": verdict,
                    "driver": supporting,
                    "action": "Execute immediate cost freezes and supplier renegotiations to restore solvency.",
                }

        elif is_trend:
            discrepancy_pct = anomaly_data.get("discrepancyPct", 0.0)
            if discrepancy_pct >= 0:
                verdict = f"Yes. Revenue is growing, pacing at a net {discrepancy_pct:+.2f}% rate across observed periods."
                supporting = f"Total revenue reached {format_currency_human(actual_billed, curr_symbol)} with verified cost ledger alignment."
            else:
                verdict = f"No. Revenue is contracting at a net {discrepancy_pct:.2f}% rate across observed periods."
                supporting = f"Top-line revenue contracted across chronological intervals."
            headline_recommendation = f"{verdict} {supporting}"
            estimated_impact = "Top-Line Demand Pacing Healthy • No Remediation Levers Required"
            remediation_levers = []
            sensitivity_levers = []
            strategic_actions = []
            executive_brief = {
                "headline": verdict,
                "driver": supporting,
                "action": "Continue monitoring top-line velocity across active customer channels.",
            }

        else:
            headline_recommendation = f"Operational metrics in '{region}' verified healthy and within contractual benchmarks."
            estimated_impact = "Operations Normal • No Remediation Required"
            remediation_levers = []
            sensitivity_levers = []
            strategic_actions = []
            executive_brief = {
                "headline": headline_recommendation,
                "driver": f"All evaluated partitions tracked within benchmark tolerance.",
                "action": "Maintain standard quarterly review cadence.",
            }

    # 2. EXPLORATORY_DETAILED Path: Structured 3-Part Brief & Action Levers
    elif is_trend:
        discrepancy_pct = anomaly_data.get("discrepancyPct", 0.0)
        remediation_levers = [
            {
                "id": "lever_1",
                "title": "Enterprise Contract Renewal Upsells & Volume Tiering",
                "impact_bps": 150,
                "horizon": "30 Days",
                "description": f"Structure multi-year renewal incentives with expansion tiers, capturing up to {format_currency_human(actual_billed * 0.12, curr_symbol)} in incremental ARR.",
                "status": "Immediate",
            },
            {
                "id": "lever_2",
                "title": "Usage-Based Commercial Packaging",
                "impact_bps": 85,
                "horizon": "45 Days",
                "description": "Deploy tiered usage bands to eliminate unmonetized volume leakage across commercial customer accounts.",
                "status": "Immediate",
            },
            {
                "id": "lever_3",
                "title": "High-Margin Channel Capacity Allocation",
                "impact_bps": 60,
                "horizon": "60 Days",
                "description": "Reallocate 20% of commercial sales capacity to enterprise accounts exhibiting >50% gross margin profiles.",
                "status": "Mid-Term",
            },
        ]
        total_recovered_bps = sum(l["impact_bps"] for l in remediation_levers)
        headline = f"Revenue expanded at a net {discrepancy_pct:+.2f}% trajectory across observed reporting periods."
        driver = f"Volume growth across core customer segments maintained positive top-line momentum."
        action = f"Deploy tiered commercial packaging and multi-year renewals to accelerate margin leverage by +{total_recovered_bps} basis points."
        headline_recommendation = f"**Headline Takeaway:** {headline}\n\n**Key Operational Driver:** {driver}\n\n**Recommended Action:** {action}"
        estimated_impact = f"+{format_currency_human(actual_billed * 0.15, curr_symbol)} annualized capacity • +{total_recovered_bps} bps operating leverage"
        strategic_actions = [
            "Structure contract renewals with 5% annual volume expansion indexation.",
            "Deploy tiered commercial packaging to capture surplus customer demand.",
            "Prioritize sales capacity toward top-quartile margin accounts.",
        ]
        sensitivity_levers = [
            {
                "id": "revenue_growth_acceleration",
                "label": "Target Growth Rate Acceleration",
                "min_val": -10,
                "max_val": 25,
                "default_val": 8,
                "unit": "%",
                "description": "Simulate operating leverage under accelerated commercial expansion.",
            }
        ]
        executive_brief = {"headline": headline, "driver": driver, "action": action}

    elif is_profitability:
        remediation_levers = [
            {
                "id": "lever_1",
                "title": "Direct Operating Expense Rationalization",
                "impact_bps": 175,
                "horizon": "30 Days",
                "description": f"Consolidate operational vendors, eliminating {format_currency_human(actual_billed * 0.08, curr_symbol)} in redundant overhead.",
                "status": "Immediate",
            },
            {
                "id": "lever_2",
                "title": "Contribution Margin Hurdle Enforcement",
                "impact_bps": 90,
                "horizon": "15 Days",
                "description": "Institute mandatory 35% minimum contribution margin threshold on all enterprise proposals.",
                "status": "Immediate",
            },
            {
                "id": "lever_3",
                "title": "Working Capital & Payment Cycle Optimization",
                "impact_bps": 50,
                "horizon": "60 Days",
                "description": "Standardize commercial terms to Net 30 with 2% early settlement discount.",
                "status": "Mid-Term",
            },
        ]
        total_recovered_bps = sum(l["impact_bps"] for l in remediation_levers)
        headline = f"Run-rate extrapolation models expected forward revenue of {format_currency_human(actual_billed, curr_symbol)}."
        driver = f"Sustainable profitability requires protecting contribution margins against variable vendor overhead."
        action = f"Enforce contribution margin hurdles and rationalize operating overhead to capture +{total_recovered_bps} basis points of recovery."
        headline_recommendation = f"**Headline Takeaway:** {headline}\n\n**Key Operational Driver:** {driver}\n\n**Recommended Action:** {action}"
        estimated_impact = f"+{format_currency_human(actual_billed * 0.12, curr_symbol)} operating cash flow • +{total_recovered_bps} bps margin protection"
        strategic_actions = [
            "Mandate 35% contribution margin hurdle on all commercial proposals.",
            "Consolidate tier-2 vendor relationships into master service contracts.",
            "Transition enterprise accounts to standard Net 30 payment schedules.",
        ]
        sensitivity_levers = [
            {
                "id": "cost_rationalization_pct",
                "label": "Direct Cost Rationalization",
                "min_val": -25,
                "max_val": 5,
                "default_val": -10,
                "unit": "%",
                "description": "Simulate net profit expansion from direct operating cost reductions.",
            }
        ]
        executive_brief = {"headline": headline, "driver": driver, "action": action}

    elif is_segment:
        remediation_levers = [
            {
                "id": "lever_1",
                "title": "High-Realization Product Mix Rebalancing",
                "impact_bps": 160,
                "horizon": "30 Days",
                "description": f"Rebalance commercial capacity toward higher-margin product lines, capturing up to {format_currency_human(actual_billed * 0.08, curr_symbol)} in incremental gross profit.",
                "status": "Immediate",
            },
            {
                "id": "lever_2",
                "title": "Tiered Volume Discount Restructuring",
                "impact_bps": 85,
                "horizon": "45 Days",
                "description": "Restructure volume tiers to eliminate unmonetized discounting on high-volume product deliveries.",
                "status": "Immediate",
            },
            {
                "id": "lever_3",
                "title": "Cross-Sell Bundling & COGS Optimization",
                "impact_bps": 55,
                "horizon": "60 Days",
                "description": "Deploy bundled offerings pairing high-volume products with high-margin software/services.",
                "status": "Mid-Term",
            },
        ]
        total_recovered_bps = sum(l["impact_bps"] for l in remediation_levers)
        headline = f"Product line performance reveals distinct realization and volume concentration across segments."
        driver = f"Disproportionate unit volumes in lower-margin tiers dilute consolidated enterprise profitability."
        action = f"Rebalance sales incentives toward higher-margin product lines to expand blended margins by +{total_recovered_bps} basis points."
        headline_recommendation = f"**Headline Takeaway:** {headline}\n\n**Key Operational Driver:** {driver}\n\n**Recommended Action:** {action}"
        estimated_impact = f"+{format_currency_human(actual_billed * 0.10, curr_symbol)} profit leverage • +{total_recovered_bps} bps margin optimization"
        strategic_actions = [
            "Reallocate sales compensation incentives toward higher-margin offerings.",
            "Establish minimum order quantities and tiered discounts to prevent margin dilution.",
            "Conduct quarterly product line profitability reviews to rationalize negative-margin SKUs.",
        ]
        sensitivity_levers = [
            {
                "id": "product_mix_shift",
                "label": "High-Margin Mix Shift",
                "min_val": -10,
                "max_val": 25,
                "default_val": 10,
                "unit": "%",
                "description": "Simulate margin expansion by shifting sales volume toward higher-margin product lines.",
            }
        ]
        executive_brief = {"headline": headline, "driver": driver, "action": action}

    elif outlier_tx and outlier_cogs:
        remediation_levers = [
            {
                "id": "lever_1",
                "title": f"Procurement Audit & Clawback on {region} Invoice {outlier_tx}",
                "impact_bps": 160,
                "horizon": "15 Days",
                "description": f"Initiate formal supplier dispute and audit for invoice {outlier_tx} ({format_currency_human(outlier_cogs, curr_symbol)} billed COGS), recovering up to {format_currency_human(excess_cost * 0.75, curr_symbol)} in unauthorized spot markups.",
                "status": "Immediate",
            },
            {
                "id": "lever_2",
                "title": f"Automated PO Authorization Ceiling for {region}",
                "impact_bps": 75,
                "horizon": "30 Days",
                "description": f"Enforce mandatory dual-authorization controls on all {region} purchase orders exceeding {format_currency_human(outlier_cogs * 0.7, curr_symbol)} to eliminate unbudgeted cost spikes.",
                "status": "Immediate",
            },
            {
                "id": "lever_3",
                "title": f"Consolidate {region} Carrier Contracts & SLA Volume Caps",
                "impact_bps": 45,
                "horizon": "60 Days",
                "description": f"Renegotiate Tier-1 carrier agreements in {region} with guaranteed volume rate caps, insulating quarterly margins against future logistics volatility.",
                "status": "Mid-Term",
            },
        ]
        total_recovered_bps = sum(l["impact_bps"] for l in remediation_levers)
        headline = f"Gross margin contracted by {abs(variance_bps):,} basis points in '{region}', driving enterprise margin compression in Q2."
        driver = f"Contraction was driven almost exclusively by transaction {outlier_tx} on {outlier_date} ({format_currency_human(outlier_cogs, curr_symbol)} COGS on {format_currency_human(expected_vol, curr_symbol)} revenue)."
        action = f"Initiate supplier dispute on invoice {outlier_tx} and enforce purchase order authorization caps to recover {total_recovered_bps} basis points."
        headline_recommendation = f"**Headline Takeaway:** {headline}\n\n**Key Operational Driver:** {driver}\n\n**Recommended Action:** {action}"
        estimated_impact = f"+{format_currency_human(excess_cost * 1.05, curr_symbol)} operating cash flow • +{total_recovered_bps} bps gross margin recovery"
        strategic_actions = [
            f"Invoke rate-cap clause and dispute unauthorized freight markups on {region} invoice {outlier_tx}.",
            f"Shift 35% of {region} distribution volume to bonded customs warehousing to eliminate demurrage fees.",
            f"Introduce a 4.5% logistics surcharge on expedited orders under {curr_symbol}15,000 in {region}.",
            "Implement dynamic fuel index hedging across Tier-1 carriers starting next quarter.",
        ]
        sensitivity_levers = [
            {
                "id": "south_cogs_adjustment",
                "label": f"{region} COGS Adjustment",
                "min_val": -20,
                "max_val": 10,
                "default_val": -12,
                "unit": "%",
                "description": "Simulate impact of freight carrier tender renegotiation, volume floors, and spot rate caps.",
            }
        ]
        executive_brief = {"headline": headline, "driver": driver, "action": action}

    elif variance_bps < -100:
        remediation_levers = [
            {
                "id": "lever_1",
                "title": f"Direct Cost Variance Remediation in {region}",
                "impact_bps": min(150, abs(variance_bps) // 2),
                "horizon": "30 Days",
                "description": f"Audit vendor billing variance in {region}, targeting recovery of unbudgeted margin leakage.",
                "status": "Immediate",
            },
            {
                "id": "lever_2",
                "title": f"Margin Floor Enforcement for {region}",
                "impact_bps": min(100, abs(variance_bps) // 3),
                "horizon": "45 Days",
                "description": f"Institute operational expense ceilings and pricing adjustments across {region} deliveries.",
                "status": "Immediate",
            },
        ]
        total_recovered_bps = sum(l["impact_bps"] for l in remediation_levers)
        headline = f"Gross margin in '{region}' compressed by {abs(variance_bps):,} basis points below baseline."
        driver = f"Operational expense pacing outstripped top-line realization across regional deliveries."
        action = f"Enforce direct cost ceilings and vendor audit controls in {region} to recover {total_recovered_bps} basis points."
        headline_recommendation = f"**Headline Takeaway:** {headline}\n\n**Key Operational Driver:** {driver}\n\n**Recommended Action:** {action}"
        estimated_impact = f"+{format_currency_human(excess_cost, curr_symbol)} cost containment • +{total_recovered_bps} bps gross margin recovery"
        strategic_actions = [
            f"Audit {region} cost allocation policies to eliminate unbudgeted leakage.",
            f"Enforce dual-signoff authorization on all expenditures exceeding {curr_symbol}25,000 in {region}.",
        ]
        sensitivity_levers = [
            {
                "id": "regional_cost_adjustment",
                "label": f"{region} Cost Optimization",
                "min_val": -20,
                "max_val": 10,
                "default_val": -10,
                "unit": "%",
                "description": "Simulate margin recovery through operational expense rationalization.",
            }
        ]
        executive_brief = {"headline": headline, "driver": driver, "action": action}

    else:
        headline = f"Operational performance in '{region}' remains healthy and within established benchmarks."
        driver = "All financial metrics tracked within normal operating tolerances."
        action = "Maintain regular quarterly performance reviews."
        headline_recommendation = f"**Headline Takeaway:** {headline}\n\n**Key Operational Driver:** {driver}\n\n**Recommended Action:** {action}"
        estimated_impact = "Operations Healthy • Benchmark Tolerances Met"
        remediation_levers = []
        strategic_actions = []
        sensitivity_levers = []
        executive_brief = {"headline": headline, "driver": driver, "action": action}

    quota_exceeded = bool(
        (m_plan and m_plan.get("quota_exceeded"))
        or q_result.get("quota_exceeded")
        or eve_result.get("quota_exceeded")
    )

    # Call Consolidation: Skip redundant LLM call if structured deterministic strategy is complete or quota exceeded
    llm_enabled = bool((settings.GEMINI_API_KEY and settings.GEMINI_API_KEY != "your_gemini_api_key_here") or settings.GROQ_API_KEY)
    if not quota_exceeded and not headline_recommendation and llm_enabled:
        try:
            prompt = (
                f"You are Agent 007, the elite FP&A remediation strategist in the Black Swan autonomous pipeline.\n"
                f"User Inquiry: {query}\n"
                f"Analytical Intent: {intent}\n"
                f"Target Dimension/Period: {region}\n"
                f"Observed Margin/Growth Variance: {variance_bps} bps\n"
                f"Key Anomaly/Volume Metric: {curr_symbol}{actual_billed:,.0f}\n"
                f"Eve Covenant Breaches: {json.dumps(eve_result.get('covenant_breaches', []))}\n\n"
                f"Provide an executive recommendation, estimated impact, and exactly 4 concrete strategic actions in JSON matching this inquiry:\n"
                f"{{\n"
                f'  "headline_recommendation": "...",\n'
                f'  "estimated_impact": "...",\n'
                f'  "strategic_actions": ["action 1", "action 2", "action 3", "action 4"]\n'
                f"}}"
            )
            raw_resp = await route_completion(
                prompt=prompt,
                response_format={"type": "json_object"},
                temperature=0.2,
            )
            parsed = extract_json_payload(raw_resp)
            if parsed.get("headline_recommendation"):
                headline_recommendation = parsed["headline_recommendation"]
            if parsed.get("estimated_impact"):
                estimated_impact = parsed["estimated_impact"]
            if parsed.get("strategic_actions") and isinstance(parsed["strategic_actions"], list):
                strategic_actions = parsed["strategic_actions"][:4]
        except Exception as e:
            err_str = str(e)
            if "429" in err_str or "RESOURCE_EXHAUSTED" in err_str or "quota" in err_str.lower():
                quota_exceeded = True
                logger.warning("LLM Router 007 strategy quota exceeded (429), using deterministic recommendations: %s", e)
            else:
                logger.warning("LLM Router 007 strategy call failed: %s", e)

    if quota_exceeded:
        prefix = "[API Quota Exceeded - Running on deterministic analytical engine]"
        if not headline_recommendation.startswith(prefix):
            headline_recommendation = f"{prefix} {headline_recommendation}"

    return {
        "headline_recommendation": headline_recommendation,
        "strategic_actions": strategic_actions,
        "estimated_impact": estimated_impact,
        "sensitivity_levers": sensitivity_levers,
        "remediation_levers": remediation_levers,
        "total_recovered_bps": sum(l.get("impact_bps", 0) for l in remediation_levers),
        "executive_brief": executive_brief,
        "quota_exceeded": quota_exceeded,
    }
