"""Autonomous Multi-Agent Forensic Investigation API (Director M, Q, Eve, 007)."""

import asyncio
from datetime import datetime, timezone
import json
import logging
import os
import time
import uuid
from typing import Any, AsyncGenerator, Dict, List, Optional

from fastapi import APIRouter, HTTPException, status
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field

from app.agents import run_agent_007, run_agent_q, run_eve_audit, run_m_director
from app.core.duckdb import get_duckdb, register_dataset, sanitize_table_name, table_exists
from app.core.supabase_client import get_supabase_client
import polars as pl

logger = logging.getLogger("blackswan.api.agents")

router = APIRouter(prefix="/agents", tags=["Multi-Agent Pipeline"])


class InvestigateRequest(BaseModel):
    dataset_id: str = Field(..., description="ID of the uploaded dataset")
    query: str = Field(..., description="User financial inquiry")
    workspace_id: Optional[str] = Field(
        "00000000-0000-0000-0000-000000000001", description="Workspace ID"
    )
    conversation_history: Optional[List[Dict[str, Any]]] = Field(
        default=None, description="Previous query/analysis context turns"
    )
    session_id: Optional[str] = Field(default=None, description="Client session ID")


def rehydrate_dataset_if_needed(dataset_id: str) -> Dict[str, Any]:
    """Ensure dataset is registered in in-memory DuckDB singleton.

    If missing from DuckDB (e.g. after server restart), reloads from Supabase
    Storage or local sample file. Returns inferred_schema dictionary.
    """
    inferred_schema: Dict[str, Any] = {}
    supabase = get_supabase_client()

    # 1. Fetch metadata and schema from Supabase if available
    storage_path = None
    if supabase:
        try:
            res = (
                supabase.table("datasets")
                .select("storage_path, inferred_schema")
                .eq("id", dataset_id)
                .maybe_single()
                .execute()
            )
            if res.data:
                storage_path = res.data.get("storage_path")
                inferred_schema = res.data.get("inferred_schema") or {}
        except Exception as e:
            logger.warning("Could not fetch dataset metadata from Supabase: %s", e)

    # 2. If table is already in DuckDB, return
    if table_exists(dataset_id):
        return inferred_schema

    logger.info("Table for dataset %s not in DuckDB. Rehydrating...", dataset_id)

    # 3. Try downloading from Supabase storage
    if supabase and storage_path:
        try:
            data = supabase.storage.from_("financial-uploads").download(storage_path)
            if data:
                import io

                if storage_path.lower().endswith((".xlsx", ".xls")):
                    df = pl.read_excel(io.BytesIO(data))
                else:
                    df = pl.read_csv(io.BytesIO(data), ignore_errors=True)
                register_dataset(dataset_id, df)
                logger.info("Successfully rehydrated dataset %s from Supabase storage", dataset_id)
                return inferred_schema
        except Exception as e:
            logger.warning("Failed to download from Supabase storage: %s", e)

    # 4. Fallback: check local sample files
    sample_paths = [
        "/home/alfred/Projects/Black Swan/web/public/SaaS_Q2_Financials.csv",
        "web/public/SaaS_Q2_Financials.csv",
        "../web/public/SaaS_Q2_Financials.csv",
    ]
    for sp in sample_paths:
        if os.path.exists(sp):
            try:
                df = pl.read_csv(sp, ignore_errors=True)
                register_dataset(dataset_id, df)
                logger.info("Rehydrated dataset %s from local sample %s", dataset_id, sp)
                return inferred_schema
            except Exception as e:
                logger.warning("Failed to load local sample: %s", e)

    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail=f"Dataset '{dataset_id}' could not be located in DuckDB or persistent storage.",
    )


def log_audit_trace(
    report_id: str,
    agent_name: str,
    step_name: str,
    input_payload: Dict[str, Any],
    output_payload: Dict[str, Any],
    execution_time_ms: int,
) -> None:
    """Safely log an agent execution step to Supabase audit_traces.

    Execution time is strictly cast to integer to satisfy PostgreSQL integer column type.
    """
    supabase = get_supabase_client()
    if not supabase:
        return
    try:
        supabase.table("audit_traces").insert(
            {
                "report_id": report_id,
                "agent_name": agent_name,
                "step_name": step_name,
                "input_payload": input_payload,
                "output_payload": output_payload,
                "execution_time_ms": int(round(execution_time_ms)),
                "created_at": datetime.now(timezone.utc).isoformat(),
            }
        ).execute()
    except Exception as e:
        logger.warning("Failed to write to Supabase audit_traces: %s", e)


from datetime import date
from decimal import Decimal


def custom_json_serializer(obj: Any) -> Any:
    """Serializer for types not handled by standard json.dumps (Decimal, dates, UUIDs)."""
    if isinstance(obj, Decimal):
        return float(obj)
    if isinstance(obj, (datetime, date)):
        return obj.isoformat()
    if isinstance(obj, uuid.UUID):
        return str(obj)
    raise TypeError(f"Object of type {type(obj).__name__} is not JSON serializable")


def format_sse(event_type: str, agent: str, payload: Dict[str, Any], report_id: str) -> str:
    """Format SSE chunk according to text/event-stream specification."""
    data = {
        "event_type": event_type,
        "agent": agent,
        "payload": payload,
        "report_id": report_id,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }
    return f"event: {event_type}\ndata: {json.dumps(data, default=custom_json_serializer)}\n\n"


@router.post("/investigate")
async def investigate_inquiry(req: InvestigateRequest):
    """Execute autonomous 4-agent investigation and stream results via SSE."""
    inferred_schema = rehydrate_dataset_if_needed(req.dataset_id)

    report_id = str(uuid.uuid4())
    supabase = get_supabase_client()

    # Create initial report entry in Supabase
    if supabase:
        try:
            supabase.table("reports").insert(
                {
                    "id": report_id,
                    "workspace_id": req.workspace_id,
                    "dataset_id": req.dataset_id,
                    "user_query": req.query,
                    "status": "processing",
                    "created_at": datetime.now(timezone.utc).isoformat(),
                    "updated_at": datetime.now(timezone.utc).isoformat(),
                }
            ).execute()
        except Exception as e:
            logger.warning("Failed to create report in Supabase: %s", e)

    async def sse_generator() -> AsyncGenerator[str, None]:
        try:
            # -------------------------------------------------------------
            # STAGE 1: Director M (Strategic Decomposition & Hypothesis)
            # -------------------------------------------------------------
            yield format_sse(
                event_type="status_update",
                agent="M",
                payload={
                    "status": "active",
                    "step": "hypothesis_generation",
                    "message": "Director M: Decomposing inquiry & formulating hypotheses...",
                },
                report_id=report_id,
            )
            await asyncio.sleep(0.05)  # Yield control to flush event

            t0 = time.time()
            m_plan = await run_m_director(
                query=req.query,
                dataset_id=req.dataset_id,
                inferred_schema=inferred_schema,
                conversation_history=req.conversation_history,
            )
            m_duration_ms = int(round((time.time() - t0) * 1000))

            log_audit_trace(
                report_id=report_id,
                agent_name="M",
                step_name="hypothesis_formulation",
                input_payload={"query": req.query, "dataset_id": req.dataset_id},
                output_payload=m_plan,
                execution_time_ms=m_duration_ms,
            )

            yield format_sse(
                event_type="m_plan",
                agent="M",
                payload=m_plan,
                report_id=report_id,
            )
            yield format_sse(
                event_type="status_update",
                agent="M",
                payload={
                    "status": "completed",
                    "timing_ms": m_duration_ms,
                    "message": f"Director M: Strategic plan established ({m_duration_ms}ms)",
                },
                report_id=report_id,
            )
            await asyncio.sleep(0.05)

            # Early Guardrail: If OUT_OF_SCOPE, halt immediately
            if m_plan.get("intent") == "OUT_OF_SCOPE":
                refusal_msg = m_plan.get(
                    "refusal_message",
                    "I cannot answer that question because this workspace is analyzing your financial transaction ledger. You can ask me about revenue trajectories, product sales, or gross margin anomalies."
                )
                yield format_sse(
                    event_type="out_of_scope",
                    agent="M",
                    payload={
                        "refusal_message": refusal_msg,
                        "suggested_queries": [
                            "Why did Gross Margin drop in Q2?",
                            "Compare total revenue and units sold between Product A and Product B",
                            "Is our revenue growing or dropping over time?",
                        ],
                    },
                    report_id=report_id,
                )
                yield format_sse(
                    event_type="status_update",
                    agent="System",
                    payload={
                        "status": "completed",
                        "report_id": report_id,
                        "message": "Inquiry is out of scope for financial transaction ledger analysis.",
                    },
                    report_id=report_id,
                )
                return

            # -------------------------------------------------------------
            # STAGE 2: Agent Q (Forensic DuckDB SQL & Self-Healing Retry)
            # -------------------------------------------------------------
            yield format_sse(
                event_type="status_update",
                agent="Q",
                payload={
                    "status": "active",
                    "step": "sql_execution",
                    "message": "Agent Q: Generating and executing DuckDB forensic SQL...",
                },
                report_id=report_id,
            )
            await asyncio.sleep(0.05)

            t0 = time.time()
            q_result = await run_agent_q(
                query=req.query,
                dataset_id=req.dataset_id,
                m_plan=m_plan,
                inferred_schema=inferred_schema,
            )
            q_duration_ms = int(round((time.time() - t0) * 1000))

            log_audit_trace(
                report_id=report_id,
                agent_name="Q",
                step_name="duckdb_sql_execution",
                input_payload={"m_plan": m_plan},
                output_payload=q_result,
                execution_time_ms=q_duration_ms,
            )

            # Emit both q_diagnostic and q_finding for client flexibility
            yield format_sse(
                event_type="q_diagnostic",
                agent="Q",
                payload=q_result,
                report_id=report_id,
            )
            yield format_sse(
                event_type="status_update",
                agent="Q",
                payload={
                    "status": "completed",
                    "timing_ms": q_duration_ms,
                    "message": f"Agent Q: Root cause isolated with DuckDB ({q_duration_ms}ms)",
                },
                report_id=report_id,
            )
            await asyncio.sleep(0.05)

            # -------------------------------------------------------------
            # STAGE 3: Agent Eve (Adversarial Audit & Covenant Review)
            # -------------------------------------------------------------
            yield format_sse(
                event_type="status_update",
                agent="Eve",
                payload={
                    "status": "active",
                    "step": "covenant_audit",
                    "message": "Agent Eve: Cross-auditing calculations & evaluating covenants...",
                },
                report_id=report_id,
            )
            await asyncio.sleep(0.05)

            t0 = time.time()
            eve_result = await run_eve_audit(
                query=req.query,
                q_result=q_result,
                inferred_schema=inferred_schema,
                m_plan=m_plan,
            )
            eve_duration_ms = int(round((time.time() - t0) * 1000))

            log_audit_trace(
                report_id=report_id,
                agent_name="Eve",
                step_name="covenant_audit_verification",
                input_payload={"q_result_summary": q_result.get("summary_findings")},
                output_payload=eve_result,
                execution_time_ms=eve_duration_ms,
            )

            yield format_sse(
                event_type="eve_audit",
                agent="Eve",
                payload=eve_result,
                report_id=report_id,
            )
            yield format_sse(
                event_type="status_update",
                agent="Eve",
                payload={
                    "status": "completed",
                    "timing_ms": eve_duration_ms,
                    "message": f"Agent Eve: Audit verified & visual specs compiled ({eve_duration_ms}ms)",
                },
                report_id=report_id,
            )
            await asyncio.sleep(0.05)

            # -------------------------------------------------------------
            # STAGE 4: Agent 007 (Remediation Levers & Pro-Forma Modeling)
            # -------------------------------------------------------------
            yield format_sse(
                event_type="status_update",
                agent="007",
                payload={
                    "status": "active",
                    "step": "remediation_synthesis",
                    "message": "Agent 007: Synthesizing pro-forma remediation levers...",
                },
                report_id=report_id,
            )
            await asyncio.sleep(0.05)

            t0 = time.time()
            strategy_007 = await run_agent_007(
                query=req.query,
                q_result=q_result,
                eve_result=eve_result,
                inferred_schema=inferred_schema,
                m_plan=m_plan,
            )
            s_duration_ms = int(round((time.time() - t0) * 1000))

            log_audit_trace(
                report_id=report_id,
                agent_name="007",
                step_name="strategic_levers_modeling",
                input_payload={"anomaly_data": q_result.get("anomalyData")},
                output_payload=strategy_007,
                execution_time_ms=s_duration_ms,
            )

            # Emit both 007_strategy and strategic_levers for client flexibility
            yield format_sse(
                event_type="007_strategy",
                agent="007",
                payload=strategy_007,
                report_id=report_id,
            )
            yield format_sse(
                event_type="status_update",
                agent="007",
                payload={
                    "status": "completed",
                    "timing_ms": s_duration_ms,
                    "message": f"Agent 007: Remediation roadmap synthesized ({s_duration_ms}ms)",
                },
                report_id=report_id,
            )
            await asyncio.sleep(0.05)

            # -------------------------------------------------------------
            # Final Report Persistence & Completion Signal
            # -------------------------------------------------------------
            if supabase:
                try:
                    supabase.table("reports").update(
                        {
                            "status": "completed",
                            "m_plan": m_plan,
                            "q_result": q_result,
                            "eve_audit": eve_result,
                            "strategy_007": strategy_007,
                            "updated_at": datetime.now(timezone.utc).isoformat(),
                        }
                    ).eq("id", report_id).execute()
                except Exception as e:
                    logger.warning("Failed to finalize report in Supabase: %s", e)

            yield format_sse(
                event_type="status_update",
                agent="System",
                payload={
                    "status": "completed",
                    "report_id": report_id,
                    "message": "Autonomous forensic investigation assembled with 100% deterministic receipt auditability.",
                },
                report_id=report_id,
            )

        except Exception as err:
            logger.exception("Agent pipeline investigation failed: %s", err)
            if supabase:
                try:
                    supabase.table("reports").update(
                        {
                            "status": "failed",
                            "updated_at": datetime.now(timezone.utc).isoformat(),
                        }
                    ).eq("id", report_id).execute()
                except Exception:
                    pass

            yield format_sse(
                event_type="error",
                agent="System",
                payload={
                    "status": "failed",
                    "error": str(err),
                    "message": f"Forensic pipeline halted: {str(err)}",
                },
                report_id=report_id,
            )

    return StreamingResponse(
        sse_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )
