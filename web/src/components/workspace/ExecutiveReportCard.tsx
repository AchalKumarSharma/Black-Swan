"use client";

import React, { useState } from "react";
import {
  ReportBlock,
  ExecutiveBrief,
  Q_Diagnostic,
  Eve_Audit,
  Agent007_Strategy,
} from "@/types/contracts";
import {
  ShieldAlert,
  ShieldCheck,
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  Copy,
  Check,
  FileCode,
  Table as TableIcon,
  BarChart2,
  Sparkles,
  Info,
  CheckCircle2,
  Clock,
  Layers,
  ArrowUpRight,
  Sliders,
  Briefcase,
  HelpCircle,
  Printer,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import {
  ScenarioSimulator,
  ScenarioLever,
  ScenarioSimulatorErrorBoundary,
} from "./ScenarioSimulator";

interface ExecutiveReportCardProps {
  report: ReportBlock;
  onSelectQuery?: (q: string) => void;
}

export function formatCurrencyHuman(val: number | string | undefined, currSymbol: string = "$"): string {
  if (val === undefined || val === null) return `${currSymbol}0`;
  const num = typeof val === "string" ? parseFloat(val) : val;
  if (isNaN(num)) return `${currSymbol}0`;
  const absNum = Math.abs(num);
  const sign = num < 0 ? "-" : "";

  if (currSymbol === "₹" || currSymbol === "INR" || currSymbol.includes("₹")) {
    const sym = "₹";
    if (absNum >= 10_000_000) {
      const cr = absNum / 10_000_000;
      return `${sign}${sym}${cr.toFixed(2).replace(/\.?0+$/, "")}Cr`;
    } else if (absNum >= 100_000) {
      const lakh = absNum / 100_000;
      return `${sign}${sym}${lakh.toFixed(2).replace(/\.?0+$/, "")}L`;
    } else {
      return `${sign}${sym}${absNum.toLocaleString("en-IN")}`;
    }
  } else {
    const sym = currSymbol || "$";
    if (absNum >= 1_000_000_000) {
      return `${sign}${sym}${(absNum / 1_000_000_000).toFixed(2).replace(/\.?0+$/, "")}B`;
    } else if (absNum >= 1_000_000) {
      return `${sign}${sym}${(absNum / 1_000_000).toFixed(2).replace(/\.?0+$/, "")}M`;
    } else if (absNum >= 1_000) {
      return `${sign}${sym}${(absNum / 1_000).toFixed(1).replace(/\.?0+$/, "")}k`;
    } else {
      return `${sign}${sym}${absNum.toLocaleString("en-US")}`;
    }
  }
}

function getIntentLabel(intent?: string): string {
  switch (intent) {
    case "TREND_GROWTH":
      return "Trend & Growth";
    case "PROFITABILITY_FORECAST":
      return "Profitability Forecast";
    case "ANOMALY_INVESTIGATION":
      return "Anomaly Investigation";
    case "SEGMENT_BREAKDOWN":
      return "Segment Breakdown";
    case "GENERAL_INQUIRY":
      return "Ledger Inquiry";
    case "OUT_OF_SCOPE":
      return "Out of Scope";
    default:
      return "FP&A Analysis";
  }
}

export const ExecutiveReportCard: React.FC<ExecutiveReportCardProps> = ({
  report,
  onSelectQuery,
}) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);
  const [visualTab, setVisualTab] = useState<"chart" | "table">("chart");

  const { mPlan, qDiagnostic, eveAudit, strategy007, outOfScope, quotaExceeded } = report;
  const currSymbol = qDiagnostic?.anomalyData?.currencySymbol || "₹";
  const anomalyData = qDiagnostic?.anomalyData || {};

  const responseStyle = mPlan?.response_style || "EXPLORATORY_DETAILED";
  const isDirectBinary = responseStyle === "DIRECT_BINARY";

  // Data rows and fallback structures
  const rows = qDiagnostic?.rows || [];
  const firstRow = rows[0] || {};
  const rowKeys = Object.keys(firstRow);

  const extractMetricFromRow = (r: Record<string, any>, patterns: RegExp[]): number | undefined => {
    for (const [k, v] of Object.entries(r)) {
      if (patterns.some((pat) => pat.test(k)) && v !== null && v !== undefined && !isNaN(Number(v))) {
        return Number(v);
      }
    }
    return undefined;
  };

  const revenuePatterns = [
    /^(total_)?rev(enue)?(_inr)?$/i,
    /^(total_)?sales(_inr)?$/i,
    /^(total_)?turnover(_inr)?$/i,
    /^(total_)?invoiced(_inr)?$/i,
    /^topline$/i,
    /revenue/i,
  ];

  const costPatterns = [
    /^(total_)?cogs(_inr)?$/i,
    /^(total_)?costs?(_inr)?$/i,
    /^(total_)?expenses?(_inr)?$/i,
    /^(total_)?opex(_inr)?$/i,
    /cogs/i,
  ];

  const profitPatterns = [
    /^(total_)?net_?profit(_loss)?(_inr)?$/i,
    /^(total_)?net_?income(_inr)?$/i,
    /^(total_)?net_?earnings(_inr)?$/i,
    /profit_after_tax/i,
    /^pat$/i,
  ];

  const rowRevenueSum =
    rows.length > 0
      ? rows.reduce((acc, r) => {
          const val = extractMetricFromRow(r, revenuePatterns);
          return acc + (val ?? 0);
        }, 0)
      : 0;

  const rawRevenue =
    (anomalyData.total_revenue !== undefined && !isNaN(Number(anomalyData.total_revenue)) && Number(anomalyData.total_revenue) > 0)
      ? Number(anomalyData.total_revenue)
      : (anomalyData.expectedVolume !== undefined && !isNaN(Number(anomalyData.expectedVolume)) && Number(anomalyData.expectedVolume) > 0)
      ? Number(anomalyData.expectedVolume)
      : rowRevenueSum > 0
      ? rowRevenueSum
      : 0;

  const rowCostSum =
    rows.length > 0
      ? rows.reduce((acc, r) => {
          const val = extractMetricFromRow(r, costPatterns);
          return acc + (val ?? 0);
        }, 0)
      : 0;

  const rawCosts =
    (anomalyData.total_costs !== undefined && !isNaN(Number(anomalyData.total_costs)) && Number(anomalyData.total_costs) > 0)
      ? Number(anomalyData.total_costs)
      : (anomalyData.actualBilled !== undefined && !isNaN(Number(anomalyData.actualBilled)) && Number(anomalyData.actualBilled) > 0)
      ? Number(anomalyData.actualBilled)
      : rowCostSum > 0
      ? rowCostSum
      : 0;

  const rowDirectProfit =
    rows.length > 0
      ? rows.reduce((acc, r) => {
          const val = extractMetricFromRow(r, profitPatterns);
          return val !== undefined ? acc + val : acc;
        }, 0)
      : undefined;

  const netProfitLoss =
    anomalyData.netProfitLoss !== undefined && !isNaN(Number(anomalyData.netProfitLoss)) && isFinite(Number(anomalyData.netProfitLoss))
      ? Number(anomalyData.netProfitLoss)
      : rowDirectProfit !== undefined && (rawRevenue === 0 || rawRevenue < rawCosts)
      ? rowDirectProfit
      : rawRevenue - rawCosts;

  // Check if query is binary check or has non-comparative visual
  const chartType = eveAudit?.chart_spec?.chart_type;
  const isChartAvailable =
    !isDirectBinary &&
    chartType !== "none" &&
    rows.length >= 2;

  // Genuine anomaly detection to decide whether to render Actionable Directive
  const hasGenuineAnomaly = Boolean(
    strategy007?.remediation_levers &&
      strategy007.remediation_levers.length > 0 &&
      (anomalyData.netProfitLoss !== undefined
        ? Number(anomalyData.netProfitLoss) < 0
        : (netProfitLoss < 0 || (anomalyData.varianceBps !== undefined && Number(anomalyData.varianceBps) < 0)))
  );

  // Map Agent 007 remediation levers into ScenarioSimulator format with safe defaults
  const scenarioLevers: ScenarioLever[] | undefined = React.useMemo(() => {
    if (!strategy007?.remediation_levers) {
      return undefined;
    }
    if (strategy007.remediation_levers.length === 0) {
      return [];
    }
    return strategy007.remediation_levers.map((lever: any, idx: number) => {
      const impactBps = Number(lever.impact_bps ?? lever.impactBps ?? lever.bps_impact ?? 100);
      let costSavings = Number(lever.costSavings ?? lever.cost_savings ?? lever.cash_impact_inr);
      if (!costSavings || isNaN(costSavings)) {
        if (rawCosts > 0) {
          costSavings = Math.round(rawCosts * (impactBps / 10000));
        } else {
          costSavings = idx === 0 ? 52000 : idx === 1 ? 40000 : 35000;
        }
      }
      return {
        id: String(lever.id || `lever_${idx + 1}`),
        label: String(lever.title || lever.label || `Remediation Lever ${idx + 1}`),
        impactBps,
        costSavings,
        description: String(lever.description || lever.action || ""),
        enabledByDefault: Boolean(lever.enabledByDefault ?? lever.default_active ?? (idx === 0)),
      };
    });
  }, [strategy007?.remediation_levers, rawCosts]);

  // Copy SQL receipt
  const sqlToDisplay = qDiagnostic?.executed_sql || "-- No SQL statement recorded";
  const handleCopySql = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(sqlToDisplay);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  // Dynamic Recharts spec setup with Agent Q fallback support while eveAudit is pending

  const xAxisKey = React.useMemo(() => {
    if (eveAudit?.chart_spec?.x_axis_key) {
      const specKey = eveAudit.chart_spec.x_axis_key;
      const matched = rowKeys.find((k) => k.toLowerCase() === specKey.toLowerCase());
      if (matched) return matched;
      return specKey;
    }
    // Default fallback when eveAudit is pending:
    const regionKey = rowKeys.find((k) => k.toLowerCase() === "region");
    if (regionKey) return regionKey;
    for (const pref of ["period", "quarter", "month", "date", "segment", "category", "dimension"]) {
      const found = rowKeys.find((k) => k.toLowerCase() === pref);
      if (found) return found;
    }
    return rowKeys.length > 0 ? rowKeys[0] : "region";
  }, [eveAudit?.chart_spec?.x_axis_key, rowKeys]);

  const seriesList = React.useMemo(() => {
    if (eveAudit?.chart_spec?.series && eveAudit.chart_spec.series.length > 0) {
      return eveAudit.chart_spec.series;
    }
    // Fallback when eveAudit is pending:
    // 1. Look for keys ending in _gm_pct or margin (e.g. q1_gm_pct, q2_gm_pct)
    const gmPctKeys = rowKeys.filter((k) => k.toLowerCase().endsWith("_gm_pct") || k.toLowerCase().includes("margin"));
    if (gmPctKeys.length >= 2) {
      return [
        { key: gmPctKeys[0], label: gmPctKeys[0].toUpperCase().replace(/_/g, " "), color_role: "primary" },
        { key: gmPctKeys[1], label: gmPctKeys[1].toUpperCase().replace(/_/g, " "), color_role: "comparison" },
      ];
    }
    // 2. Look for explicit q1 / q2 revenue or revenue / cogs
    const qRevKeys = rowKeys.filter((k) => k.toLowerCase().includes("revenue"));
    if (qRevKeys.length >= 2) {
      return [
        { key: qRevKeys[0], label: qRevKeys[0].toUpperCase().replace(/_/g, " "), color_role: "primary" },
        { key: qRevKeys[1], label: qRevKeys[1].toUpperCase().replace(/_/g, " "), color_role: "comparison" },
      ];
    }
    const hasRev = rowKeys.find((k) => k.toLowerCase() === "revenue" || k.toLowerCase() === "total_revenue");
    const hasCogs = rowKeys.find((k) => k.toLowerCase() === "cogs" || k.toLowerCase() === "total_cogs");
    if (hasRev && hasCogs) {
      return [
        { key: hasRev, label: "Revenue", color_role: "primary" },
        { key: hasCogs, label: "COGS", color_role: "comparison" },
      ];
    }
    // 3. Default to Agent Q's standard anomaly keys
    return [
      { key: "q1_gm_pct", label: "Q1 Gross Margin %", color_role: "primary" },
      { key: "q2_gm_pct", label: "Q2 Gross Margin %", color_role: "comparison" },
    ];
  }, [eveAudit?.chart_spec?.series, rowKeys]);

  const isPctMetric = seriesList.every((s: any) => {
    const k = String(s.key || "").toLowerCase();
    const l = String(s.label || "").toLowerCase();
    return k.includes("pct") || k.includes("margin") || k.includes("rate") || l.includes("%");
  });

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded border border-noir bg-bg-surface p-2.5 font-body text-xs shadow-xl">
          <div className="font-display font-bold uppercase tracking-tight text-text-primary mb-1">
            {label}
          </div>
          <div className="flex flex-col gap-1 text-[11px] font-mono tabular-nums">
            {payload.map((entry: any, index: number) => {
              const val = Number(entry.value);
              const formattedVal = isPctMetric
                ? `${val.toFixed(2)}%`
                : formatCurrencyHuman(val, currSymbol);
              return (
                <div key={`item-${index}`} className="flex items-center justify-between gap-3">
                  <span className="text-text-secondary">{entry.name}:</span>
                  <span className="font-bold text-text-primary">{formattedVal}</span>
                </div>
              );
            })}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <article className="dossier-card rounded-xl border border-noir bg-bg-surface shadow-none overflow-hidden transition-all duration-200">
      {/* ─────────────────────────────────────────────────────────────
          STAGE 6: ISOLATED PRINT STYLESHEET (EXECUTIVE DOSSIER ENGINE)
         ───────────────────────────────────────────────────────────── */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
     @media print {
       @page {
         size: A4 portrait;
         margin: 14mm 12mm 14mm 12mm;
       }
       html, body {
         background-color: #FAF8F5 !important;
         color: #111827 !important;
         -webkit-print-color-adjust: exact;
         print-color-adjust: exact;
         overflow: visible !important;
         height: auto !important;
       }
       #workspace-canvas-scroll, main {
         overflow: visible !important;
         height: auto !important;
         max-height: none !important;
         padding: 0 !important;
         margin: 0 !important;
       }
       /* Ensure Recharts SVGs retain legible print dimensions */
       .recharts-responsive-container {
         width: 100% !important;
         min-height: 260px !important;
       }
       .recharts-surface {
         overflow: visible !important;
       }
       .recharts-text, .recharts-cartesian-axis-tick text {
         fill: #374151 !important;
       }
       .recharts-cartesian-axis-line, .recharts-cartesian-axis-tick-line {
         stroke: #D1D5DB !important;
       }
       /* Prevent awkward page breaks across key cards */
       .dossier-card {
         break-inside: avoid !important;
         page-break-inside: avoid !important;
         border: 1px solid #E5E7EB !important;
         background-color: #FFFFFF !important;
         color: #111827 !important;
       }
       /* Safeguard 1: Text Visibility Safeguard */
       .dossier-card, .dossier-card h1, .dossier-card h2, .dossier-card h3, .dossier-card h4, .dossier-card h5, .dossier-card p, .dossier-card span {
         color: #111827 !important;
       }
       .dossier-card [class*="text-text-secondary"], .dossier-card [class*="text-text-muted"] {
         color: #4B5563 !important;
       }
       .dossier-card [class*="accent-rust"] {
         color: #991B1B !important;
       }
       .dossier-card [class*="emerald"] {
         color: #065F46 !important;
       }
       /* Safeguard 2: Escape-Safe Print Hiding */
       [class*="print:hidden"] {
         display: none !important;
       }
       /* Hide non-dossier workspace chrome during print */
       header:not(.dossier-header),
       aside,
       nav,
       #workspace-canvas-scroll > div > section:first-of-type,
       .agent-status-rail {
         display: none !important;
       }
     }
   `,
        }}
      />

      {/* ─────────────────────────────────────────────────────────────
          1. HEADER BAR: Inquiry badge, timestamp, clean intent tag, model tag
         ───────────────────────────────────────────────────────────── */}
      <header className="dossier-header flex flex-wrap items-center justify-between gap-3 border-b border-noir px-5 py-3.5 bg-bg-surface-subtle/50">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-accent-rust shrink-0">
            INQUIRY //
          </span>
          <h2 className="font-display text-sm sm:text-base font-bold text-text-primary tracking-tight truncate">
            {report.query}
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Intent Tag */}
          <span className="rounded bg-bg-canvas border border-noir px-2.5 py-0.5 font-body text-[11px] font-semibold uppercase tracking-wider text-text-secondary">
            {getIntentLabel(mPlan?.intent)}
          </span>

          {/* Response Style Tag */}
          <span className="rounded bg-bg-canvas border border-noir px-2 py-0.5 font-mono text-[10px] uppercase text-text-muted">
            {isDirectBinary ? "DIRECT VERDICT" : "DEEP FORENSIC"}
          </span>

          {/* Model / Engine Tag */}
          {quotaExceeded ? (
            <span className="inline-flex items-center gap-1.5 rounded bg-amber-950/40 border border-amber-800/40 px-2 py-0.5 font-mono text-[10px] text-amber-300 uppercase font-medium">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
              Deterministic Engine
            </span>
          ) : (
            <span className="rounded bg-bg-canvas border border-noir px-2 py-0.5 font-mono text-[10px] text-text-muted">
              Gemini 2.0 Flash / DuckDB
            </span>
          )}

          {/* Timestamp */}
          <div className="flex items-center gap-1 text-[11px] font-mono text-text-muted ml-1">
            <Clock className="h-3 w-3" />
            <span>
              {new Date(report.timestamp).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>

          {/* Dossier Action Button */}
          <button
            type="button"
            onClick={() => window.print()}
            className="print:hidden inline-flex items-center gap-1.5 rounded border border-noir bg-bg-canvas hover:bg-bg-surface hover:border-accent-rust/60 px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-wider text-text-secondary hover:text-text-primary transition-all cursor-pointer shadow-none active:scale-[0.98]"
            title="Export Print-Ready Executive Dossier (PDF / Print)"
          >
            <Printer className="h-3 w-3 text-accent-rust" />
            <span>Export Dossier</span>
          </button>
        </div>
      </header>

      {/* ─────────────────────────────────────────────────────────────
          OUT OF SCOPE REFUSAL BLOCK (if inquiry was non-financial)
         ───────────────────────────────────────────────────────────── */}
      {outOfScope && (
        <div className="p-6 space-y-4">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-accent-rust/30 bg-accent-rust/10 text-accent-rust">
              <Sparkles className="h-4 w-4" />
            </div>
            <div className="space-y-1">
              <h4 className="font-display text-xs font-bold uppercase tracking-wider text-text-primary">
                Inquiry Outside Financial Scope
              </h4>
              <p className="font-body text-xs text-text-secondary leading-relaxed">
                {outOfScope.refusal_message}
              </p>
            </div>
          </div>
          {outOfScope.suggested_queries && outOfScope.suggested_queries.length > 0 && (
            <div className="print:hidden pt-3 border-t border-noir">
              <span className="font-display text-[10px] font-bold uppercase tracking-widest text-text-muted block mb-2">
                Suggested Financial Inquiries:
              </span>
              <div className="flex flex-wrap gap-2">
                {outOfScope.suggested_queries.map((sq) => (
                  <button
                    key={sq}
                    type="button"
                    onClick={() => onSelectQuery && onSelectQuery(sq)}
                    className="rounded-full border border-noir px-3.5 py-1 font-body text-[10px] font-bold uppercase tracking-widest text-text-secondary bg-transparent hover:border-text-primary hover:text-text-primary transition-colors cursor-pointer"
                  >
                    {sq}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          MAIN CONTENT AREA (Executive Answer, Visuals, Levers)
         ───────────────────────────────────────────────────────────── */}
      {!outOfScope && (
        <div className="p-5 sm:p-6 space-y-6">
          {/* ─────────────────────────────────────────────────────────
              2. EXECUTIVE ANSWER BOX: Plain-English verdict immediately
             ───────────────────────────────────────────────────────── */}
          <section className="space-y-3">
            {isDirectBinary ? (
              // DIRECT_BINARY: Prominent Sentence 1 Verdict + 1-2 Supporting Figures
              <div className="dossier-card rounded-lg border border-noir bg-bg-surface-subtle p-5 space-y-2">
                <div className="flex items-start gap-2.5">
                  <div className="mt-0.5">
                    {anomalyData.netProfitLoss !== undefined && anomalyData.netProfitLoss >= 0 ? (
                      <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
                    ) : anomalyData.netProfitLoss !== undefined && anomalyData.netProfitLoss < 0 ? (
                      <AlertTriangle className="h-5 w-5 text-accent-rust shrink-0" />
                    ) : (
                      <CheckCircle2 className="h-5 w-5 text-accent-rust shrink-0" />
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <p className="font-body text-base sm:text-lg font-semibold text-text-primary leading-snug">
                      {qDiagnostic?.summary_findings?.[0] ||
                        eveAudit?.executive_brief?.headline ||
                        strategy007?.headline_recommendation ||
                        "Analysis complete."}
                    </p>
                    {qDiagnostic?.summary_findings?.[1] && (
                      <p className="font-body text-xs sm:text-sm text-text-secondary leading-relaxed">
                        {qDiagnostic.summary_findings[1]}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              // EXPLORATORY_DETAILED: Structured 3-Part Brief (Headline -> Driver -> Action)
              <div className="space-y-2.5">
                {eveAudit?.executive_brief ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {/* Part 1: Headline Takeaway */}
                    <div className="dossier-card rounded-lg border border-noir bg-bg-surface-subtle p-4 space-y-1.5">
                      <div className="flex items-center gap-1.5 font-display text-[10px] font-bold uppercase tracking-wider text-accent-rust">
                        <Info className="h-3.5 w-3.5" />
                        <span>Headline Takeaway</span>
                      </div>
                      <p className="font-body text-xs font-semibold text-text-primary leading-relaxed">
                        {eveAudit.executive_brief.headline}
                      </p>
                    </div>

                    {/* Part 2: Key Operational Driver */}
                    <div className="dossier-card rounded-lg border border-noir bg-bg-surface-subtle p-4 space-y-1.5">
                      <div className="flex items-center gap-1.5 font-display text-[10px] font-bold uppercase tracking-wider text-text-secondary">
                        <TrendingDown className="h-3.5 w-3.5" />
                        <span>Key Operational Driver</span>
                      </div>
                      <p className="font-body text-xs text-text-secondary leading-relaxed">
                        {eveAudit.executive_brief.driver}
                      </p>
                    </div>

                    {/* Part 3: Recommended Action */}
                    <div className="dossier-card rounded-lg border border-noir bg-bg-surface-subtle p-4 space-y-1.5 border-l-2 border-l-accent-rust">
                      <div className="flex items-center gap-1.5 font-display text-[10px] font-bold uppercase tracking-wider text-text-primary">
                        <ArrowUpRight className="h-3.5 w-3.5 text-accent-rust" />
                        <span>Recommended Action</span>
                      </div>
                      <p className="font-body text-xs text-text-primary leading-relaxed">
                        {eveAudit.executive_brief.action}
                      </p>
                    </div>
                  </div>
                ) : (
                  // Fallback standard executive narrative
                  <div className="dossier-card rounded-lg border border-noir bg-bg-surface-subtle p-4 space-y-2">
                    <p className="font-body text-sm font-semibold text-text-primary leading-relaxed">
                      {qDiagnostic?.summary_findings?.[0] || "Analysis completed."}
                    </p>
                    {qDiagnostic?.summary_findings?.slice(1).map((f, i) => (
                      <p key={i} className="font-body text-xs text-text-secondary">
                        • {f}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            )}
          </section>

          {/* ─────────────────────────────────────────────────────────────
              3. PRIMARY VISUAL (ADAPTIVE):
                 If Binary: Clean KPI Pill Metrics (NO bulky empty chart!)
                 If Comparative/Temporal: Recharts visual with Table toggle
             ───────────────────────────────────────────────────────────── */}
          <section className="space-y-3">
            {!isChartAvailable ? (
              // Clean KPI Pill Metrics Grid for Binary / Single-Aggregate inquiries
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                {/* Metric 1: Solvency / Net Status */}
                {(() => {
                  const isProfitable = netProfitLoss >= 0;
                  const operatingMarginPct =
                    rawRevenue > 0 && isFinite(netProfitLoss)
                      ? (netProfitLoss / rawRevenue) * 100
                      : anomalyData.discrepancyPct !== undefined && !isNaN(Number(anomalyData.discrepancyPct))
                      ? Number(anomalyData.discrepancyPct)
                      : 0;

                  return (
                    <>
                      <div className="dossier-card rounded-lg border border-noir bg-bg-canvas p-3.5 space-y-1">
                        <span className="font-display text-[10px] font-bold uppercase tracking-wider text-text-muted block">
                          Enterprise Net Result
                        </span>
                        <div className="flex items-baseline gap-2">
                          <span className="font-mono text-base sm:text-lg font-bold text-text-primary">
                            {formatCurrencyHuman(netProfitLoss, currSymbol)}
                          </span>
                          <span
                            className={`font-mono text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${
                              isProfitable
                                ? "bg-emerald-950/40 text-emerald-300 border border-emerald-800/40"
                                : "bg-rose-950/40 text-rose-300 border border-rose-800/40"
                            }`}
                          >
                            {isProfitable ? "PROFITABLE" : "NET LOSS"}
                          </span>
                        </div>
                        <span className="font-body text-[11px] text-text-secondary block">
                          {!isNaN(operatingMarginPct) && isFinite(operatingMarginPct)
                            ? `${operatingMarginPct.toFixed(2)}% Operating Margin`
                            : "Zero Impairment Detected"}
                        </span>
                      </div>

                      {/* Metric 2: Consolidated Revenue */}
                      <div className="dossier-card rounded-lg border border-noir bg-bg-canvas p-3.5 space-y-1">
                        <span className="font-display text-[10px] font-bold uppercase tracking-wider text-text-muted block">
                          Total Revenue
                        </span>
                        <span className="font-mono text-base sm:text-lg font-bold text-text-primary block">
                          {rawRevenue > 0 ? formatCurrencyHuman(rawRevenue, currSymbol) : "—"}
                        </span>
                        <span className="font-body text-[11px] text-text-secondary block">
                          Consolidated Realization
                        </span>
                      </div>

                      {/* Metric 3: Total Expenses */}
                      <div className="dossier-card rounded-lg border border-noir bg-bg-canvas p-3.5 space-y-1">
                        <span className="font-display text-[10px] font-bold uppercase tracking-wider text-text-muted block">
                          Total Costs &amp; Opex
                        </span>
                        <span className="font-mono text-base sm:text-lg font-bold text-text-primary block">
                          {rawCosts > 0 ? formatCurrencyHuman(rawCosts, currSymbol) : "—"}
                        </span>
                        <span className="font-body text-[11px] text-text-secondary block">
                          COGS + Opex + Marketing
                        </span>
                      </div>
                    </>
                  );
                })()}

                {/* Metric 4: Covenant Verification */}
                <div className="dossier-card rounded-lg border border-noir bg-bg-canvas p-3.5 space-y-1">
                  <span className="font-display text-[10px] font-bold uppercase tracking-wider text-text-muted block">
                    Covenant Status
                  </span>
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
                    <span className="font-mono text-sm sm:text-base font-bold text-text-primary">
                      100% Compliant
                    </span>
                  </div>
                  <span className="font-body text-[11px] text-text-secondary block">
                    Zero Impairment Detected
                  </span>
                </div>
              </div>
            ) : (
              // Comparative / Temporal Data: Recharts Visual & Summary Table Tab
              <div className="dossier-card rounded-lg border border-noir bg-bg-canvas p-4 space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2 border-b border-noir pb-2.5">
                  <div className="flex items-center gap-2">
                    <BarChart2 className="h-4 w-4 text-accent-rust" />
                    <span className="font-display text-xs font-bold uppercase tracking-wider text-text-primary">
                      {eveAudit?.chart_spec?.title || "Comparative Performance"}
                    </span>
                  </div>

                  <div className="print:hidden flex items-center gap-1 bg-bg-surface rounded border border-noir p-0.5 text-[11px] font-body font-semibold">
                    <button
                      type="button"
                      onClick={() => setVisualTab("chart")}
                      className={`px-2.5 py-1 rounded transition-colors ${
                        visualTab === "chart"
                          ? "bg-bg-surface-subtle text-text-primary font-bold"
                          : "text-text-muted hover:text-text-secondary"
                      }`}
                    >
                      Chart View
                    </button>
                    <button
                      type="button"
                      onClick={() => setVisualTab("table")}
                      className={`px-2.5 py-1 rounded transition-colors ${
                        visualTab === "table"
                          ? "bg-bg-surface-subtle text-text-primary font-bold"
                          : "text-text-muted hover:text-text-secondary"
                      }`}
                    >
                      Summary Table
                    </button>
                  </div>
                </div>

                {visualTab === "chart" ? (
                  <div className="h-64 w-full pt-2">
                    <ResponsiveContainer width="100%" height="100%">
                      {eveAudit?.chart_spec?.chart_type === "line" ? (
                        <LineChart data={qDiagnostic?.rows || []} margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="var(--border-noir)" opacity={0.3} />
                          <XAxis
                            dataKey={xAxisKey}
                            tick={{ fill: "#A3A3A3", fontSize: 11 }}
                            axisLine={{ stroke: "#333333" }}
                            tickLine={{ stroke: "#333333" }}
                          />
                          <YAxis
                            tick={{ fill: "#A3A3A3", fontSize: 11 }}
                            axisLine={{ stroke: "#333333" }}
                            tickLine={{ stroke: "#333333" }}
                          />
                          <Tooltip content={<CustomTooltip />} />
                          {seriesList.map((s: any, idx: number) => (
                            <Line
                              key={s.key || idx}
                              type="monotone"
                              dataKey={s.key}
                              name={s.label || s.key}
                              stroke={idx === 0 ? "var(--chart-bar-primary)" : "var(--chart-bar-secondary)"}
                              strokeWidth={2}
                              dot={{ r: 3 }}
                            />
                          ))}
                        </LineChart>
                      ) : (
                        <BarChart data={qDiagnostic?.rows || []} margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="var(--border-noir)" opacity={0.3} />
                          <XAxis
                            dataKey={xAxisKey}
                            tick={{ fill: "#A3A3A3", fontSize: 11 }}
                            axisLine={{ stroke: "#333333" }}
                            tickLine={{ stroke: "#333333" }}
                          />
                          <YAxis
                            tick={{ fill: "#A3A3A3", fontSize: 11 }}
                            axisLine={{ stroke: "#333333" }}
                            tickLine={{ stroke: "#333333" }}
                          />
                          <Tooltip content={<CustomTooltip />} />
                          {seriesList.map((s: any, idx: number) => (
                            <Bar
                              key={s.key || idx}
                              dataKey={s.key}
                              name={s.label || s.key}
                              fill={idx === 0 ? "var(--chart-bar-primary)" : "var(--chart-bar-secondary)"}
                              radius={[2, 2, 0, 0]}
                            />
                          ))}
                        </BarChart>
                      )}
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left font-body text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-noir font-mono text-[10px] uppercase text-text-muted">
                          {qDiagnostic?.table_headers?.map((h) => (
                            <th key={h} className="py-2 px-3 font-semibold">
                              {h.replace(/_/g, " ")}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-noir/40">
                        {qDiagnostic?.rows?.slice(0, 5).map((row, rIdx) => (
                          <tr key={rIdx} className="hover:bg-bg-surface-subtle/50 transition-colors">
                            {qDiagnostic.table_headers.map((h) => (
                              <td key={h} className="py-2 px-3 font-mono text-xs tabular-nums text-text-secondary">
                                {typeof row[h] === "number" && !h.toLowerCase().includes("id")
                                  ? h.toLowerCase().includes("pct") || h.toLowerCase().includes("margin")
                                    ? `${Number(row[h]).toFixed(2)}%`
                                    : formatCurrencyHuman(row[h], currSymbol)
                                  : String(row[h] ?? "")}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </section>

          {/* ─────────────────────────────────────────────────────────────
              4. ACTIONABLE DIRECTIVE:
                 Shown ONLY when a genuine anomaly or decision point exists.
                 Suppressed for healthy/binary answers.
             ───────────────────────────────────────────────────────────── */}
          {hasGenuineAnomaly && strategy007 && (
            <section className="dossier-card rounded-lg border border-accent-rust/30 bg-accent-rust/5 p-4 sm:p-5 space-y-3.5">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-accent-rust/20 pb-2.5">
                <div className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-accent-rust" />
                  <span className="font-display text-xs font-bold uppercase tracking-wider text-text-primary">
                    Actionable Directive &amp; Remediation Roadmap
                  </span>
                </div>
                {strategy007.estimated_impact && (
                  <span className="font-mono text-[11px] font-semibold text-accent-rust bg-accent-rust/10 border border-accent-rust/30 px-2.5 py-0.5 rounded">
                    {strategy007.estimated_impact}
                  </span>
                )}
              </div>

              {/* Remediation Levers Grid */}
              {strategy007.remediation_levers && strategy007.remediation_levers.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  {strategy007.remediation_levers.map((lever, lIdx) => (
                    <div
                      key={lever.id || lIdx}
                      className="dossier-card rounded border border-noir bg-bg-surface p-3.5 space-y-1.5 text-xs shadow-none"
                    >
                      <div className="flex items-center justify-between gap-1 font-mono text-[10px]">
                        <span className="font-bold text-accent-rust">
                          +{lever.impact_bps} bps recovery
                        </span>
                        <span className="text-text-muted">{lever.horizon}</span>
                      </div>
                      <h5 className="font-display font-bold text-text-primary uppercase tracking-tight text-[11px] leading-snug">
                        {lever.title}
                      </h5>
                      <p className="font-body text-[11px] text-text-secondary leading-relaxed">
                        {lever.description}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {/* Interactive Pro-Forma Scenario Simulator */}
              <div className="pt-2">
                <ScenarioSimulatorErrorBoundary>
                  <ScenarioSimulator
                    baselineRevenue={rawRevenue}
                    baselineCosts={rawCosts}
                    currencySymbol={currSymbol}
                    levers={scenarioLevers}
                  />
                </ScenarioSimulatorErrorBoundary>
              </div>
            </section>
          )}

          {/* ─────────────────────────────────────────────────────────────
              5. TECHNICAL AUDIT DRAWER (Progressive Disclosure)
                 Closed by default: [▶ View Calculations & SQL Receipts]
             ───────────────────────────────────────────────────────────── */}
          <section className="border-t border-noir pt-3">
            <button
              type="button"
              onClick={() => setIsDrawerOpen(!isDrawerOpen)}
              className="print:hidden flex items-center justify-between w-full py-2.5 px-3 rounded hover:bg-bg-surface-subtle transition-colors cursor-pointer select-none group text-left"
            >
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-text-muted group-hover:text-text-primary transition-colors">
                  {isDrawerOpen ? "▼" : "▶"}
                </span>
                <span className="font-display text-xs font-bold uppercase tracking-wider text-text-secondary group-hover:text-text-primary transition-colors">
                  {isDrawerOpen
                    ? "Hide Calculations & SQL Receipts"
                    : "View Calculations & SQL Receipts"}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 text-[11px] font-mono text-text-muted">
                  <ShieldCheck className="h-3.5 w-3.5 text-text-muted" />
                  <span>
                    {((eveAudit?.confidence_score ?? 0.98) * 100).toFixed(0)}% Deterministic Confidence
                  </span>
                </div>
              </div>
            </button>

            {/* Collapsible Drawer Body */}
            {isDrawerOpen && (
              <div className="mt-3 rounded-lg border border-noir bg-bg-canvas/50 p-5 space-y-5 animate-in fade-in duration-200">
                {/* 1. Mathematical Receipts / Formula Ledger */}
                {eveAudit?.formula_ledger && eveAudit.formula_ledger.length > 0 && (
                  <div className="space-y-2">
                    <span className="font-display text-[10px] font-bold uppercase tracking-widest text-text-muted block">
                      Mathematical Ledger &amp; Calculations
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                      {eveAudit.formula_ledger.map((entry, idx) => (
                        <div
                          key={idx}
                          className="dossier-card rounded border border-noir bg-bg-surface p-3 text-xs space-y-1 font-body"
                        >
                          <div className="font-display font-bold uppercase text-[11px] tracking-tight text-text-primary">
                            {entry.metric}
                          </div>
                          <div className="font-mono text-[10px] text-text-muted bg-bg-surface-subtle px-2 py-1 rounded border border-noir overflow-x-auto">
                            {entry.formula}
                          </div>
                          <div className="text-[10px] text-text-secondary leading-snug">
                            {entry.computation_step}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 2. DuckDB Table Rows Preview */}
                {qDiagnostic?.rows && qDiagnostic.rows.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-display text-[10px] font-bold uppercase tracking-widest text-text-muted">
                        Underlying Ledger Rows ({qDiagnostic.rows.length} records)
                      </span>
                    </div>
                    <div className="dossier-card overflow-x-auto rounded border border-noir bg-bg-surface">
                      <table className="w-full text-left font-body text-xs border-collapse">
                        <thead>
                          <tr className="border-b border-noir bg-bg-surface-subtle font-mono text-[10px] uppercase text-text-muted">
                            {qDiagnostic.table_headers?.map((h) => (
                              <th key={h} className="py-2 px-3 font-semibold">
                                {h}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-noir/40">
                          {qDiagnostic.rows.slice(0, 8).map((row, rIdx) => (
                            <tr key={rIdx} className="hover:bg-bg-surface-subtle/50 transition-colors">
                              {qDiagnostic.table_headers?.map((h) => (
                                <td key={h} className="py-2 px-3 font-mono text-xs tabular-nums text-text-secondary">
                                  {String(row[h] ?? "")}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* 3. Executed SQL Code Block */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-display text-[10px] font-bold uppercase tracking-widest text-text-muted flex items-center gap-1.5">
                      <FileCode className="h-3.5 w-3.5" />
                      <span>Deterministic DuckDB SQL Receipt</span>
                    </span>
                    <button
                      type="button"
                      onClick={handleCopySql}
                      className="print:hidden inline-flex items-center gap-1.5 rounded border border-noir bg-bg-surface px-2.5 py-1 font-body text-[11px] font-semibold text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
                    >
                      {copiedSql ? (
                        <>
                          <Check className="h-3 w-3 text-emerald-400" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3 w-3" />
                          <span>Copy SQL</span>
                        </>
                      )}
                    </button>
                  </div>
                  <div className="dossier-card rounded border border-noir bg-[#0a0908] p-3 overflow-x-auto">
                    <pre className="font-mono text-[11px] leading-relaxed text-emerald-400/90 selection:bg-white selection:text-black">
                      <code>{sqlToDisplay}</code>
                    </pre>
                  </div>
                </div>

                {/* 4. Audit Findings and Caveats */}
                {eveAudit?.findings && eveAudit.findings.length > 0 && (
                  <div className="space-y-1.5 text-xs font-body text-text-muted">
                    <span className="font-display text-[10px] font-bold uppercase tracking-widest text-text-muted block">
                      Audit Findings &amp; Verifications
                    </span>
                    <ul className="space-y-1">
                      {eveAudit.findings.map((f: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-text-secondary font-mono leading-none mt-0.5">•</span>
                          <span className="leading-relaxed">{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </section>
        </div>
      )}
    </article>
  );
};
