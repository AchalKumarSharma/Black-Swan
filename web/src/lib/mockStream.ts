/**
 * Deterministic Mock Streaming Harness for Black Swan Stage 1.
 * Simulates real-time Server-Sent Events (SSE) across the 4-agent FP&A team:
 * M (Orchestrator) -> Q (Diagnostics) -> Eve (Audit & Viz) -> 007 (Strategy).
 */

import {
  SSEStreamEvent,
  M_Plan,
  Q_Diagnostic,
  Eve_Audit,
  Agent007_Strategy,
} from "@/types/contracts";

export interface StreamController {
  cancel: () => void;
}

export function runMockAnalysis(
  query: string,
  onEvent: (event: SSEStreamEvent) => void,
  onComplete?: () => void,
  onError?: (err: Error) => void
): StreamController {
  let isCancelled = false;
  const timeoutIds: ReturnType<typeof setTimeout>[] = [];

  const schedule = (delayMs: number, fn: () => void) => {
    const id = setTimeout(() => {
      if (!isCancelled) {
        fn();
      }
    }, delayMs);
    timeoutIds.push(id);
  };

  try {
    // -------------------------------------------------------------------------
    // T+0.0s: M Orchestrator Initiates Decomposition
    // -------------------------------------------------------------------------
    schedule(100, () => {
      onEvent({
        event_type: "status_update",
        agent: "M",
        payload: {
          status: "active",
          stage: "m_plan",
          message: "M: Decomposing inquiry into deterministic subtasks...",
        },
        timestamp: new Date().toISOString(),
      });
    });

    // -------------------------------------------------------------------------
    // T+1.2s: M Plan Emitted
    // -------------------------------------------------------------------------
    schedule(1200, () => {
      const planPayload: M_Plan = {
        task_id: `task-${Date.now().toString().slice(-6)}`,
        user_query: query || "Why did Gross Margin drop in Q2?",
        subtasks: [
          {
            step_id: "step-1",
            agent_assigned: "Q",
            goal: "Ingest regional GL ledgers into in-memory DuckDB, isolate revenue vs COGS by territory, and compute variance deltas.",
          },
          {
            step_id: "step-2",
            agent_assigned: "Eve",
            goal: "Synthesize Recharts visual spec, compile plain-language formula receipts, and calculate deterministic confidence score.",
          },
          {
            step_id: "step-3",
            agent_assigned: "007",
            goal: "Formulate executive remedial actions and parameterize bounded what-if sensitivity levers for margin recovery.",
          },
        ],
        status: "executing",
      };

      onEvent({
        event_type: "m_plan",
        agent: "M",
        payload: planPayload,
        timestamp: new Date().toISOString(),
      });

      // Switch active state to Q
      onEvent({
        event_type: "status_update",
        agent: "Q",
        payload: {
          status: "active",
          stage: "q_diagnostic",
          message: "Q: Executing DuckDB query on SaaS_Q2_Financials.csv...",
        },
        timestamp: new Date().toISOString(),
      });
    });

    // -------------------------------------------------------------------------
    // T+2.5s: Q Diagnostic Delivered
    // -------------------------------------------------------------------------
    schedule(2500, () => {
      const diagnosticPayload: Q_Diagnostic = {
        table_headers: [
          "region",
          "q1_revenue",
          "q2_revenue",
          "revenue_delta_pct",
          "q1_cogs",
          "q2_cogs",
          "cogs_delta_pct",
          "q1_gm_pct",
          "q2_gm_pct",
          "gm_variance_bps",
        ],
        rows: [
          {
            region: "North America",
            q1_revenue: 1420000,
            q2_revenue: 1450000,
            revenue_delta_pct: 2.11,
            q1_cogs: 820000,
            q2_cogs: 845000,
            cogs_delta_pct: 3.05,
            q1_gm_pct: 42.25,
            q2_gm_pct: 41.72,
            gm_variance_bps: -53,
          },
          {
            region: "South (LATAM)",
            q1_revenue: 880000,
            q2_revenue: 770000,
            revenue_delta_pct: -12.5,
            q1_cogs: 495000,
            q2_cogs: 525000,
            cogs_delta_pct: 6.06,
            q1_gm_pct: 43.75,
            q2_gm_pct: 31.82,
            gm_variance_bps: -1193,
          },
          {
            region: "EMEA (East)",
            q1_revenue: 1150000,
            q2_revenue: 1210000,
            revenue_delta_pct: 5.22,
            q1_cogs: 660000,
            q2_cogs: 690000,
            cogs_delta_pct: 4.55,
            q1_gm_pct: 42.61,
            q2_gm_pct: 42.98,
            gm_variance_bps: 37,
          },
          {
            region: "APAC (West)",
            q1_revenue: 960000,
            q2_revenue: 980000,
            revenue_delta_pct: 2.08,
            q1_cogs: 540000,
            q2_cogs: 555000,
            cogs_delta_pct: 2.78,
            q1_gm_pct: 43.75,
            q2_gm_pct: 43.37,
            gm_variance_bps: -38,
          },
        ],
        summary_findings: [
          "Enterprise Gross Margin compressed from 42.97% in Q1 to 39.86% in Q2 (-311 bps aggregate contraction).",
          "South Region (LATAM) accounts for 88.4% of total margin variance (-1,193 bps contraction).",
          "South Region COGS expanded by +6.06% despite a -12.50% drop in regional top-line volume.",
        ],
        executed_sql: `SELECT 
    region,
    sum(case when quarter = 'Q1-2026' then revenue end) AS q1_revenue,
    sum(case when quarter = 'Q2-2026' then revenue end) AS q2_revenue,
    round(((sum(case when quarter = 'Q2-2026' then revenue end) - sum(case when quarter = 'Q1-2026' then revenue end)) / sum(case when quarter = 'Q1-2026' then revenue end)) * 100, 2) AS revenue_delta_pct,
    sum(case when quarter = 'Q1-2026' then cogs end) AS q1_cogs,
    sum(case when quarter = 'Q2-2026' then cogs end) AS q2_cogs,
    round(((sum(case when quarter = 'Q2-2026' then cogs end) - sum(case when quarter = 'Q1-2026' then cogs end)) / sum(case when quarter = 'Q1-2026' then cogs end)) * 100, 2) AS cogs_delta_pct,
    round(((sum(case when quarter = 'Q1-2026' then revenue end) - sum(case when quarter = 'Q1-2026' then cogs end)) / sum(case when quarter = 'Q1-2026' then revenue end)) * 100, 2) AS q1_gm_pct,
    round(((sum(case when quarter = 'Q2-2026' then revenue end) - sum(case when quarter = 'Q2-2026' then cogs end)) / sum(case when quarter = 'Q2-2026' then revenue end)) * 100, 2) AS q2_gm_pct,
    round((((sum(case when quarter = 'Q2-2026' then revenue end) - sum(case when quarter = 'Q2-2026' then cogs end)) / sum(case when quarter = 'Q2-2026' then revenue end)) - 
           ((sum(case when quarter = 'Q1-2026' then revenue end) - sum(case when quarter = 'Q1-2026' then cogs end)) / sum(case when quarter = 'Q1-2026' then revenue end))) * 10000, 0) AS gm_variance_bps
FROM read_csv_auto('datasets/SaaS_Q2_Financials.csv')
GROUP BY region
ORDER BY gm_variance_bps ASC;`,
        execution_time_ms: 38.4,
        anomalies_detected: [
          {
            field: "South Region COGS",
            expected: 433000,
            actual: 525000,
            delta_pct: 21.25,
            direction: "unfavorable",
            cause: "Supplier customs escalation fee & unhedged spot logistics surge",
          },
        ],
      };

      onEvent({
        event_type: "q_diagnostic",
        agent: "Q",
        payload: diagnosticPayload,
        timestamp: new Date().toISOString(),
      });

      // Switch active state to Eve
      onEvent({
        event_type: "status_update",
        agent: "Eve",
        payload: {
          status: "active",
          stage: "eve_audit",
          message: "Eve: Building Recharts visualization and formula ledger...",
        },
        timestamp: new Date().toISOString(),
      });
    });

    // -------------------------------------------------------------------------
    // T+4.2s: Eve Audit & Visualization Delivered
    // -------------------------------------------------------------------------
    schedule(4200, () => {
      const auditPayload: Eve_Audit = {
        chart_spec: {
          chart_type: "bar",
          x_axis_key: "region",
          series: [
            { key: "q1_gm_pct", label: "Q1 Gross Margin %", color_role: "comparison" },
            { key: "q2_gm_pct", label: "Q2 Gross Margin %", color_role: "primary" },
          ],
          title: "Regional Gross Margin Trajectory (Q1 vs Q2 2026)",
        },
        formula_ledger: [
          {
            metric: "Regional Gross Margin %",
            formula: "((Revenue - COGS) / Revenue) * 100",
            computation_step: "South Q2: (($770,000 - $525,000) / $770,000) * 100 = 31.82%",
          },
          {
            metric: "Gross Margin Variance (bps)",
            formula: "(Q2_GM_Pct - Q1_GM_Pct) * 10,000",
            computation_step: "South Delta: (31.82% - 43.75%) * 10,000 = -1,193 bps",
          },
          {
            metric: "Normalized Volume COGS Expected",
            formula: "Q1_COGS * (1 + Revenue_Delta_Pct)",
            computation_step: "$495,000 * (1 - 0.125) = $433,125 Expected vs $525,000 Actual (+$91,875 excess burden)",
          },
        ],
        assumptions: [
          "All regional figures are converted to USD at average quarterly interbank exchange rates.",
          "COGS excludes depreciation and amortized software development capitalizations.",
          "Contracted minimum freight volume penalties were incurred in June 2026 due to regional port congestion.",
        ],
        confidence_score: 0.994, // 99.4%
        plain_language_narrative:
          "Audit verification confirms that South Region (LATAM) is the single material cause of enterprise gross margin erosion. While North America and EMEA maintained margins within ±50 bps of forecast, South region suffered a +$91,875 unbudgeted COGS surcharge driven by emergency spot logistics rerouting.",
      };

      onEvent({
        event_type: "eve_audit",
        agent: "Eve",
        payload: auditPayload,
        timestamp: new Date().toISOString(),
      });

      // Switch active state to 007
      onEvent({
        event_type: "status_update",
        agent: "007",
        payload: {
          status: "active",
          stage: "007_strategy",
          message: "007: Synthesizing corrective actions and sensitivity levers...",
        },
        timestamp: new Date().toISOString(),
      });
    });

    // -------------------------------------------------------------------------
    // T+5.8s: 007 Strategy Delivered
    // -------------------------------------------------------------------------
    schedule(5800, () => {
      const strategyPayload: Agent007_Strategy = {
        headline_recommendation:
          "Consolidate South Region freight tenders and renegotiate SLA volume floors to immediately recover 145 bps of consolidated gross margin.",
        strategic_actions: [
          "Invoke the Force Majeure clause on South logistics surcharge rider (effective 1st of next month) to cap freight spot rates at 110% of benchmark.",
          "Shift 35% of LATAM distribution volume to bonded customs warehousing in Panama to eliminate Brazilian demurrage fees.",
          "Introduce a 4.5% logistics surcharge on expedited orders under $15,000 order value in the South territory.",
          "Implement monthly dynamic fuel index hedging across Tier-1 carriers starting Q3.",
        ],
        estimated_impact: "+$180k operating cash flow per quarter • +145 bps gross margin recovery",
        sensitivity_levers: [
          {
            id: "south_cogs_adjustment",
            label: "South Region COGS Adjustment",
            min_val: -20,
            max_val: 10,
            default_val: -12,
            unit: "%",
            step: 1,
          },
        ],
      };

      onEvent({
        event_type: "007_strategy",
        agent: "007",
        payload: strategyPayload,
        timestamp: new Date().toISOString(),
      });
    });

    // -------------------------------------------------------------------------
    // T+6.0s: Execution Completed
    // -------------------------------------------------------------------------
    schedule(6000, () => {
      onEvent({
        event_type: "status_update",
        agent: "System",
        payload: {
          status: "completed",
          message: "Analysis assembled with 100% deterministic receipt auditability.",
        },
        timestamp: new Date().toISOString(),
      });
      if (onComplete) onComplete();
    });
  } catch (err: any) {
    if (onError) onError(err);
  }

  return {
    cancel: () => {
      isCancelled = true;
      timeoutIds.forEach((id) => clearTimeout(id));
      onEvent({
        event_type: "status_update",
        agent: "System",
        payload: {
          status: "failed",
          message: "Analysis was aborted by user.",
        },
        timestamp: new Date().toISOString(),
      });
    },
  };
}
