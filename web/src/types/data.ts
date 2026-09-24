/**
 * Data Ingestion and Schema Types for Black Swan FP&A
 */

export type ColumnRole = "period" | "dimension" | "revenue" | "cogs" | "other";

export interface InferredColumn {
  name: string;
  dtype: string;
  detected_role: ColumnRole;
  confidence: number;
  sample_values: (string | null)[];
}

export interface InferredSchema {
  columns: InferredColumn[];
  period_col: string | null;
  dimension_col: string | null;
  revenue_col: string | null;
  cogs_col: string | null;
  status: "ingested" | "needs_mapping";
  candidate_roles?: Record<string, string[]> | null;
}

export interface UploadResponse {
  dataset_id: string;
  file_name: string;
  row_count: number;
  inferred_schema: InferredSchema;
  status: "ingested" | "needs_mapping";
  candidate_roles?: Record<string, string[]> | null;
  message?: string;
}

export interface ConfirmMappingResponse {
  dataset_id: string;
  status: "ingested";
  inferred_schema: InferredSchema;
  message?: string;
}

export interface ValidationIssue {
  field: string;
  issue: string;
}

export interface ActiveDataset {
  id: string;
  fileName: string;
  rowCount: number;
  inferredSchema: InferredSchema;
}
