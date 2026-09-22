"use client";

import React, { useState } from "react";
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
  Legend,
} from "recharts";
import {
  BarChart2,
  TrendingUp,
  LineChart as LineIcon,
  Table as TableIcon,
  ChevronDown,
  ChevronRight,
  Database,
} from "lucide-react";
import { Eve_Audit, Q_Diagnostic } from "@/types/contracts";
import { DataTableCard } from "./DataTableCard";

interface VisualEvidenceProps {
  audit: Eve_Audit;
  diagnostic?: Q_Diagnostic;
}

export const VisualEvidence: React.FC<VisualEvidenceProps> = ({
  audit,
  diagnostic,
}) => {
  // Tab state: "chart" | "table"
  const [activeTab, setActiveTab] = useState<"chart" | "table">("chart");
  const [chartMode, setChartMode] = useState<"bar" | "line">(
    audit.chart_spec.chart_type === "bar" ? "bar" : "line"
  );
  // Optional collapsible table drawer under chart view
  const [isTableExpandedUnderChart, setIsTableExpandedUnderChart] = useState(false);

  // Fallback or diagnostic row data
  const data = diagnostic?.rows || [
    { region: "North America", q1_gm_pct: 42.25, q2_gm_pct: 41.72 },
    { region: "South (LATAM)", q1_gm_pct: 43.75, q2_gm_pct: 31.82 },
    { region: "EMEA (East)", q1_gm_pct: 42.61, q2_gm_pct: 42.98 },
    { region: "APAC (West)", q1_gm_pct: 43.75, q2_gm_pct: 43.37 },
  ];

  const seriesColorMap = {
    primary: "var(--chart-bar-primary)",
    comparison: "var(--chart-bar-secondary)",
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded border border-noir bg-bg-surface p-3 font-body text-xs shadow-none">
          <div className="font-display font-bold uppercase tracking-tight text-text-primary mb-1.5">{label}</div>
          <div className="flex flex-col gap-1 text-[11px] font-mono tabular-nums">
            {payload.map((entry: any, index: number) => (
              <div key={`item-${index}`} className="flex items-center justify-between gap-4">
                <span className="text-text-secondary">{entry.name}:</span>
                <span className="font-bold text-text-primary tabular-nums">
                  {Number(entry.value).toFixed(2)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <section className="rounded-lg border border-noir bg-bg-surface p-6 sm:p-7 shadow-none transition-all relative overflow-hidden">
      {/* ── Tier 2 Header with Segmented Tab Switcher ── */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-noir mb-6">
        <div className="flex items-center gap-3">
          <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded border border-noir bg-bg-surface-subtle text-text-secondary">
            <LineIcon className="h-3.5 w-3.5" />
          </div>
          <span className="font-display text-lg font-bold uppercase tracking-tight text-text-primary leading-none">
            Tier 2: Visual Evidence &amp; Supporting Ledger
          </span>
          <span className="text-text-secondary/40 mx-2 text-xs">|</span>
          <span className="text-xs uppercase tracking-wider font-body font-medium italic text-text-secondary">
            AGENT EVE &amp; AGENT Q • TRAJECTORY &amp; TELEMETRY
          </span>
        </div>

        {/* Tab Switcher — Single-line executive control */}
        <div className="flex items-center rounded border border-noir bg-bg-surface-subtle p-0.5">
          <button
            onClick={() => setActiveTab("chart")}
            className={`h-8 px-3.5 whitespace-nowrap text-xs font-body uppercase tracking-wider inline-flex items-center gap-2 rounded transition-colors leading-none cursor-pointer ${
              activeTab === "chart"
                ? "bg-accent-contrast text-bg-canvas font-bold"
                : "text-text-secondary hover:text-text-primary"
            }`}
          >
            <BarChart2 className="h-3.5 w-3.5" />
            <span>Visual Trajectory</span>
          </button>
          <button
            onClick={() => setActiveTab("table")}
            className={`h-8 px-3.5 whitespace-nowrap text-xs font-body uppercase tracking-wider inline-flex items-center gap-2 rounded transition-colors leading-none cursor-pointer ${
              activeTab === "table"
                ? "bg-accent-contrast text-bg-canvas font-bold"
                : "text-text-secondary hover:text-text-primary"
            }`}
          >
            <TableIcon className="h-3.5 w-3.5" />
            <span>Supporting Ledger</span>
            <span className="hidden sm:inline-block text-[10px] opacity-75 font-mono">
              (10 Columns)
            </span>
          </button>
        </div>
      </div>

      {/* ── View 1: Elevated Visual Chart ── */}
      {activeTab === "chart" && (
        <div className="space-y-4">
          {/* Chart Controls Bar */}
          <div className="flex items-center justify-between gap-4 flex-wrap pb-1">
            <div className="font-display text-base font-bold uppercase tracking-tight text-text-primary">
              {audit.chart_spec.title || "Regional Gross Margin Trajectory (Q1 vs Q2 2026)"}
            </div>

            {/* Bar vs Line Toggle */}
            <div className="flex items-center rounded border border-noir bg-transparent p-0.5">
              <button
                onClick={() => setChartMode("bar")}
                className={`h-7 px-3 whitespace-nowrap text-xs uppercase tracking-wider font-body inline-flex items-center gap-1.5 rounded transition-colors leading-none cursor-pointer ${
                  chartMode === "bar"
                    ? "bg-accent-contrast text-bg-canvas font-bold"
                    : "text-text-secondary hover:text-text-primary"
                }`}
              >
                <BarChart2 className="h-3 w-3" />
                <span>Bar</span>
              </button>
              <button
                onClick={() => setChartMode("line")}
                className={`h-7 px-3 whitespace-nowrap text-xs uppercase tracking-wider font-body inline-flex items-center gap-1.5 rounded transition-colors leading-none cursor-pointer ${
                  chartMode === "line"
                    ? "bg-accent-contrast text-bg-canvas font-bold"
                    : "text-text-secondary hover:text-text-primary"
                }`}
              >
                <TrendingUp className="h-3 w-3" />
                <span>Line</span>
              </button>
            </div>
          </div>

          {/* Elevated Recharts Container with Nautical Radar Watermark */}
          <div className="relative h-[320px] w-full rounded border border-noir bg-bg-canvas/50 p-3 overflow-hidden">
            {/* Cold War Nautical Radar / Trajectory Vector Watermark */}
            <div
              className="pointer-events-none select-none absolute inset-0 flex items-center justify-center opacity-[0.08] z-0"
              style={{ mixBlendMode: "var(--dither-blend)" as any }}
            >
              <svg viewBox="0 0 600 320" className="w-full h-full text-text-secondary stroke-current fill-none">
                <circle cx="300" cy="160" r="140" strokeWidth="0.75" />
                <circle cx="300" cy="160" r="95" strokeWidth="0.5" strokeDasharray="4 4" />
                <circle cx="300" cy="160" r="50" strokeWidth="0.5" />
                <line x1="80" y1="160" x2="520" y2="160" strokeWidth="0.5" />
                <line x1="300" y1="20" x2="300" y2="300" strokeWidth="0.5" />
                <line x1="178" y1="38" x2="422" y2="282" strokeWidth="0.5" strokeDasharray="3 3" />
                <line x1="178" y1="282" x2="422" y2="38" strokeWidth="0.5" strokeDasharray="3 3" />
                <line x1="300" y1="160" x2="480" y2="70" strokeWidth="1" />
                <polygon points="480,70 468,72 474,80" fill="currentColor" />
              </svg>
            </div>

            <div className="relative z-10 h-full w-full">
              <ResponsiveContainer width="100%" height="100%">
                {chartMode === "bar" ? (
                  <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
                    <XAxis
                      dataKey="region"
                      stroke="var(--text-secondary)"
                      tick={{ fill: "var(--text-secondary)", fontSize: 11, fontFamily: "var(--font-sans), sans-serif" }}
                      tickLine={{ stroke: "var(--chart-grid)" }}
                    />
                    <YAxis
                      unit="%"
                      domain={[20, 50]}
                      stroke="var(--text-secondary)"
                      tick={{ fill: "var(--text-secondary)", fontSize: 11, fontFamily: "ui-monospace, monospace" }}
                      tickLine={{ stroke: "var(--chart-grid)" }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend
                      wrapperStyle={{
                        paddingTop: "8px",
                        fontSize: "11px",
                        fontFamily: "var(--font-sans), sans-serif",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                      }}
                    />
                    <Bar
                      dataKey="q1_gm_pct"
                      name="Q1 Gross Margin %"
                      fill="var(--chart-bar-secondary)"
                      radius={[2, 2, 0, 0]}
                    />
                    <Bar
                      dataKey="q2_gm_pct"
                      name="Q2 Gross Margin %"
                      fill="var(--chart-bar-primary)"
                      radius={[2, 2, 0, 0]}
                    />
                  </BarChart>
                ) : (
                  <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
                    <XAxis
                      dataKey="region"
                      stroke="var(--text-secondary)"
                      tick={{ fill: "var(--text-secondary)", fontSize: 11, fontFamily: "var(--font-sans), sans-serif" }}
                      tickLine={{ stroke: "var(--chart-grid)" }}
                    />
                    <YAxis
                      unit="%"
                      domain={[20, 50]}
                      stroke="var(--text-secondary)"
                      tick={{ fill: "var(--text-secondary)", fontSize: 11, fontFamily: "ui-monospace, monospace" }}
                      tickLine={{ stroke: "var(--chart-grid)" }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend
                      wrapperStyle={{
                        paddingTop: "8px",
                        fontSize: "11px",
                        fontFamily: "var(--font-sans), sans-serif",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="q1_gm_pct"
                      name="Q1 Gross Margin %"
                      stroke="var(--chart-bar-secondary)"
                      strokeWidth={2}
                      dot={{ r: 4, fill: "var(--chart-bar-secondary)" }}
                    />
                    <Line
                      type="monotone"
                      dataKey="q2_gm_pct"
                      name="Q2 Gross Margin %"
                      stroke="var(--chart-bar-primary)"
                      strokeWidth={2.5}
                      dot={{ r: 5, fill: "var(--chart-bar-primary)" }}
                    />
                  </LineChart>
                )}
              </ResponsiveContainer>
            </div>
          </div>

          {/* Collapsible Secondary Ledger Slice (Under-Chart Reveal) */}
          {diagnostic && (
            <div className="pt-2">
              <button
                onClick={() => setIsTableExpandedUnderChart(!isTableExpandedUnderChart)}
                className="w-full flex items-center justify-between p-3 rounded border border-noir bg-bg-surface-subtle hover:bg-bg-surface text-xs font-body text-text-secondary hover:text-text-primary transition-colors cursor-pointer select-none"
              >
                <div className="flex items-center gap-2">
                  {isTableExpandedUnderChart ? (
                    <ChevronDown className="h-3.5 w-3.5" />
                  ) : (
                    <ChevronRight className="h-3.5 w-3.5" />
                  )}
                  <span className="font-semibold uppercase tracking-wider text-[11px]">
                    {isTableExpandedUnderChart
                      ? "Hide Supporting Financial Ledger Slice"
                      : "▶ Show Supporting Financial Ledger Slice (DuckDB Ledger • 10 Columns)"}
                  </span>
                </div>
                <span className="font-mono text-[10px] text-text-secondary/75">
                  Agent Q • {diagnostic.execution_time_ms.toFixed(1)}ms
                </span>
              </button>

              {isTableExpandedUnderChart && (
                <div className="mt-3 pt-1 animate-in fade-in duration-200">
                  <DataTableCard diagnostic={diagnostic} />
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── View 2: Supporting Ledger Tab ── */}
      {activeTab === "table" && diagnostic && (
        <div className="space-y-3 animate-in fade-in duration-200">
          <DataTableCard diagnostic={diagnostic} />
        </div>
      )}
    </section>
  );
};
