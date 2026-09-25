"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { TopHeader } from "@/components/shell/TopHeader";
import { LeftRail } from "@/components/shell/LeftRail";
import {
  AgentStatusRail,
  AgentStepState,
} from "@/components/AgentStatusRail";
import { ExecutiveReportCard } from "@/components/workspace/ExecutiveReportCard";
import {
  M_Plan,
  Q_Diagnostic,
  Eve_Audit,
  Agent007_Strategy,
  SSEStreamEvent,
  ReportBlock,
} from "@/types/contracts";
import { runAgentInvestigation, StreamController } from "@/lib/api/agentStream";
import { runMockAnalysis } from "@/lib/mockStream";
import {
  Search,
  Loader2,
  XCircle,
  ArrowRight,
  FileSpreadsheet,
  RefreshCw,
  CheckCircle2,
  X,
  Sparkles,
} from "lucide-react";
import { DitherDistortionImage } from "@/components/ui/DitherDistortionImage";
import { UploadDropzone } from "@/components/ingestion/UploadDropzone";
import { ColumnMapperModal } from "@/components/ingestion/ColumnMapperModal";
import { IngestionErrorTray } from "@/components/ingestion/IngestionErrorTray";
import { LedgerStandbyBanner } from "@/components/workspace/LedgerStandbyBanner";
import {
  ActiveDataset,
  UploadResponse,
  ConfirmMappingResponse,
  ValidationIssue,
} from "@/types/data";

function WorkspaceView() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "Why did Gross Margin drop in Q2?";

  const [query, setQuery] = useState(initialQuery);
  const [isRunning, setIsRunning] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Active Dataset & Ingestion State
  const [activeDataset, setActiveDataset] = useState<ActiveDataset | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [mappingModalData, setMappingModalData] = useState<UploadResponse | null>(null);
  const [ingestionErrors, setIngestionErrors] = useState<ValidationIssue[]>([]);
  const [ingestionToast, setIngestionToast] = useState<string | null>(null);

  // Agent Data Contracts State & Appended Investigation History
  const [reports, setReports] = useState<ReportBlock[]>([]);
  const [activeReportId, setActiveReportId] = useState<string | null>(null);
  const activeReportIdRef = useRef<string | null>(null);
  const [reportId, setReportId] = useState<string | null>(null);

  // Active Stream Controller reference
  const streamControllerRef = useRef<StreamController | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);


  // 4-Agent Step States for Status Rail
  const [agentSteps, setAgentSteps] = useState<AgentStepState[]>([
    {
      code: "M",
      name: "Orchestrator",
      roleDescription: "Strategic decomposition & subtask coordination",
      status: "pending",
    },
    {
      code: "Q",
      name: "Data & Diagnostics",
      roleDescription: "In-memory DuckDB SQL & variance isolation",
      status: "pending",
    },
    {
      code: "Eve",
      name: "Audit & Viz",
      roleDescription: "Recharts specifications & formula receipts",
      status: "pending",
    },
    {
      code: "007",
      name: "Strategy",
      roleDescription: "Executive action roadmap & pro-forma levers",
      status: "pending",
    },
  ]);

  // Auto-dismiss ingestion toast after 5s
  useEffect(() => {
    if (ingestionToast) {
      const timer = setTimeout(() => setIngestionToast(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [ingestionToast]);

  // If query is passed in URL, auto-load sample dataset if needed and auto-run
  useEffect(() => {
    const q = searchParams.get("q");
    if (q) {
      setQuery(q);
      if (!activeDataset) {
        fetch("/SaaS_Q2_Financials.csv")
          .then((res) => res.blob())
          .then((blob) => {
            const file = new File([blob], "SaaS_Q2_Financials.csv", { type: "text/csv" });
            const formData = new FormData();
            formData.append("file", file);
            formData.append("workspace_id", "00000000-0000-0000-0000-000000000001");
            const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
            return fetch(`${apiBase}/api/v1/data/upload`, {
              method: "POST",
              body: formData,
            });
          })
          .then((res) => (res.ok ? res.json() : null))
          .then((data: UploadResponse | null) => {
            if (data && data.status === "ingested") {
              setActiveDataset({
                id: data.dataset_id,
                fileName: data.file_name,
                rowCount: data.row_count,
                inferredSchema: data.inferred_schema,
              });
            }
          })
          .catch((err) => console.error("Auto sample load failed:", err))
          .finally(() => {
            handleStartAnalysis(q);
          });
      } else {
        handleStartAnalysis(q);
      }
    }
  }, [searchParams]);

  const handleUploadSuccess = (response: UploadResponse) => {
    setIngestionErrors([]);
    if (response.status === "needs_mapping") {
      setMappingModalData(response);
    } else {
      setActiveDataset({
        id: response.dataset_id,
        fileName: response.file_name,
        rowCount: response.row_count,
        inferredSchema: response.inferred_schema,
      });
      setShowUploadModal(false);
      setIngestionToast(
        `Dataset "${response.file_name}" (${response.row_count} rows) registered in DuckDB.`
      );
    }
  };

  const handleConfirmMapping = (response: ConfirmMappingResponse) => {
    if (mappingModalData) {
      setActiveDataset({
        id: response.dataset_id,
        fileName: mappingModalData.file_name,
        rowCount: mappingModalData.row_count,
        inferredSchema: response.inferred_schema,
      });
      setMappingModalData(null);
      setShowUploadModal(false);
      setIngestionToast(
        `Column mappings confirmed for "${mappingModalData.file_name}". Registered in DuckDB.`
      );
    }
  };

  // Timer loop when running
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isRunning) {
      const startTime = Date.now();
      interval = setInterval(() => {
        setElapsedSeconds((Date.now() - startTime) / 1000);
      }, 100);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning]);

  // Auto-resize textarea
  const handleTextareaInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setQuery(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  // Trigger Analysis Execution
  const handleStartAnalysis = (promptToRun?: string) => {
    const targetPrompt = promptToRun !== undefined ? promptToRun : query;
    if (!targetPrompt.trim() || isRunning) return;

    if (!activeDataset) {
      setIngestionErrors([
        {
          field: "dataset",
          issue: "No active dataset loaded. Please upload a dataset or click 'Load Sample Dataset' to proceed.",
        },
      ]);
      return;
    }


    // Start new report block (appended to history)
    const blockId = `rep-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    activeReportIdRef.current = blockId;
    setActiveReportId(blockId);

    const newReport: ReportBlock = {
      id: blockId,
      query: targetPrompt,
      timestamp: new Date().toISOString(),
      mPlan: null,
      qDiagnostic: null,
      eveAudit: null,
      strategy007: null,
      outOfScope: null,
      quotaExceeded: false,
    };

    setReports((prev) => [...prev, newReport]);
    setIsRunning(true);
    setElapsedSeconds(0);

    // Reset status steps
    setAgentSteps([
      {
        code: "M",
        name: "Orchestrator",
        roleDescription: "Strategic decomposition & subtask coordination",
        status: "active",
        subtext: "Decomposing inquiry...",
      },
      {
        code: "Q",
        name: "Data & Diagnostics",
        roleDescription: "In-memory DuckDB SQL & variance isolation",
        status: "pending",
      },
      {
        code: "Eve",
        name: "Audit & Viz",
        roleDescription: "Recharts specifications & formula receipts",
        status: "pending",
      },
      {
        code: "007",
        name: "Strategy",
        roleDescription: "Executive action roadmap & pro-forma levers",
        status: "pending",
      },
    ]);

    const conversationHistory = reports
      .filter((r) => r.mPlan || r.qDiagnostic)
      .slice(-3)
      .map((r) => ({
        query: r.query,
        intent: r.mPlan?.intent,
        summary: r.qDiagnostic?.summary_findings?.[0] || r.qDiagnostic?.narrative || "",
      }));

    const controller = runAgentInvestigation(
      activeDataset.id,
      targetPrompt,
      (event: SSEStreamEvent) => {
        handleStreamEvent(event);
      },
      () => {
        setIsRunning(false);
      },
      (err) => {
        console.error("Agent investigation stream error:", err);
        setIsRunning(false);
        setIngestionErrors([
          {
            field: "pipeline",
            issue: `Investigation halted: ${err.message}`,
          },
        ]);
        setAgentSteps((prev) =>
          prev.map((step) =>
            step.status === "active"
              ? { ...step, status: "failed", subtext: err.message || "Execution failed" }
              : step
          )
        );
      },
      "00000000-0000-0000-0000-000000000001",
      conversationHistory,
      blockId
    );

    streamControllerRef.current = controller;
  };

  // Reset Workspace to clean empty state (New Report)
  const handleNewReport = () => {
    if (streamControllerRef.current) {
      streamControllerRef.current.cancel();
      streamControllerRef.current = null;
    }
    setIsRunning(false);
    setQuery("");
    setReportId(null);
    setReports([]);
    activeReportIdRef.current = null;
    setActiveReportId(null);
    setElapsedSeconds(0);
    setAgentSteps([
      {
        code: "M",
        name: "Orchestrator",
        roleDescription: "Strategic decomposition & subtask coordination",
        status: "pending",
      },
      {
        code: "Q",
        name: "Data & Diagnostics",
        roleDescription: "In-memory DuckDB SQL & variance isolation",
        status: "pending",
      },
      {
        code: "Eve",
        name: "Audit & Viz",
        roleDescription: "Recharts specifications & formula receipts",
        status: "pending",
      },
      {
        code: "007",
        name: "Strategy",
        roleDescription: "Executive action roadmap & pro-forma levers",
        status: "pending",
      },
    ]);
    if (typeof window !== "undefined") {
      window.history.replaceState(null, "", "/workspace");
    }
  };

  // Cancel Running Analysis
  const handleCancelAnalysis = () => {
    if (streamControllerRef.current) {
      streamControllerRef.current.cancel();
      streamControllerRef.current = null;
    }
    setIsRunning(false);

    // Mark active/pending steps as failed/cancelled
    setAgentSteps((prev) =>
      prev.map((step) =>
        step.status === "active" || step.status === "pending"
          ? { ...step, status: "failed", subtext: "Analysis aborted by user" }
          : step
      )
    );
  };

  const formatTiming = (ms?: number) => {
    if (!ms && ms !== 0) return undefined;
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  // Handle Incoming SSE Events from the Stream Engine
  const handleStreamEvent = (event: SSEStreamEvent) => {
    const currentId = activeReportIdRef.current;

    switch (event.event_type) {
      case "m_plan": {
        const payload = event.payload as M_Plan;
        const qExceeded = Boolean(payload?.quota_exceeded);
        setReports((prev) =>
          prev.map((rep) =>
            rep.id === currentId
              ? {
                  ...rep,
                  mPlan: payload,
                  quotaExceeded: rep.quotaExceeded || qExceeded,
                }
              : rep
          )
        );
        setAgentSteps((prev) =>
          prev.map((step) =>
            step.code === "M"
              ? {
                  ...step,
                  status: "completed",
                  timing:
                    step.timing ||
                    formatTiming(event.payload?.execution_time_ms) ||
                    "1.1s",
                  subtext: undefined,
                }
              : step.code === "Q" && step.status === "pending"
              ? { ...step, status: "active", subtext: "Executing DuckDB SQL..." }
              : step
          )
        );
        break;
      }

      case "out_of_scope": {
        const payload = event.payload;
        setReports((prev) =>
          prev.map((rep) =>
            rep.id === currentId
              ? {
                  ...rep,
                  outOfScope: {
                    refusal_message:
                      payload?.refusal_message ||
                      "I cannot answer that question because this workspace is analyzing your financial transaction ledger. You can ask me about revenue trajectories, product sales, or gross margin anomalies.",
                    suggested_queries:
                      payload?.suggested_queries || [
                        "Why did Gross Margin drop in Q2?",
                        "Compare total revenue and units sold between Product A and Product B",
                        "Is our revenue growing or dropping over time?",
                      ],
                  },
                }
              : rep
          )
        );
        setIsRunning(false);
        setAgentSteps((prev) =>
          prev.map((step) =>
            step.code === "M"
              ? { ...step, status: "completed", subtext: "Classified as Out of Scope" }
              : { ...step, status: "pending", subtext: "Skipped (Out of Scope)" }
          )
        );
        break;
      }

      case "q_diagnostic": {
        const payload = event.payload as Q_Diagnostic;
        const qExceeded = Boolean(payload?.quota_exceeded);
        setReports((prev) =>
          prev.map((rep) =>
            rep.id === currentId
              ? {
                  ...rep,
                  qDiagnostic: payload,
                  quotaExceeded: rep.quotaExceeded || qExceeded,
                }
              : rep
          )
        );
        setAgentSteps((prev) =>
          prev.map((step) =>
            step.code === "Q"
              ? {
                  ...step,
                  status: "completed",
                  timing:
                    formatTiming(event.payload?.execution_time_ms) ||
                    step.timing ||
                    "42ms",
                  subtext: undefined,
                }
              : step.code === "Eve" && step.status === "pending"
              ? { ...step, status: "active", subtext: "Synthesizing Recharts visual..." }
              : step
          )
        );
        break;
      }

      case "eve_audit": {
        const payload = event.payload as Eve_Audit;
        const qExceeded = Boolean(payload?.quota_exceeded);
        setReports((prev) =>
          prev.map((rep) =>
            rep.id === currentId
              ? {
                  ...rep,
                  eveAudit: payload,
                  quotaExceeded: rep.quotaExceeded || qExceeded,
                }
              : rep
          )
        );
        setAgentSteps((prev) =>
          prev.map((step) =>
            step.code === "Eve"
              ? {
                  ...step,
                  status: "completed",
                  timing:
                    step.timing ||
                    formatTiming(event.payload?.execution_time_ms) ||
                    "1.4s",
                  subtext: undefined,
                }
              : step.code === "007" && step.status === "pending"
              ? { ...step, status: "active", subtext: "Deriving what-if levers..." }
              : step
          )
        );
        break;
      }

      case "007_strategy": {
        const payload = event.payload as Agent007_Strategy;
        const qExceeded = Boolean(payload?.quota_exceeded);
        setReports((prev) =>
          prev.map((rep) =>
            rep.id === currentId
              ? {
                  ...rep,
                  strategy007: payload,
                  quotaExceeded: rep.quotaExceeded || qExceeded,
                }
              : rep
          )
        );
        setAgentSteps((prev) =>
          prev.map((step) =>
            step.code === "007"
              ? {
                  ...step,
                  status: "completed",
                  timing:
                    step.timing ||
                    formatTiming(event.payload?.execution_time_ms) ||
                    "1.3s",
                  subtext: undefined,
                }
              : step
          )
        );
        break;
      }

      case "pipeline_complete":
        setIsRunning(false);
        break;

      case "status_update":
        if (event.payload?.report_id) {
          setReportId(event.payload.report_id);
        }
        if (event.agent && event.agent !== "System") {
          const agentCode = event.agent;
          if (event.payload?.status === "active") {
            setAgentSteps((prev) =>
              prev.map((step) =>
                step.code === agentCode
                  ? { ...step, status: "active", subtext: event.payload?.message || `Agent ${agentCode} processing...` }
                  : step
              )
            );
          } else if (event.payload?.status === "completed") {
            setAgentSteps((prev) =>
              prev.map((step) =>
                step.code === agentCode
                  ? { ...step, status: "completed", timing: formatTiming(event.payload?.timing_ms) || "42ms", subtext: undefined }
                  : step
              )
            );
          }
        }
        if (event.agent === "System" && event.payload?.status === "completed") {
          setIsRunning(false);
        }
        break;

      case "error":
        setIsRunning(false);
        setIngestionErrors([
          {
            field: "pipeline",
            issue: event.payload?.message || event.payload?.error || "Pipeline execution error",
          },
        ]);
        setAgentSteps((prev) =>
          prev.map((step) =>
            step.status === "active"
              ? { ...step, status: "failed", subtext: event.payload?.message || "Execution failed" }
              : step
          )
        );
        break;

      default:
        break;
    }
  };

  const promptSuggestions = [
    "Why did Gross Margin drop in Q2?",
    "Identify top 3 OPEX variance drivers vs budget.",
    "Run anomaly detection on South region COGS.",
  ];

  const estimatedRemaining = Math.max(0, 6.0 - elapsedSeconds);

  return (
    <div className="flex h-screen flex-col bg-bg-canvas text-text-primary overflow-hidden transition-colors duration-200">
      {/* 1. Top Header */}
      <TopHeader
        isSystemLive={true}
        activeDataset={
          activeDataset
            ? {
                id: activeDataset.id,
                fileName: activeDataset.fileName,
                rowCount: activeDataset.rowCount,
              }
            : null
        }
        onUploadNew={() => setShowUploadModal(true)}
      />

      {/* 2. Workspace Body: Left Rail + Main Canvas */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Rail (Pinned in place, internally scrollable) */}
        <LeftRail
          onNewReport={handleNewReport}
          onSelectReport={(title) => {
            setQuery(title);
            handleStartAnalysis(title);
          }}
        />

        {/* Main Canvas (Independently scrollable with Lenis smooth momentum) */}
        <main
          id="workspace-canvas-scroll"
          className="flex-1 overflow-y-auto overflow-x-hidden relative h-full"
          suppressHydrationWarning={true}
        >
          <div className="mx-auto max-w-5xl space-y-8 px-3 sm:px-6 py-4 sm:py-8 lg:px-12 min-h-full min-w-0">
            {/* Hero Query Input Area */}
            <section className="rounded-xl border border-noir bg-bg-surface p-4 sm:p-6 shadow-none transition-colors duration-200 min-w-0">
              <div className="mb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Search className="h-4 w-4 text-text-secondary" />
                  <label
                    htmlFor="query-input"
                    className="font-display text-xs font-bold uppercase tracking-wider text-text-primary"
                  >
                    Financial Intelligence Inquiry
                  </label>
                </div>
                {activeDataset ? (
                  <div className="flex items-center gap-2">
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="font-mono text-[11px] uppercase tracking-wider text-text-secondary font-medium">
                      Dataset: {activeDataset.fileName} ({activeDataset.rowCount.toLocaleString()} rows)
                    </span>
                  </div>
                ) : (
                  <span className="font-body text-[11px] uppercase tracking-wider text-accent-rust font-medium italic">
                    Awaiting Dataset Ingestion
                  </span>
                )}
              </div>

              {/* Multi-line auto-resizing Textarea */}
              <div className="relative">
                <textarea
                  id="query-input"
                  ref={textareaRef}
                  value={query}
                  disabled={!activeDataset || isRunning}
                  onChange={handleTextareaInput}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                      e.preventDefault();
                      handleStartAnalysis();
                    }
                  }}
                  rows={2}
                  placeholder={
                    activeDataset
                      ? "Ask a deterministic question about your financials (e.g. margin variance, cost overruns, budget drifts)..."
                      : "Ingest or load a financial ledger dataset below to dispatch analysis..."
                  }
                  className={`w-full resize-none rounded-lg border border-noir bg-bg-canvas p-3.5 font-body text-sm text-text-primary placeholder:text-text-muted focus:border-text-secondary focus:outline-none transition-colors ${
                    !activeDataset ? "opacity-60 cursor-not-allowed" : ""
                  }`}
                />
              </div>

              {/* Prompt Suggestion Chips & Action Buttons */}
              <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                {/* 3 Clickable Suggestion Chips (Outlined Sepia Pills matching Landing Page) */}
                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                  <span className="font-display text-[10px] font-bold uppercase tracking-widest text-text-secondary mr-1">
                    Suggestions:
                  </span>
                  {promptSuggestions.map((promptText) => (
                    <button
                      key={promptText}
                      type="button"
                      onClick={() => {
                        setQuery(promptText);
                        handleStartAnalysis(promptText);
                      }}
                      className="rounded-full border border-noir px-3.5 py-1 font-body text-[10px] font-bold uppercase tracking-widest text-text-secondary bg-transparent hover:border-text-primary hover:text-text-primary transition-colors cursor-pointer"
                    >
                      {promptText}
                    </button>
                  ))}
                </div>

                {/* Submit & Cancel Buttons */}
                <div className="flex items-center justify-end gap-2.5 w-full sm:w-auto">
                  {isRunning && (
                    <button
                      type="button"
                      onClick={handleCancelAnalysis}
                      className="inline-flex items-center gap-1.5 rounded-md border border-accent-rust bg-bg-canvas px-3 py-2 font-body text-xs font-bold uppercase tracking-wider text-accent-rust hover:bg-accent-rust/10 transition-colors cursor-pointer"
                    >
                      <XCircle className="h-3.5 w-3.5" />
                      <span>Cancel Analysis</span>
                    </button>
                  )}

                  <button
                    type="button"
                    disabled={!activeDataset || isRunning || !query.trim()}
                    onClick={() => handleStartAnalysis()}
                    className={`inline-flex items-center gap-2 rounded-md px-5 py-2 font-body text-xs font-bold uppercase tracking-wider transition-colors shadow-none disabled:opacity-40 disabled:cursor-not-allowed ${
                      !activeDataset || isRunning || !query.trim()
                        ? "bg-bg-surface-subtle text-text-muted cursor-not-allowed border border-noir"
                        : "bg-accent-contrast text-bg-canvas hover:opacity-90 cursor-pointer"
                    }`}
                  >
                    {isRunning ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        <span>Assembling Analysis...</span>
                      </>
                    ) : (
                      <>
                        <span>Analyze</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </section>

            {/* 3. Progressive-Build Status Rail (The 4 Agents) */}
            {(isRunning || reports.length > 0) && (
              <AgentStatusRail
                steps={agentSteps}
                isRunning={isRunning}
                totalElapsedSeconds={elapsedSeconds}
                estimatedRemainingSeconds={estimatedRemaining}
              />
            )}

            {/* 4. Progressive Canvas Investigation Reports (Unified Executive Blocks) */}
            {reports.length > 0 && (
              <div className="space-y-8">
                {reports.map((report) => (
                  <ExecutiveReportCard
                    key={report.id}
                    report={report}
                    onSelectQuery={(sq) => {
                      setQuery(sq);
                      handleStartAnalysis(sq);
                    }}
                  />
                ))}
              </div>
            )}

            {/* Idle State: Case 1 - NO DATASET LOADED */}
            {!isRunning && reports.length === 0 && !activeDataset && (
              <div className="space-y-6">
                {ingestionErrors.length > 0 &&
                  (ingestionErrors.some(
                    (err) =>
                      err.field === "dataset" ||
                      err.issue.toLowerCase().includes("no active dataset")
                  ) ? (
                    <LedgerStandbyBanner
                      onDismiss={() => setIngestionErrors([])}
                    />
                  ) : (
                    <IngestionErrorTray
                      errors={ingestionErrors}
                      onDismiss={() => setIngestionErrors([])}
                    />
                  ))}
                <UploadDropzone
                  onUploadSuccess={handleUploadSuccess}
                  onError={(errs) => setIngestionErrors(errs)}
                />
              </div>
            )}

            {/* Idle State: Case 2 - DATASET LOADED (Briefing Banner + Dataset Metadata Card) */}
            {!isRunning && reports.length === 0 && activeDataset && (
              <div className="space-y-6">
                {/* Active Dataset Overview Pill Strip */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 rounded-xl border border-noir bg-bg-surface p-3.5 sm:p-4 text-xs min-w-0">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-noir bg-bg-canvas text-accent-rust">
                      <FileSpreadsheet className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-text-primary">
                          {activeDataset.fileName}
                        </span>
                        <span className="rounded bg-emerald-950/40 border border-emerald-800/40 px-1.5 py-0.2 font-mono text-[10px] text-emerald-300 uppercase">
                          DUCKDB ATTACHED
                        </span>
                      </div>
                      <div className="mt-0.5 flex flex-wrap items-center gap-2.5 font-body text-[11px] text-text-secondary">
                        <span>{activeDataset.rowCount.toLocaleString()} records</span>
                        <span>•</span>
                        <span>
                          Period:{" "}
                          <strong className="text-text-primary font-mono">
                            {activeDataset.inferredSchema.period_col || "N/A"}
                          </strong>
                        </span>
                        <span>•</span>
                        <span>
                          Dimension:{" "}
                          <strong className="text-text-primary font-mono">
                            {activeDataset.inferredSchema.dimension_col || "N/A"}
                          </strong>
                        </span>
                        <span>•</span>
                        <span>
                          Revenue:{" "}
                          <strong className="text-text-primary font-mono">
                            {activeDataset.inferredSchema.revenue_col || "N/A"}
                          </strong>
                        </span>
                        {activeDataset.inferredSchema.cogs_col && (
                          <>
                            <span>•</span>
                            <span>
                              COGS:{" "}
                              <strong className="text-text-primary font-mono">
                                {activeDataset.inferredSchema.cogs_col}
                              </strong>
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowUploadModal(true)}
                    className="inline-flex items-center gap-1.5 rounded border border-noir bg-bg-canvas px-3 py-1.5 font-body text-xs font-semibold text-text-secondary hover:border-text-primary hover:text-text-primary transition-colors cursor-pointer"
                  >
                    <RefreshCw className="h-3 w-3" />
                    <span>Replace Dataset</span>
                  </button>
                </div>

                {/* Editorial Dossier Briefing Banner wrapped in DitherDistortionImage */}
                <DitherDistortionImage
                  containerClassName="rounded-xl border border-noir bg-bg-surface shadow-none corner-ticks"
                  maxTilt={4}
                  maxDistortion={9}
                >
                  <div className="relative overflow-hidden w-full" style={{ minHeight: "290px" }}>
                    {/* Dithered noir background layer */}
                    <div className="absolute inset-0 bg-dither" />

                    {/* Halftone dot pattern overlay for depth */}
                    <div
                      className="absolute inset-0 opacity-[0.05] pointer-events-none"
                      style={{
                        backgroundImage: `radial-gradient(circle, var(--text-primary) 1px, transparent 1px)`,
                        backgroundSize: "6px 6px",
                      }}
                    />

                    {/* Cold War Radar & Reticle Graphic Overlay */}
                    <div
                      className="pointer-events-none select-none absolute inset-0 flex items-center justify-center opacity-[0.08]"
                      style={{ mixBlendMode: "var(--dither-blend)" as any }}
                    >
                      <svg
                        viewBox="0 0 500 240"
                        className="w-full h-full stroke-current fill-none"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        <circle cx="250" cy="120" r="90" strokeWidth="0.75" />
                        <circle cx="250" cy="120" r="60" strokeWidth="0.5" strokeDasharray="4 4" />
                        <circle cx="250" cy="120" r="30" strokeWidth="0.5" />
                        <line x1="50" y1="120" x2="450" y2="120" strokeWidth="0.5" />
                        <line x1="250" y1="20" x2="250" y2="220" strokeWidth="0.5" />
                        <line x1="250" y1="120" x2="330" y2="40" strokeWidth="1" />
                      </svg>
                    </div>

                    {/* Warm gradient for text legibility */}
                    <div className="absolute inset-0 bg-gradient-to-t from-bg-surface via-bg-surface/85 to-transparent" />

                    {/* Decorative vignette edges */}
                    <div
                      className="absolute inset-0 pointer-events-none"
                      style={{
                        background:
                          "radial-gradient(ellipse at center, transparent 50%, rgba(107,77,58,0.08) 100%)",
                      }}
                    />

                    {/* Content overlay */}
                    <div
                      className="relative z-10 flex flex-col items-center justify-end h-full px-4 sm:px-8 py-8 sm:py-10 text-center"
                      style={{ minHeight: "290px" }}
                    >
                      {/* Classification tag */}
                      <div className="mb-4 inline-flex items-center gap-2">
                        <span className="font-body text-[10px] font-bold uppercase tracking-[0.2em] text-text-secondary">
                          Mission Active
                        </span>
                        <span className="text-text-secondary/40 text-[10px]">//</span>
                        <span className="font-body text-[10px] font-bold uppercase tracking-[0.2em] text-text-secondary">
                          Dataset Loaded
                        </span>
                      </div>

                      {/* Display headline */}
                      <h3 className="font-display text-2xl sm:text-3xl font-bold uppercase tracking-tight text-text-primary mb-3">
                        Awaiting Investigation Parameters
                      </h3>

                      {/* Narrative subtext */}
                      <p className="mx-auto max-w-lg font-body text-xs leading-relaxed text-text-secondary">
                        Select a suggestion chip above or dispatch M, Q, Eve, and 007 to analyze
                        ledger variance with deterministic receipts.
                      </p>

                      {/* Decorative dossier line */}
                      <div className="mt-6 flex items-center gap-2 sm:gap-3 max-w-full overflow-hidden">
                        <div className="h-px w-6 sm:w-12 shrink-0 bg-text-secondary/30" />
                        <span className="font-mono text-[9px] uppercase tracking-wider sm:tracking-[0.25em] text-text-muted truncate">
                          Black Swan FP&A Division // MI6 Special Section
                        </span>
                        <div className="h-px w-6 sm:w-12 shrink-0 bg-text-secondary/30" />
                      </div>
                    </div>
                  </div>
                </DitherDistortionImage>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Upload/Switch Dataset Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm transition-opacity">
          <div className="relative w-full max-w-xl rounded-xl border border-noir bg-bg-surface p-4 sm:p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-noir">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold uppercase tracking-widest text-accent-rust">
                  INGEST //
                </span>
                <h3 className="font-display text-sm font-bold uppercase tracking-wider text-text-primary">
                  Deploy Financial Ledger
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowUploadModal(false)}
                className="rounded p-1 text-text-secondary hover:bg-bg-canvas hover:text-text-primary transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            {ingestionErrors.length > 0 &&
              (ingestionErrors.some(
                (err) =>
                  err.field === "dataset" ||
                  err.issue.toLowerCase().includes("no active dataset")
              ) ? (
                <LedgerStandbyBanner
                  onDismiss={() => setIngestionErrors([])}
                />
              ) : (
                <IngestionErrorTray
                  errors={ingestionErrors}
                  onDismiss={() => setIngestionErrors([])}
                />
              ))}
            <UploadDropzone
              onUploadSuccess={handleUploadSuccess}
              onError={(errs) => setIngestionErrors(errs)}
            />
          </div>
        </div>
      )}

      {/* Column Mapping Modal (when upload status is needs_mapping) */}
      {mappingModalData && (
        <ColumnMapperModal
          datasetId={mappingModalData.dataset_id}
          fileName={mappingModalData.file_name}
          inferredSchema={mappingModalData.inferred_schema}
          onConfirm={handleConfirmMapping}
          onCancel={() => setMappingModalData(null)}
          onError={(errs) => setIngestionErrors(errs)}
        />
      )}

      {/* Toast Notification */}
      {ingestionToast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-lg border border-accent-rust/40 bg-bg-surface px-4 py-3 shadow-2xl backdrop-blur-md transition-all animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="h-4 w-4 text-accent-rust shrink-0" />
          <span className="font-mono text-xs text-text-primary">{ingestionToast}</span>
          <button
            type="button"
            onClick={() => setIngestionToast(null)}
            className="text-text-secondary hover:text-text-primary ml-2 cursor-pointer"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </div>

  );
}

export default function WorkspacePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-bg-canvas" />}>
      <WorkspaceView />
    </Suspense>
  );
}
