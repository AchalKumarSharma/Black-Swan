"""Pydantic schemas for data ingestion, schema inference, and column mapping."""

from typing import Dict, List, Optional
from pydantic import BaseModel, Field


class InferredColumn(BaseModel):
    name: str
    dtype: str
    detected_role: str = Field(description="'period' | 'dimension' | 'revenue' | 'cogs' | 'other'")
    confidence: float
    sample_values: List[Optional[str]] = Field(default_factory=list)


class InferredSchema(BaseModel):
    columns: List[InferredColumn]
    period_col: Optional[str] = None
    dimension_col: Optional[str] = None
    revenue_col: Optional[str] = None
    cogs_col: Optional[str] = None
    status: str = Field(default="ingested", description="'ingested' | 'needs_mapping'")
    candidate_roles: Optional[Dict[str, List[str]]] = None


class UploadResponse(BaseModel):
    dataset_id: str
    file_name: str
    row_count: int
    inferred_schema: InferredSchema
    status: str = Field(description="'ingested' | 'needs_mapping'")
    candidate_roles: Optional[Dict[str, List[str]]] = None
    message: Optional[str] = None


class ConfirmMappingRequest(BaseModel):
    mapping: Dict[str, str] = Field(
        description="Dictionary mapping header string to role: 'period' | 'dimension' | 'revenue' | 'cogs' | 'other'"
    )


class ConfirmMappingResponse(BaseModel):
    dataset_id: str
    status: str = "ingested"
    inferred_schema: InferredSchema
    message: Optional[str] = None


class ValidationIssue(BaseModel):
    field: str
    issue: str


class ValidationErrorResponse(BaseModel):
    detail: List[ValidationIssue]
