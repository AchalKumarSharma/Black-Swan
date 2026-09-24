"""Data Ingestion and Schema Mapping API endpoints for Black Swan FP&A."""

import io
import mimetypes
import uuid
from typing import Any, Dict, List, Optional
from fastapi import APIRouter, File, Form, HTTPException, UploadFile, status
from fastapi.responses import JSONResponse
import polars as pl

from app.core.duckdb import register_dataset, sanitize_table_name, table_exists
from app.core.schema_inference import coerce_dataframe_types, infer_schema
from app.core.supabase_client import get_supabase_client
from app.schemas.data import (
    ConfirmMappingRequest,
    ConfirmMappingResponse,
    InferredColumn,
    InferredSchema,
    UploadResponse,
    ValidationErrorResponse,
)

router = APIRouter(prefix="/data", tags=["Data Ingestion"])

DEFAULT_WORKSPACE_ID = "00000000-0000-0000-0000-000000000001"
STORAGE_BUCKET = "financial-uploads"


def validate_file_signature(filename: str, header_bytes: bytes) -> str:
    """Validate file extension and magic byte signatures.

    Returns the normalized file format ('csv', 'parquet', 'excel') or raises HTTPException.
    """
    lower_name = filename.lower()

    if lower_name.endswith(".parquet"):
        if not header_bytes.startswith(b"PAR1"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="File has .parquet extension but lacks valid 'PAR1' magic signature.",
            )
        return "parquet"

    if lower_name.endswith(".xlsx"):
        # ZIP magic bytes: PK\x03\x04
        if not header_bytes.startswith(b"PK\x03\x04"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="File has .xlsx extension but lacks valid ZIP/Office Open XML signature.",
            )
        return "excel"

    if lower_name.endswith(".xls"):
        # OLE compound file header: \xd0\xcf\x11\xe0\xa1\xb1\x1a\xe1
        if not header_bytes.startswith(b"\xd0\xcf\x11\xe0\xa1\xb1\x1a\xe1"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="File has .xls extension but lacks valid OLE compound document signature.",
            )
        return "excel"

    if lower_name.endswith(".csv"):
        # Reject binary files with null bytes in the header
        if b"\x00" in header_bytes[:1024]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="File has .csv extension but contains binary null bytes.",
            )
        try:
            # Check utf-8 or latin-1 decodable
            try:
                header_bytes.decode("utf-8")
            except UnicodeDecodeError:
                header_bytes.decode("latin-1")
        except Exception:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="CSV file contains unparseable character encoding.",
            )
        return "csv"

    raise HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail=f"Unsupported file format '{filename}'. Supported formats are: .csv, .parquet, .xlsx, .xls",
    )


def parse_file_to_polars(file_format: str, file_bytes: bytes) -> pl.DataFrame:
    """Parse raw bytes into a Polars DataFrame based on validated format."""
    try:
        buffer = io.BytesIO(file_bytes)
        if file_format == "csv":
            return pl.read_csv(buffer, infer_schema_length=10000, ignore_errors=False)
        elif file_format == "parquet":
            return pl.read_parquet(buffer)
        elif file_format == "excel":
            return pl.read_excel(buffer)
        else:
            raise ValueError(f"Unknown format: {file_format}")
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Malformed or unparseable data file: {str(e)}",
        )


@router.post(
    "/upload",
    response_model=UploadResponse,
    responses={
        400: {"description": "Malformed or unsupported file"},
        422: {"model": ValidationErrorResponse, "description": "Missing required financial axes"},
    },
)
async def upload_financial_dataset(
    file: UploadFile = File(..., description="Financial dataset (.csv, .xlsx, .xls, .parquet)"),
    workspace_id: Optional[str] = Form(
        None, description="Workspace ID (defaults to '00000000-0000-0000-0000-000000000001')"
    ),
):
    """Upload a financial dataset, validate signatures, infer dynamic schema, and store raw file."""
    effective_workspace_id = workspace_id or DEFAULT_WORKSPACE_ID
    filename = file.filename or "unnamed_dataset.csv"

    # Read file contents
    file_bytes = await file.read()
    if len(file_bytes) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded file is empty (0 bytes).",
        )

    # Validate signature
    file_format = validate_file_signature(filename, file_bytes[:1024])

    # Parse into Polars
    raw_df = parse_file_to_polars(file_format, file_bytes)
    if len(raw_df) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded dataset contains zero rows of data.",
        )

    # Dynamic schema inference & financial number coercion
    inference_result = infer_schema(raw_df)
    if not inference_result["is_valid"]:
        return JSONResponse(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            content={"detail": inference_result["issues"]},
        )

    cleaned_df: pl.DataFrame = inference_result["cleaned_df"]
    dataset_status = inference_result["status"]  # "ingested" | "needs_mapping"
    dataset_id = str(uuid.uuid4())
    storage_path = f"{effective_workspace_id}/{dataset_id}/{filename}"

    # Upload to Supabase Storage
    supabase = get_supabase_client()
    if supabase:
        mime_type, _ = mimetypes.guess_type(filename)
        content_type = mime_type or "application/octet-stream"
        try:
            supabase.storage.from_(STORAGE_BUCKET).upload(
                path=storage_path,
                file=file_bytes,
                file_options={"content-type": content_type, "upsert": "true"},
            )
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to persist file in Supabase Storage: {str(e)}",
            )

        # Prepare schema payload
        inferred_schema_dict = {
            "columns": inference_result["columns"],
            "period_col": inference_result["period_col"],
            "dimension_col": inference_result["dimension_col"],
            "revenue_col": inference_result["revenue_col"],
            "cogs_col": inference_result["cogs_col"],
            "status": dataset_status,
            "candidate_roles": inference_result["candidate_roles"],
        }

        # Insert dataset metadata record into Supabase PostgreSQL
        try:
            dataset_record = {
                "id": dataset_id,
                "workspace_id": effective_workspace_id,
                "file_name": filename,
                "storage_path": storage_path,
                "row_count": len(cleaned_df),
                "inferred_schema": inferred_schema_dict,
            }
            supabase.table("datasets").insert(dataset_record).execute()
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to register dataset metadata in Supabase Postgres: {str(e)}",
            )

    # Register into shared DuckDB instance if confident
    if dataset_status == "ingested":
        register_dataset(dataset_id, cleaned_df)

    schema_obj = InferredSchema(
        columns=[InferredColumn(**c) for c in inference_result["columns"]],
        period_col=inference_result["period_col"],
        dimension_col=inference_result["dimension_col"],
        revenue_col=inference_result["revenue_col"],
        cogs_col=inference_result["cogs_col"],
        status=dataset_status,
        candidate_roles=inference_result["candidate_roles"],
    )

    return UploadResponse(
        dataset_id=dataset_id,
        file_name=filename,
        row_count=len(cleaned_df),
        inferred_schema=schema_obj,
        status=dataset_status,
        candidate_roles=inference_result["candidate_roles"],
        message=(
            f"Dataset '{filename}' successfully ingested into in-memory DuckDB ({len(cleaned_df)} rows)."
            if dataset_status == "ingested"
            else f"Dataset '{filename}' requires column role confirmation before ingestion."
        ),
    )


@router.post(
    "/{dataset_id}/confirm-mapping",
    response_model=ConfirmMappingResponse,
)
async def confirm_dataset_mapping(
    dataset_id: str,
    payload: ConfirmMappingRequest,
):
    """Confirm column mappings for an ambiguous dataset and register in DuckDB."""
    supabase = get_supabase_client()
    if not supabase:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Supabase client is not configured.",
        )

    # Retrieve dataset record
    res = supabase.table("datasets").select("*").eq("id", dataset_id).execute()
    if not res.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Dataset with ID '{dataset_id}' not found.",
        )

    dataset_record = res.data[0]
    storage_path = dataset_record["storage_path"]
    filename = dataset_record["file_name"]

    # Download raw file from Supabase Storage
    try:
        file_bytes = supabase.storage.from_(STORAGE_BUCKET).download(storage_path)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve dataset file from storage: {str(e)}",
        )

    # Parse and coerce types
    file_format = validate_file_signature(filename, file_bytes[:1024])
    raw_df = parse_file_to_polars(file_format, file_bytes)
    cleaned_df = coerce_dataframe_types(raw_df)

    # Normalize user mapping whether it's {col: role} or {role: col}
    raw_mapping = payload.mapping
    known_roles = {"period", "dimension", "revenue", "cogs", "other"}
    user_mapping: Dict[str, str] = {}
    for k, v in raw_mapping.items():
        if k in known_roles and v in cleaned_df.columns:
            user_mapping[v] = k
        elif v in known_roles and k in cleaned_df.columns:
            user_mapping[k] = v
        else:
            user_mapping[k] = v

    existing_schema = dataset_record.get("inferred_schema") or {}
    columns_info: List[Dict[str, Any]] = []

    period_col = None
    dimension_col = None
    revenue_col = None
    cogs_col = None

    for col in cleaned_df.columns:
        series = cleaned_df[col]
        confirmed_role = user_mapping.get(col, "other")

        if confirmed_role == "period" and period_col is None:
            period_col = col
        elif confirmed_role == "dimension" and dimension_col is None:
            dimension_col = col
        elif confirmed_role == "revenue" and revenue_col is None:
            revenue_col = col
        elif confirmed_role == "cogs" and cogs_col is None:
            cogs_col = col


        sample_vals = [
            str(v) if v is not None else None
            for v in series.drop_nulls().head(4).to_list()
        ]

        columns_info.append({
            "name": col,
            "dtype": str(series.dtype),
            "detected_role": confirmed_role,
            "confidence": 1.0,
            "sample_values": sample_vals,
        })

    updated_schema_dict = {
        "columns": columns_info,
        "period_col": period_col,
        "dimension_col": dimension_col,
        "revenue_col": revenue_col,
        "cogs_col": cogs_col,
        "status": "ingested",
        "candidate_roles": existing_schema.get("candidate_roles"),
    }

    # Register into DuckDB singleton
    register_dataset(dataset_id, cleaned_df)

    # Update Supabase Postgres record
    try:
        supabase.table("datasets").update({
            "inferred_schema": updated_schema_dict
        }).eq("id", dataset_id).execute()
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update dataset schema in Supabase: {str(e)}",
        )

    schema_obj = InferredSchema(
        columns=[InferredColumn(**c) for c in columns_info],
        period_col=period_col,
        dimension_col=dimension_col,
        revenue_col=revenue_col,
        cogs_col=cogs_col,
        status="ingested",
    )

    return ConfirmMappingResponse(
        dataset_id=dataset_id,
        status="ingested",
        inferred_schema=schema_obj,
        message=f"Column mappings confirmed. Dataset registered in DuckDB as table '{sanitize_table_name(dataset_id)}'.",
    )


@router.get("/{dataset_id}")
async def get_dataset_details(dataset_id: str):
    """Retrieve metadata and registration status for a dataset."""
    supabase = get_supabase_client()
    if not supabase:
        raise HTTPException(status_code=500, detail="Supabase client not configured.")

    res = supabase.table("datasets").select("*").eq("id", dataset_id).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Dataset not found.")

    record = res.data[0]
    return {
        "dataset": record,
        "is_registered_in_duckdb": table_exists(dataset_id),
        "duckdb_table_name": sanitize_table_name(dataset_id) if table_exists(dataset_id) else None,
    }
