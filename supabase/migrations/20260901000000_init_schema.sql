-- ============================================================================
-- Black Swan - Stage 0 Initial Schema Migration
-- ============================================================================
-- IMPORTANT SECURITY NOTE:
-- Row-Level Security (RLS) is intentionally DEFERRED in this initial migration
-- because Black Swan is currently configured for single-user/local development.
-- RLS policies MUST be defined and enabled on all tables prior to any multi-user,
-- staging, or production deployment.
-- ============================================================================

-- Ensure pgcrypto extension is available for gen_random_uuid() if needed
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ----------------------------------------------------------------------------
-- 1. Workspaces Table
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS workspaces (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ----------------------------------------------------------------------------
-- 2. Datasets Table
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS datasets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    storage_path TEXT NOT NULL,
    row_count INTEGER,
    inferred_schema JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ----------------------------------------------------------------------------
-- 3. Reports Table
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    dataset_id UUID REFERENCES datasets(id) ON DELETE SET NULL,
    user_query TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    m_plan JSONB,          -- Stores M_Plan object
    q_result JSONB,        -- Stores Q_Diagnostic object
    eve_audit JSONB,       -- Stores Eve_Audit object
    strategy_007 JSONB,    -- Stores Agent007_Strategy object
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ----------------------------------------------------------------------------
-- 4. Audit Traces Table
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS audit_traces (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_id UUID NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
    agent_name TEXT NOT NULL,
    step_name TEXT NOT NULL,
    input_payload JSONB,
    output_payload JSONB,
    execution_time_ms DOUBLE PRECISION,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ----------------------------------------------------------------------------
-- Foreign Key Indexes (PostgreSQL does not auto-index foreign keys)
-- ----------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_datasets_workspace_id ON datasets(workspace_id);
CREATE INDEX IF NOT EXISTS idx_reports_workspace_id ON reports(workspace_id);
CREATE INDEX IF NOT EXISTS idx_reports_dataset_id ON reports(dataset_id);
CREATE INDEX IF NOT EXISTS idx_audit_traces_report_id ON audit_traces(report_id);

-- Additional lookup indexes for performance
CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);
CREATE INDEX IF NOT EXISTS idx_audit_traces_agent_name ON audit_traces(agent_name);

-- ----------------------------------------------------------------------------
-- Trigger Function: Auto-update updated_at timestamp
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to reports table
DROP TRIGGER IF EXISTS trigger_reports_updated_at ON reports;
CREATE TRIGGER trigger_reports_updated_at
    BEFORE UPDATE ON reports
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
