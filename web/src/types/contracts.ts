/**
 * Core data contracts for Black Swan FP&A agents (M, Q, Eve, 007).
 * Strict 1:1 TypeScript parity with Python Pydantic V2 models.
 */

// -----------------------------------------------------------------------------
// Sub-types & Supporting Interfaces
// -----------------------------------------------------------------------------

export interface Subtask {
  step_id: string;
  agent_assigned: string;
  goal: string;
  [key: string]: string;
}

export interface AnomalyDetected {
  field: string;
  expected: any;
  actual: any;
  delta_pct: number;
  [key: string]: any;
}

export interface ChartSeries {
  key: string;
  label: string;
  color_role: string;
  [key: string]: string;
}

export type ChartType = "line" | "bar" | "area" | "waterfall";

export interface ChartSpec {
  chart_type: ChartType;
  x_axis_key: string;
  series: Array<ChartSeries | Record<string, string>>;
  title: string;
  [key: string]: any;
}

export interface FormulaLedgerEntry {
  metric: string;
  formula: string;
  computation_step: string;
  [key: string]: string;
}

export interface SensitivityLever {
  id: string;
  label: string;
  min_val: number;
  max_val: number;
  default_val: number;
  unit: string;
  step: number;
  [key: string]: any;
}

// -----------------------------------------------------------------------------
// Agent Primary Contracts
// -----------------------------------------------------------------------------

export type M_PlanStatus = "planning" | "executing" | "completed" | "failed";

export interface M_Plan {
  task_id: string;
  user_query: string;
  intent?: string;
  hypotheses?: string[];
  required_metrics?: string[];
  sql_objective?: string;
  strategic_focus?: string;
  subtasks: Array<Record<string, string>>;
  status: M_PlanStatus;
  [key: string]: any;
}

export interface Q_Diagnostic {
  table_headers: string[];
  rows: Array<Record<string, any>>;
  summary_findings: string[];
  executed_sql: string;
  execution_time_ms: number;
  anomalies_detected: Array<Record<string, any>>;
  [key: string]: any;
}

export interface Eve_Audit {
  chart_spec: {
    chart_type: ChartType;
    x_axis_key: string;
    series: Array<Record<string, string>>;
    title: string;
    [key: string]: any;
  };
  formula_ledger: Array<Record<string, string>>;
  assumptions: string[];
  confidence_score: number; // 0.0 to 1.0
  plain_language_narrative: string;
  [key: string]: any;
}

/**
 * NAMING NOTE: Agent007_Strategy is deliberately named this way (not 007_Strategy)
 * because TypeScript and Python identifiers cannot start with a digit.
 */
export interface Agent007_Strategy {
  headline_recommendation: string;
  strategic_actions: string[];
  estimated_impact: string;
  sensitivity_levers: Array<Record<string, any>>;
  [key: string]: any;
}

// -----------------------------------------------------------------------------
// SSE Stream Event & Report Block
// -----------------------------------------------------------------------------

export type SSEEventType =
  | "m_plan"
  | "q_diagnostic"
  | "eve_audit"
  | "007_strategy"
  | "status_update"
  | "out_of_scope"
  | "pipeline_complete"
  | "error";

export type AgentRole = "M" | "Q" | "Eve" | "007" | "System";

export interface SSEStreamEvent {
  event_type: SSEEventType;
  agent: AgentRole;
  payload: Record<string, any>;
  timestamp: string;
}

export interface ReportBlock {
  id: string;
  query: string;
  timestamp: string;
  mPlan: M_Plan | null;
  qDiagnostic: Q_Diagnostic | null;
  eveAudit: Eve_Audit | null;
  strategy007: Agent007_Strategy | null;
  outOfScope?: {
    refusal_message: string;
    suggested_queries: string[];
  } | null;
  quotaExceeded?: boolean;
}
