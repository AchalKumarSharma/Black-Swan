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
import { BarChart2, TrendingUp, LineChart as LineIcon } from "lucide-react";
import { Eve_Audit, Q_Diagnostic } from "@/types/contracts";

interface DynamicVisualCardProps {
  audit: Eve_Audit;
  diagnostic?: Q_Diagnostic;
}

export const DynamicVisualCard: React.FC<DynamicVisualCardProps> = ({
  audit,
  diagnostic,
}) => {
  const [chartMode, setChartMode] = useState<"bar" | "line">(
    audit.chart_spec.chart_type === "bar" ? "bar" : "line"
  );

  // Use diagnostic rows or fallback chart data
  const data = diagnostic?.rows || [
    { region: "North America", q1_gm_pct: 42.25, q2_gm_pct: 41.72 },
    { region: "South (LATAM)", q1_gm_pct: 43.75, q2_gm_pct: 31.82 },
    { region: "EMEA (East)", q1_gm_pct: 42.61, q2_gm_pct: 42.98 },
    { region: "APAC (West)", q1_gm_pct: 43.75, q2_gm_pct: 43.37 },
  ];

  // Theme-constrained palette: NO blue, NO bright green
  const seriesColorMap: Record<string, string> = {
    primary: "var(--chart-bar-primary)",
    comparison: "var(--chart-bar-secondary)",
    benchmark: "var(--text-secondary)",
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded border border-noir bg-bg-surface p-2.5 font-sans text-xs shadow-none">
          <div className="font-serif font-bold text-text-primary mb-1.5">{label}</div>
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
    <section className="rounded-md border border-noir bg-bg-surface p-6 mb-6 shadow-none transition-all">
      {/* Card Header — Standardized */}
      <div className="flex items-center justify-between gap-4 pb-3 border-b border-noir mb-5">
        <div className="flex items-center gap-3">
          <div className="flex h-5 w-5 flex-shrink-0 items-center justify-center text-text-secondary">
            <LineIcon className="h-4 w-4" />
          </div>
          <span className="font-serif text-base font-bold text-text-primary leading-none tracking-tight">
            Stage 3: {audit.chart_spec.title || "Regional Gross Margin Trajectory"}
          </span>
          <span className="text-text-secondary/40 mx-2 text-xs">|</span>
          <span className="text-xs uppercase tracking-wider font-sans font-medium text-text-secondary">
            AGENT EVE • RECHARTS SPECIFICATION
          </span>
        </div>

        {/* View Mode Switcher (Bar vs Line) — aligned to header baseline with h-8 height */}
        <div className="flex items-center gap-2">
          <div className="flex items-center rounded border border-noir bg-transparent p-0.5">
            <button
              onClick={() => setChartMode("bar")}
              className={`h-8 px-3.5 whitespace-nowrap text-xs uppercase tracking-wider font-sans inline-flex items-center justify-center gap-1.5 rounded transition-colors leading-none cursor-pointer ${
                chartMode === "bar"
                  ? "bg-accent-contrast text-bg-canvas font-semibold"
                  : "text-text-secondary hover:text-text-primary"
              }`}
            >
              <BarChart2 className="h-3 w-3" />
              <span>Bar</span>
            </button>
            <button
              onClick={() => setChartMode("line")}
              className={`h-8 px-3.5 whitespace-nowrap text-xs uppercase tracking-wider font-sans inline-flex items-center justify-center gap-1.5 rounded transition-colors leading-none cursor-pointer ${
                chartMode === "line"
                  ? "bg-accent-contrast text-bg-canvas font-semibold"
                  : "text-text-secondary hover:text-text-primary"
              }`}
            >
              <TrendingUp className="h-3 w-3" />
              <span>Line</span>
            </button>
          </div>
        </div>
      </div>

      {/* Recharts Container with Nautical Radar / Trajectory Grid Watermark */}
      <div className="relative h-[320px] w-full rounded border border-noir bg-bg-canvas/50 p-2 overflow-hidden">
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
    </section>
  );
};
