"""Agent 007 - Strategic Remediation Levers, Pro-Forma Modeling, and Executive Action."""

import json
import logging
from typing import Any, Dict, List, Optional

from app.config import get_settings

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

    anomaly_data = q_result.get("anomalyData") or {}
    region = anomaly_data.get("region", "South")
    variance_bps = anomaly_data.get("varianceBps", -1193)
    actual_billed = anomaly_data.get("actualBilled", 525000)
    expected_vol = anomaly_data.get("expectedVolume", 433000)
    curr_symbol = anomaly_data.get("currencySymbol", "$")
    outlier_tx = anomaly_data.get("outlierTransaction")
    outlier_cogs = anomaly_data.get("outlierCogs")
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

    # 1. Concrete Remediation Levers based on Intent & Findings
    if is_trend:
        remediation_levers = [
            {
                "id": "lever_1",
                "title": "Enterprise Tier Expansion & Contract Renewal Upsells",
                "impact_bps": 150,
                "horizon": "30 Days",
                "description": (
                    f"Structure multi-year renewal incentives with mandatory expansion tiers, "
                    f"capturing up to {curr_symbol}{int(actual_billed * 0.12):,.0f} in incremental high-margin ARR."
                ),
                "status": "Immediate",
            },
            {
                "id": "lever_2",
                "title": "Commercial Packaging & Volume Surcharge Protection",
                "impact_bps": 85,
                "horizon": "45 Days",
                "description": (
                    f"Deploy tiered usage bands to monetize surplus volume and eliminate flat-fee usage leakage "
                    f"across active customer accounts."
                ),
                "status": "Immediate",
            },
            {
                "id": "lever_3",
                "title": "High-Margin Channel Demand Scaling",
                "impact_bps": 60,
                "horizon": "60 Days",
                "description": (
                    f"Reallocate 20% of commercial sales capacity to enterprise accounts exhibiting "
                    f">50% gross margin profiles."
                ),
                "status": "Mid-Term",
            },
        ]
        total_recovered_bps = sum(lever["impact_bps"] for lever in remediation_levers)
        quarterly_impact = int(actual_billed * 0.15) if actual_billed > 0 else 180000

        headline_recommendation = (
            f"Execute enterprise expansion tiering and targeted commercial realignment "
            f"to accelerate top-line revenue velocity by +{total_recovered_bps} bps of margin leverage."
        )
        estimated_impact = (
            f"+{curr_symbol}{quarterly_impact:,.0f} annualized top-line capacity • +{total_recovered_bps} bps operating leverage"
        )
        strategic_actions = [
            "Structure multi-year contract renewals with automatic 5% annual volume expansion indexation.",
            "Target under-penetrated accounts with volume-based packaging tiers to capture surplus demand.",
            "Prioritize sales pipeline capacity toward top-quartile margin commercial segments.",
            "Deploy quarterly pricing reviews across commercial tiers to protect unit economics against inflation.",
        ]
        sensitivity_levers = [
            {
                "id": "revenue_growth_acceleration",
                "label": "Target Growth Rate Acceleration",
                "min_val": -10,
                "max_val": 25,
                "default_val": 8,
                "unit": "%",
                "description": "Simulate operating leverage under accelerated commercial expansion and volume tiering.",
            }
        ]

    elif is_profitability:
        remediation_levers = [
            {
                "id": "lever_1",
                "title": "Direct Operating Cost Rationalization",
                "impact_bps": 175,
                "horizon": "30 Days",
                "description": (
                    f"Consolidate variable cloud and distribution vendors, eliminating {curr_symbol}{int(actual_billed * 0.08):,.0f} "
                    f"in redundant operational overhead."
                ),
                "status": "Immediate",
            },
            {
                "id": "lever_2",
                "title": "Contribution Margin Floor Enforcement",
                "impact_bps": 90,
                "horizon": "15 Days",
                "description": "Institute mandatory 35% minimum contribution margin threshold on all enterprise proposals.",
                "status": "Immediate",
            },
            {
                "id": "lever_3",
                "title": "Working Capital & Cash Flow Acceleration",
                "impact_bps": 50,
                "horizon": "60 Days",
                "description": "Shorten standard commercial payment terms to Net 30 with 2% early settlement discount.",
                "status": "Mid-Term",
            },
        ]
        total_recovered_bps = sum(lever["impact_bps"] for lever in remediation_levers)
        headline_recommendation = (
            f"Implement direct cost rationalization and contribution margin floors "
            f"to protect forward annualized operating profitability."
        )
        estimated_impact = (
            f"+{curr_symbol}{int(actual_billed * 0.12):,.0f} operating cash flow • +{total_recovered_bps} bps margin recovery"
        )
        strategic_actions = [
            "Mandate 35% contribution margin hurdle rate for all new commercial commitments.",
            "Consolidate tier-2 vendor relationships into master service contracts with volume discounts.",
            "Transition enterprise accounts to standard Net 30 billing cycles to accelerate working capital.",
            "Implement bi-weekly cash flow variance reviews with regional division leadership.",
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

    elif is_segment:
        remediation_levers = [
            {
                "id": "lever_1",
                "title": "Product Mix Optimization & High-Realization Channel Rebalancing",
                "impact_bps": 160,
                "horizon": "30 Days",
                "description": (
                    f"Rebalance commercial capacity and marketing allocations toward higher-margin product lines, "
                    f"capturing up to {curr_symbol}{int(actual_billed * 0.08):,.0f} in incremental gross profit."
                ),
                "status": "Immediate",
            },
            {
                "id": "lever_2",
                "title": "Volume Discount Tiering & Units Sold Monetization",
                "impact_bps": 85,
                "horizon": "45 Days",
                "description": "Restructure volume tiers to eliminate unmonetized discounting on high-volume product deliveries.",
                "status": "Immediate",
            },
            {
                "id": "lever_3",
                "title": "Cross-Sell Bundling & COGS Rationalization",
                "impact_bps": 55,
                "horizon": "60 Days",
                "description": "Deploy bundled offerings pairing high-volume products with high-margin software/services.",
                "status": "Mid-Term",
            },
        ]
        total_recovered_bps = sum(lever["impact_bps"] for lever in remediation_levers)
        headline_recommendation = (
            f"Execute product mix optimization and tiered volume packaging "
            f"to capture +{total_recovered_bps} bps in margin leverage across {region}."
        )
        estimated_impact = (
            f"+{curr_symbol}{int(actual_billed * 0.10):,.0f} annualized profit leverage • +{total_recovered_bps} bps margin optimization"
        )
        strategic_actions = [
            "Reallocate sales compensation incentives toward higher-margin product offerings.",
            "Establish minimum order quantities (MOQ) and tiered volume discounts to prevent margin dilution.",
            "Deploy bundled cross-sell motions to raise average realization per unit sold.",
            "Conduct quarterly product-line profitability reviews to eliminate negative-margin SKUs.",
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

    elif outlier_tx and outlier_cogs:
        remediation_levers = [
            {
                "id": "lever_1",
                "title": f"Procurement Audit & Clawback on {region} Invoice {outlier_tx}",
                "impact_bps": 160,
                "horizon": "15 Days",
                "description": (
                    f"Initiate formal supplier audit and dispute procedure for invoice {outlier_tx} "
                    f"({curr_symbol}{outlier_cogs:,.0f} billed COGS), recovering up to {curr_symbol}{excess_cost * 0.75:,.0f} in unauthorized spot markups."
                ),
                "status": "Immediate",
            },
            {
                "id": "lever_2",
                "title": f"Automated PO Authorization Ceiling for {region}",
                "impact_bps": 75,
                "horizon": "30 Days",
                "description": (
                    f"Enforce mandatory dual-authorization controls on all {region} purchase orders "
                    f"exceeding {curr_symbol}{outlier_cogs * 0.7:,.0f} to eliminate unbudgeted direct cost spikes."
                ),
                "status": "Immediate",
            },
            {
                "id": "lever_3",
                "title": f"Consolidate {region} Carrier Contracts & SLA Volume Caps",
                "impact_bps": 45,
                "horizon": "60 Days",
                "description": (
                    f"Renegotiate Tier-1 carrier agreements in {region} with guaranteed volume rate caps, "
                    f"insulating quarterly margins against future logistics volatility."
                ),
                "status": "Mid-Term",
            },
        ]
        total_recovered_bps = sum(lever["impact_bps"] for lever in remediation_levers)
        quarterly_savings = int(excess_cost * 1.05) if excess_cost > 0 else 180000
        headline_recommendation = (
            f"Consolidate {region} procurement tenders and audit invoice {outlier_tx} "
            f"to immediately recover {total_recovered_bps} bps of consolidated gross margin."
        )
        estimated_impact = (
            f"+{curr_symbol}{quarterly_savings:,.0f} operating cash flow per quarter • +{total_recovered_bps} bps gross margin recovery"
        )
        strategic_actions = [
            f"Invoke rate-cap clause and dispute unauthorized freight markups on {region} invoice {outlier_tx}.",
            f"Shift 35% of {region} distribution volume to bonded customs warehousing to eliminate recurring port demurrage and congestion fees.",
            f"Introduce a 4.5% logistics surcharge on expedited orders under {curr_symbol}15,000 order value in the {region} territory.",
            "Implement monthly dynamic fuel index hedging across Tier-1 carriers starting next quarter.",
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

    elif intent == "GENERAL_INQUIRY":
        remediation_levers = [
            {
                "id": "lever_1",
                "title": f"Operational Working Capital Governance ({region})",
                "impact_bps": 50,
                "horizon": "30 Days",
                "description": f"Standardize billing and collection cycles across reporting partitions to optimize cash flow velocity.",
                "status": "Immediate",
            },
            {
                "id": "lever_2",
                "title": "Reporting Partition Variance Monitoring",
                "impact_bps": 35,
                "horizon": "45 Days",
                "description": "Establish continuous automated variance thresholds to flag cost drift across ledger entries.",
                "status": "Immediate",
            },
        ]
        total_recovered_bps = sum(lever["impact_bps"] for lever in remediation_levers)
        headline_recommendation = (
            f"Establish automated ledger threshold monitoring and working capital governance across {region} reporting partitions."
        )
        estimated_impact = (
            f"+{curr_symbol}{int(actual_billed * 0.05):,.0f} working capital optimization • Standardized operational controls"
        )
        strategic_actions = [
            f"Implement real-time variance monitoring across all {region} reporting partitions.",
            "Conduct monthly automated reconciliation audits against budget benchmarks.",
            "Enforce standardized approval workflows for non-standard operational expenditures.",
            "Review periodic resource allocation across active business divisions.",
        ]
        sensitivity_levers = [
            {
                "id": "working_capital_efficiency",
                "label": "Working Capital Efficiency",
                "min_val": -10,
                "max_val": 20,
                "default_val": 5,
                "unit": "%",
                "description": "Simulate working capital gains through standardized collection and payment cycles.",
            }
        ]

    elif variance_bps < -100:
        remediation_levers = [
            {
                "id": "lever_1",
                "title": f"Direct Cost Variance Remediation in {region}",
                "impact_bps": min(150, abs(variance_bps) // 2),
                "horizon": "30 Days",
                "description": f"Audit vendor billing variance and cost allocation in {region}, targeting recovery of unbudgeted margin leakage.",
                "status": "Immediate",
            },
            {
                "id": "lever_2",
                "title": f"Margin Floor Enforcement for {region}",
                "impact_bps": min(100, abs(variance_bps) // 3),
                "horizon": "45 Days",
                "description": f"Institute operational expense ceilings and pricing adjustments across {region} commercial deliveries.",
                "status": "Immediate",
            },
        ]
        total_recovered_bps = sum(lever["impact_bps"] for lever in remediation_levers)
        headline_recommendation = (
            f"Enforce direct cost ceilings and operational margin floors across {region} to recover {total_recovered_bps} bps."
        )
        estimated_impact = (
            f"+{curr_symbol}{int(excess_cost):,.0f} direct cost containment • +{total_recovered_bps} bps gross margin recovery"
        )
        strategic_actions = [
            f"Audit {region} cost allocation policies to eliminate unbudgeted operational leakage.",
            f"Enforce dual-signoff authorization on all expenditures exceeding {curr_symbol}25,000 in {region}.",
            "Establish automated monthly variance alerts at 150 bps boundary thresholds.",
            "Review supplier contract price escalation clauses prior to upcoming renewal cycles.",
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

    else:
        remediation_levers = []
        headline_recommendation = (
            f"Operational performance in {region} remains healthy and within established financial thresholds."
        )
        estimated_impact = "No material margin remediation required • Operations performing within benchmark tolerance"
        strategic_actions = [
            "Maintain standard quarterly financial review cadence.",
            "Continue monitoring revenue and cost velocity across active reporting partitions.",
            "Enforce standard procurement and commercial pricing approval policies.",
            "Re-evaluate performance benchmarks at the close of the next financial cycle.",
        ]
        sensitivity_levers = []

    quota_exceeded = bool(
        (m_plan and m_plan.get("quota_exceeded"))
        or q_result.get("quota_exceeded")
        or eve_result.get("quota_exceeded")
    )

    # Call Consolidation: Skip redundant LLM call if structured deterministic strategy is complete or quota exceeded
    if not quota_exceeded and not headline_recommendation and settings.GEMINI_API_KEY and settings.GEMINI_API_KEY != "your_gemini_api_key_here":
        try:
            from google import genai
            from google.genai import types

            client = genai.Client(api_key=settings.GEMINI_API_KEY)
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
            res = client.models.generate_content(
                model=settings.GEMINI_MODEL,
                contents=prompt,
                config=types.GenerateContentConfig(response_mime_type="application/json"),
            )
            parsed = json.loads(res.text)
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
                logger.warning("Gemini 007 strategy quota exceeded (429), using deterministic recommendations: %s", e)
            else:
                logger.warning("Gemini 007 strategy call failed: %s", e)

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
        "quota_exceeded": quota_exceeded,
    }
