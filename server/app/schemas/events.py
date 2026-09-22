"""Server-Sent Events (SSE) schemas for Black Swan streaming execution trace."""

from datetime import datetime, timezone
from typing import Any, Dict, Literal
from pydantic import BaseModel, ConfigDict, Field


class SSEStreamEvent(BaseModel):
    """Normalized SSE event payload streamed from the agent orchestrator to clients."""
    model_config = ConfigDict(extra="allow")

    event_type: Literal[
        "m_plan",
        "q_diagnostic",
        "eve_audit",
        "007_strategy",
        "status_update",
        "error",
    ]
    agent: Literal["M", "Q", "Eve", "007", "System"]
    payload: Dict[str, Any] = Field(
        default_factory=dict,
        description="Structured payload corresponding to the event_type and emitting agent",
    )
    timestamp: str = Field(
        default_factory=lambda: datetime.now(timezone.utc).isoformat(),
        description="ISO 8601 UTC timestamp of event generation",
    )
