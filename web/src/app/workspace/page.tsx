"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { TopHeader } from "@/components/shell/TopHeader";
import { LeftRail } from "@/components/shell/LeftRail";
import {
  AgentStatusRail,
  AgentStepState,
} from "@/components/AgentStatusRail";
import { DataTableCard } from "@/components/canvas/DataTableCard";
import { RootCauseCallout } from "@/components/canvas/RootCauseCallout";
import { DynamicVisualCard } from "@/components/canvas/DynamicVisualCard";
import { AuditDrawer } from "@/components/canvas/AuditDrawer";
import { StrategySandtable } from "@/components/canvas/StrategySandtable";
import { ExecutiveVerdict } from "@/components/canvas/ExecutiveVerdict";
import { VisualEvidence } from "@/components/canvas/VisualEvidence";
import {
  M_Plan,
  Q_Diagnostic,
  Eve_Audit,
  Agent007_Strategy,
  SSEStreamEvent,
} from "@/types/contracts";
import { runMockAnalysis, StreamController } from "@/lib/mockStream";
import { Search, Loader2, XCircle, ArrowRight } from "lucide-react";
import { DitherDistortionImage } from "@/components/ui/DitherDistortionImage";

function WorkspaceView() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "Why did Gross Margin drop in Q2?";

  const [query, setQuery] = useState(initialQuery);
  const [isRunning, setIsRunning] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Agent Data Contracts State
  const [mPlan, setMPlan] = useState<M_Plan | null>(null);
  const [qDiagnostic, setQDiagnostic] = useState<Q_Diagnostic | null>(null);
  const [eveAudit, setEveAudit] = useState<Eve_Audit | null>(null);
  const [strategy007, setStrategy007] = useState<Agent007_Strategy | null>(null);

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

  // If query is passed in URL, auto-run once
  useEffect(() => {
    const q = searchParams.get("q");
    if (q) {
      setQuery(q);
      handleStartAnalysis(q);
    }
  }, [searchParams]);

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

    // Reset previous report state
    setIsRunning(true);
    setElapsedSeconds(0);
    setMPlan(null);
    setQDiagnostic(null);
    setEveAudit(null);
    setStrategy007(null);

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

    const controller = runMockAnalysis(
      targetPrompt,
      (event: SSEStreamEvent) => {
        handleStreamEvent(event);
      },
      () => {
        setIsRunning(false);
      },
      (err) => {
        console.error("Stream error:", err);
        setIsRunning(false);
      }
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
    setMPlan(null);
    setQDiagnostic(null);
    setEveAudit(null);
    setStrategy007(null);
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

  // Handle Incoming SSE Events from the Stream Engine
  const handleStreamEvent = (event: SSEStreamEvent) => {
    switch (event.event_type) {
      case "m_plan":
        setMPlan(event.payload as M_Plan);
        setAgentSteps((prev) =>
          prev.map((step) =>
            step.code === "M"
              ? { ...step, status: "completed", timing: "1.2s", subtext: undefined }
              : step.code === "Q"
              ? { ...step, status: "active", subtext: "Executing DuckDB SQL..." }
              : step
          )
        );
        break;

      case "q_diagnostic":
        setQDiagnostic(event.payload as Q_Diagnostic);
        setAgentSteps((prev) =>
          prev.map((step) =>
            step.code === "Q"
              ? { ...step, status: "completed", timing: "38ms", subtext: undefined }
              : step.code === "Eve"
              ? { ...step, status: "active", subtext: "Synthesizing Recharts visual..." }
              : step
          )
        );
        break;

      case "eve_audit":
        setEveAudit(event.payload as Eve_Audit);
        setAgentSteps((prev) =>
          prev.map((step) =>
            step.code === "Eve"
              ? { ...step, status: "completed", timing: "1.7s", subtext: undefined }
              : step.code === "007"
              ? { ...step, status: "active", subtext: "Deriving what-if levers..." }
              : step
          )
        );
        break;

      case "007_strategy":
        setStrategy007(event.payload as Agent007_Strategy);
        setAgentSteps((prev) =>
          prev.map((step) =>
            step.code === "007"
              ? { ...step, status: "completed", timing: "1.6s", subtext: undefined }
              : step
          )
        );
        break;

      case "status_update":
        if (event.payload?.status === "completed") {
          setIsRunning(false);
        }
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
      <TopHeader isSystemLive={true} />

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
        >
          <div className="mx-auto max-w-5xl space-y-8 px-6 py-8 lg:px-12 min-h-full">
            {/* Hero Query Input Area */}
            <section className="rounded-xl border border-noir bg-bg-surface p-6 shadow-none transition-colors duration-200">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Search className="h-4 w-4 text-text-secondary" />
                  <label
                    htmlFor="query-input"
                    className="font-display text-xs font-bold uppercase tracking-wider text-text-primary"
                  >
                    Financial Intelligence Inquiry
                  </label>
                </div>
                <span className="font-body text-[11px] uppercase tracking-wider text-text-secondary font-medium italic">
                  Dataset: SaaS_Q2_Financials.csv
                </span>
              </div>

              {/* Multi-line auto-resizing Textarea */}
              <div className="relative">
                <textarea
                  id="query-input"
                  ref={textareaRef}
                  value={query}
                  onChange={handleTextareaInput}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                      e.preventDefault();
                      handleStartAnalysis();
                    }
                  }}
                  rows={2}
                  placeholder="Ask a deterministic question about your financials (e.g. margin variance, cost overruns, budget drifts)..."
                  className="w-full resize-none rounded-lg border border-noir bg-bg-canvas p-3.5 font-body text-sm text-text-primary placeholder:text-text-muted focus:border-text-secondary focus:outline-none transition-colors"
                />
              </div>

              {/* Prompt Suggestion Chips & Action Buttons */}
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                {/* 3 Clickable Suggestion Chips (Outlined Sepia Pills matching Landing Page) */}
                <div className="flex flex-wrap items-center gap-2">
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
                <div className="flex items-center gap-2.5">
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
                    disabled={isRunning || !query.trim()}
                    onClick={() => handleStartAnalysis()}
                    className={`inline-flex items-center gap-2 rounded-md px-5 py-2 font-body text-xs font-bold uppercase tracking-wider transition-colors shadow-none ${
                      isRunning || !query.trim()
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
            {(isRunning || mPlan !== null) && (
              <AgentStatusRail
                steps={agentSteps}
                isRunning={isRunning}
                totalElapsedSeconds={elapsedSeconds}
                estimatedRemainingSeconds={estimatedRemaining}
              />
            )}

            {/* 4. Progressive Canvas Report Components (3-Tier Executive Dossier Structure) */}
            <div className="space-y-8">
              {/* Tier 1: Executive Verdict & Strategic Levers (Root Cause + 007 Recommendation) */}
              {qDiagnostic && (
                <ExecutiveVerdict
                  diagnostic={qDiagnostic}
                  strategy={strategy007}
                />
              )}

              {/* Tier 2: Visual Evidence & Supporting Ledger (Eve's Chart + Collapsible Table) */}
              {eveAudit && (
                <VisualEvidence
                  audit={eveAudit}
                  diagnostic={qDiagnostic || undefined}
                />
              )}

              {/* Tier 3: Verification Proof & SQL Receipt (Strictly Collapsed by Default) */}
              {eveAudit && (
                <AuditDrawer
                  audit={eveAudit}
                  diagnostic={qDiagnostic || undefined}
                />
              )}
            </div>

            {/* Idle State: Editorial Dossier Briefing Banner wrapped in DitherDistortionImage */}
            {!isRunning && mPlan === null && (
              <DitherDistortionImage
                containerClassName="rounded-xl border border-noir bg-bg-surface shadow-none corner-ticks"
                maxTilt={4}
                maxDistortion={9}
              >
                <div className="relative overflow-hidden w-full" style={{ minHeight: '290px' }}>
                  {/* Dithered noir background layer */}
                  <div className="absolute inset-0 bg-dither" />

                  {/* Halftone dot pattern overlay for depth */}
                  <div
                    className="absolute inset-0 opacity-[0.05] pointer-events-none"
                    style={{
                      backgroundImage: `radial-gradient(circle, var(--text-primary) 1px, transparent 1px)`,
                      backgroundSize: '6px 6px',
                    }}
                  />

                  {/* Cold War Radar & Reticle Graphic Overlay */}
                  <div
                    className="pointer-events-none select-none absolute inset-0 flex items-center justify-center opacity-[0.08]"
                    style={{ mixBlendMode: "var(--dither-blend)" as any }}
                  >
                    <svg viewBox="0 0 500 240" className="w-full h-full stroke-current fill-none" style={{ color: "var(--text-secondary)" }}>
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
                      background: 'radial-gradient(ellipse at center, transparent 50%, rgba(107,77,58,0.08) 100%)',
                    }}
                  />

                  {/* Content overlay */}
                  <div className="relative z-10 flex flex-col items-center justify-end h-full px-8 py-10 text-center" style={{ minHeight: '290px' }}>
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
                      Select a suggestion chip above or dispatch M, Q, Eve, and 007
                      to analyze ledger variance with deterministic receipts.
                    </p>

                    {/* Decorative dossier line */}
                    <div className="mt-6 flex items-center gap-3">
                      <div className="h-px w-12 bg-text-secondary/30" />
                      <span className="font-mono text-[9px] uppercase tracking-[0.25em] text-text-muted">
                        Black Swan FP&A Division // MI6 Special Section
                      </span>
                      <div className="h-px w-12 bg-text-secondary/30" />
                    </div>
                  </div>
                </div>
              </DitherDistortionImage>
            )}
          </div>
        </main>
      </div>
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
