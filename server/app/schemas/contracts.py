"""Core data contracts for Black Swan FP&A agents (M, Q, Eve, 007).

Strict Pydantic V2 models defining the structured inter-agent data flow.
"""

from typing import Any, Dict, List, Literal
from pydantic import BaseModel, ConfigDict, Field


# -----------------------------------------------------------------------------
# Sub-models & Supporting Types
# -----------------------------------------------------------------------------

class Subtask(BaseModel):
    """Sub-task allocated by M Orchestrator."""
    model_config = ConfigDict(extra="allow")

    step_id: str
    agent_assigned: str
    goal: str


class AnomalyDetected(BaseModel):
    """Diagnostic variance anomaly detected by Q."""
    model_config = ConfigDict(extra="allow")

    field: str
    expected: Any
    actual: Any
    delta_pct: float


class ChartSeries(BaseModel):
    """Series specification for Recharts visualization."""
    model_config = ConfigDict(extra="allow")

    key: str
    label: str
    color_role: str


class ChartSpec(BaseModel):
    """Chart specification produced by Eve."""
    model_config = ConfigDict(extra="allow")

    chart_type: Literal["line", "bar", "area", "waterfall"]
    x_axis_key: str
    series: List[Dict[str, str]]
    title: str


class FormulaLedgerEntry(BaseModel):
    """Plain-language formula verification ledger entry."""
    model_config = ConfigDict(extra="allow")

    metric: str
    formula: str
    computation_step: str


class SensitivityLever(BaseModel):
    """Dynamic what-if sensitivity slider parameters for Agent007."""
    model_config = ConfigDict(extra="allow")

    id: str
    label: str
    min_val: float
    max_val: float
    default_val: float
    unit: str
    step: float


# -----------------------------------------------------------------------------
# Agent Primary Contracts
# -----------------------------------------------------------------------------

class M_Plan(BaseModel):
    """Orchestrator plan: decomposes query, allocates subtasks, and tracks execution status."""
    model_config = ConfigDict(extra="allow")

    task_id: str
    user_query: str
    subtasks: List[Dict[str, str]] = Field(
        ...,
        description="Subtasks containing step_id, agent_assigned, and goal",
    )
    status: Literal["planning", "executing", "completed", "failed"]


class Q_Diagnostic(BaseModel):
    """Data & Diagnostics output: executed SQL, tabular output, and variance anomalies."""
    model_config = ConfigDict(extra="allow")

    table_headers: List[str]
    rows: List[Dict[str, Any]]
    summary_findings: List[str]
    executed_sql: str
    execution_time_ms: float
    anomalies_detected: List[Dict[str, Any]] = Field(
        ...,
        description="Anomalies containing field, expected, actual, delta_pct",
    )


class Eve_Audit(BaseModel):
    """Audit & Visualization output: chart specs, formula receipts, assumptions, and confidence."""
    model_config = ConfigDict(extra="allow")

    chart_spec: ChartSpec
    formula_ledger: List[Dict[str, str]] = Field(
        ...,
        description="Formula ledger entries with metric, formula, and computation_step",
    )
    assumptions: List[str]
    confidence_score: float = Field(
        ...,
        ge=0.0,
        le=1.0,
        description="Confidence score bounded between 0.0 and 1.0",
    )
    plain_language_narrative: str


class Agent007_Strategy(BaseModel):
    """Strategy output: executive actions and bounded what-if sensitivity levers."""
    model_config = ConfigDict(extra="allow")

    headline_recommendation: str
    strategic_actions: List[str]
    estimated_impact: str
    sensitivity_levers: List[Dict[str, Any]] = Field(
        ...,
        description="Bounded levers containing id, label, min_val, max_val, default_val, unit, step",
    )
