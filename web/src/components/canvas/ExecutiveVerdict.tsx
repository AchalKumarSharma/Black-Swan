"use client";

import React, { useState } from "react";
import {
  AlertTriangle,
  TrendingDown,
  TrendingUp,
  ShieldAlert,
  Sliders,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { Q_Diagnostic, Agent007_Strategy } from "@/types/contracts";

interface ExecutiveVerdictProps {
  diagnostic: Q_Diagnostic;
  strategy?: Agent007_Strategy | null;
}

export const ExecutiveVerdict: React.FC<ExecutiveVerdictProps> = ({
  diagnostic,
  strategy,
}) => {
  const anomaly = diagnostic.anomalies_detected?.[0];

  // Lever 1: South Region COGS Adjustment (-20% to +10%, default -12%)
  const [cogsAdjustment, setCogsAdjustment] = useState<number>(-12);

  // Dynamic pro-forma calculations based on South Region COGS ($525,000) and Enterprise Revenue ($4,410,000)
  const baseSouthCogs = 525000;
  const baseEnterpriseRevenue = 4410000;

  // COGS delta in South region
  const cogsSavingsQuarterly = -(baseSouthCogs * (cogsAdjustment / 100));
  const cogsSavingsMonthly = Math.round(cogsSavingsQuarterly / 3);

  // Consolidated Gross Margin Recovery percentage points
  const marginRecoveryPct = (cogsSavingsQuarterly / baseEnterpriseRevenue) * 100;
  const marginRecoveryBps = Math.round(marginRecoveryPct * 100);

  return (
    <section className="rounded-lg border border-noir bg-bg-surface p-6 sm:p-7 shadow-none transition-colors duration-200 relative overflow-hidden text-text-primary">
      {/* ── Tier 1 Header ── */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-noir mb-6">
        <div className="flex items-center gap-3">
          <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded border border-accent-rust/40 bg-accent-rust/10 text-accent-rust">
            <ShieldAlert className="h-3.5 w-3.5" />
          </div>
          <span className="font-display text-lg font-bold uppercase tracking-tight text-text-primary leading-none">
            Tier 1: Executive Verdict &amp; Strategic Levers
          </span>
          <span className="text-text-secondary/40 mx-2 text-xs">|</span>
          <span className="text-xs uppercase tracking-wider font-body font-medium italic text-text-secondary">
            Agent Q &amp; Agent 007 • Root Cause &amp; Remediation
          </span>
        </div>

        <div className="h-8 px-3.5 whitespace-nowrap text-xs font-body font-bold uppercase tracking-wider inline-flex items-center gap-2 border border-noir rounded bg-transparent text-text-secondary leading-none">
          <span>Priority Action Briefing</span>
        </div>
      </div>

      {/* ── 1. The Core Finding (The "What Happened") ── */}
      <div className="space-y-4">
        {/* Highlighted Core Finding in Bold Editorial Text */}
        <div className="font-body text-xl sm:text-2xl text-text-primary leading-snug">
          Enterprise Gross Margin compressed{" "}
          <span className="font-body font-bold tabular-nums text-inherit tracking-normal text-accent-rust">
            -311 bps YoY (42.97% → 39.86%)
          </span>
          . Isolated to South Region COGS expanding{" "}
          <span className="font-body font-bold tabular-nums text-inherit tracking-normal text-accent-rust">
            +6.06%
          </span>{" "}
          despite a{" "}
          <span className="font-body font-bold tabular-nums text-inherit tracking-normal text-text-primary">
            -12.50%
          </span>{" "}
          top-line contraction.
        </div>

        {/* Narrative findings */}
        <div className="flex flex-col gap-1 text-xs text-text-secondary font-body">
          {diagnostic.summary_findings.slice(0, 2).map((finding, idx) => (
            <div key={idx} className="flex items-start gap-2">
              <span className="text-text-secondary font-body font-bold leading-none mt-0.5">•</span>
              <span className="leading-relaxed tabular-nums">{finding}</span>
            </div>
          ))}
        </div>

        {/* Diagnostic Anomaly Metric Box */}
        {anomaly && (
          <div className="relative overflow-hidden rounded border border-noir bg-bg-surface-subtle border-l-4 border-l-accent-rust p-4 text-xs transition-colors duration-200">
            {/* Cold War Acoustic Waveform & Crosshair Watermark */}
            <div
              className="pointer-events-none select-none absolute right-2 bottom-1 w-48 h-20 opacity-[0.10] z-0"
              style={{ mixBlendMode: "var(--dither-blend)" as any }}
            >
              <svg viewBox="0 0 200 80" className="w-full h-full stroke-current fill-none" style={{ color: "var(--accent-rust)" }}>
                <circle cx="160" cy="40" r="30" strokeWidth="0.75" />
                <circle cx="160" cy="40" r="15" strokeWidth="0.5" strokeDasharray="2 2" />
                <line x1="120" y1="40" x2="195" y2="40" strokeWidth="0.5" />
                <line x1="160" y1="5" x2="160" y2="75" strokeWidth="0.5" />
                <path
                  d="M 10 40 Q 25 15, 35 40 T 55 40 T 70 10 T 85 70 T 100 25 T 115 50 T 130 40 L 160 40"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                />
              </svg>
            </div>

            <div className="relative z-10 flex items-center gap-1.5 font-body font-bold text-accent-rust uppercase text-[10px] tracking-wider mb-2">
              <AlertTriangle className="h-3.5 w-3.5 flex-shrink-0" />
              <span>Diagnostic Anomaly Flag: {anomaly.field || "COGS Anomaly"}</span>
            </div>

            <div className="relative z-10 grid grid-cols-1 sm:grid-cols-3 gap-6 items-start pt-2 border-t border-noir">
              <div>
                <span className="text-xs text-text-secondary uppercase font-body font-semibold italic tracking-wider block mb-1">
                  Volume-Expected
                </span>
                <span className="text-base font-semibold text-text-primary tabular-nums font-mono block">
                  ${Number(anomaly.expected).toLocaleString("en-US")}
                </span>
              </div>
              <div>
                <span className="text-xs text-text-secondary uppercase font-body font-semibold italic tracking-wider block mb-1">
                  Actual Billed
                </span>
                <span className="text-base font-semibold text-accent-rust tabular-nums font-mono block">
                  ${Number(anomaly.actual).toLocaleString("en-US")}
                </span>
              </div>
              <div>
                <span className="text-xs text-text-secondary uppercase font-body font-semibold italic tracking-wider block mb-1">
                  Discrepancy
                </span>
                <span className="text-base font-bold text-accent-rust tabular-nums font-mono block">
                  +{anomaly.delta_pct}%
                </span>
                <span className="text-xs text-text-muted mt-0.5 block font-body">
                  [{anomaly.cause || "Supplier customs escalation fee & unhedged spot logistics surge"}]
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── 2. The Actionable Solution & Sensitivity Levers (The "So What") ── */}
      {strategy ? (
        <div className="mt-7 pt-6 border-t border-noir space-y-5">
          {/* Action Header */}
          <div className="flex items-center gap-2 font-display text-xs uppercase tracking-widest font-bold text-text-secondary">
            <TrendingUp className="h-4 w-4 text-text-secondary" />
            <span>Remedial Directive &amp; Sensitivity Sandtable</span>
          </div>

          {/* 007 Noir Anchor Card */}
          <div className="relative rounded-md border border-noir bg-[#0a0908] p-5 text-[#f0eae0] shadow-sm bg-dither-dark corner-ticks-dark overflow-hidden">
            {/* Classic 007 Gun-Barrel Spiral Rifling Watermark */}
            <div
              className="pointer-events-none select-none absolute right-0 top-0 bottom-0 w-72 overflow-hidden opacity-[0.14] z-0"
              style={{ mixBlendMode: "var(--dither-blend)" as any }}
            >
              <svg viewBox="0 0 300 200" className="w-full h-full text-[#f0eae0] stroke-current fill-none">
                <circle cx="200" cy="100" r="30" strokeWidth="1" />
                <circle cx="200" cy="100" r="14" strokeWidth="1.5" strokeDasharray="3 2" />
                <circle cx="200" cy="100" r="4" fill="#f0eae0" stroke="none" />
                <path d="M 170 100 C 140 100, 80 50, 40 20" strokeWidth="1.2" />
                <path d="M 180 75 C 160 40, 110 10, 70 -20" strokeWidth="1.2" />
                <path d="M 200 70 C 210 30, 220 0, 240 -30" strokeWidth="1.2" />
                <path d="M 220 75 C 245 45, 280 20, 320 0" strokeWidth="1.2" />
                <path d="M 230 100 C 260 105, 310 120, 360 140" strokeWidth="1.2" />
                <path d="M 220 125 C 240 155, 270 190, 300 230" strokeWidth="1.2" />
                <path d="M 200 130 C 190 165, 170 200, 150 240" strokeWidth="1.2" />
                <path d="M 180 125 C 150 150, 100 180, 50 210" strokeWidth="1.2" />
                <circle cx="200" cy="100" r="70" strokeWidth="0.5" strokeDasharray="4 4" />
                <circle cx="200" cy="100" r="115" strokeWidth="0.5" strokeDasharray="6 6" />
              </svg>
            </div>

            <div className="relative z-[2] flex flex-col gap-2.5">
              <div className="font-body text-[10px] font-bold uppercase tracking-widest italic text-[#f0eae0]/60">
                Agent 007 Strategic Directive
              </div>
              <h3 className="font-display uppercase tracking-tight text-lg sm:text-xl font-bold leading-snug text-[#f0eae0]">
                {strategy.headline_recommendation}
              </h3>
              <div className="inline-flex items-center gap-2 rounded-full border border-[#f0eae0]/40 bg-[#f0eae0]/10 px-3 py-1 font-body text-xs font-bold text-[#f0eae0] w-fit tabular-nums">
                <TrendingUp className="h-3.5 w-3.5" />
                <span>Impact: {strategy.estimated_impact}</span>
              </div>
            </div>
          </div>

          {/* Actionable Solution Roadmap */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {strategy.strategic_actions.map((action, idx) => (
              <div
                key={idx}
                className="flex items-start gap-2.5 rounded border border-noir bg-bg-surface-subtle p-3 text-xs text-text-secondary font-body"
              >
                <CheckCircle2 className="h-4 w-4 shrink-0 text-text-secondary mt-0.5" />
                <span className="leading-relaxed">{action}</span>
              </div>
            ))}
          </div>

          {/* Interactive Sensitivity Sandtable Slider */}
          <div className="rounded-md border border-noir bg-bg-surface-subtle p-5">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-4 border-b border-noir pb-3">
              <div className="flex items-center gap-2.5">
                <Sliders className="h-4 w-4 text-text-secondary" />
                <span className="font-display text-sm font-bold uppercase tracking-tight text-text-primary">
                  What-If Sensitivity Simulation
                </span>
                <span className="text-text-secondary/40 mx-1 text-xs">|</span>
                <span className="text-xs uppercase tracking-wider font-body font-medium italic text-text-secondary">
                  South Region COGS Lever
                </span>
              </div>

              {/* Single-line pro-forma badge with h-8 height */}
              <div className="h-8 px-3.5 whitespace-nowrap inline-flex items-center gap-2 rounded border border-noir bg-bg-surface font-mono tabular-nums text-xs font-semibold text-text-primary leading-none">
                <span>
                  Recovered GM: {marginRecoveryPct >= 0 ? `+${marginRecoveryPct.toFixed(2)}%` : `${marginRecoveryPct.toFixed(2)}%`} ({marginRecoveryBps >= 0 ? `+${marginRecoveryBps}` : marginRecoveryBps} bps)
                </span>
                <span className="text-text-secondary">•</span>
                <span className="text-text-muted">
                  ${Math.abs(cogsSavingsMonthly).toLocaleString()}/mo {cogsSavingsMonthly >= 0 ? "cash conservation" : "cash burden"}
                </span>
              </div>
            </div>

            {/* Slider control */}
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-4 text-xs font-body">
                <span className="font-bold text-text-primary">
                  Renegotiated Freight &amp; Demurrage Floor:
                </span>
                <div className="font-mono tabular-nums text-sm font-bold text-text-primary bg-bg-surface h-8 px-3 flex items-center rounded border border-noir">
                  {cogsAdjustment > 0 ? `+${cogsAdjustment}%` : `${cogsAdjustment}%`}
                </div>
              </div>

              <div className="flex items-center gap-4">
                <span className="font-mono tabular-nums text-[11px] text-text-muted w-10 text-left">-20%</span>
                <input
                  type="range"
                  min={-20}
                  max={10}
                  step={1}
                  value={cogsAdjustment}
                  onChange={(e) => setCogsAdjustment(Number(e.target.value))}
                  className="w-full"
                  aria-label="South Region COGS Adjustment"
                />
                <span className="font-mono tabular-nums text-[11px] text-text-muted w-10 text-right">+10%</span>
              </div>

              {/* Preset buttons */}
              <div className="flex items-center gap-2 pt-1">
                <span className="font-body text-[10px] font-bold uppercase tracking-wider text-text-secondary">
                  Simulation Presets:
                </span>
                {[-18, -12, -6, 0].map((preset) => (
                  <button
                    key={preset}
                    onClick={() => setCogsAdjustment(preset)}
                    className={`h-7 px-2.5 rounded border font-mono tabular-nums text-[10px] transition-colors cursor-pointer ${
                      cogsAdjustment === preset
                        ? "border-text-secondary bg-text-secondary text-bg-canvas font-bold"
                        : "border-noir bg-bg-surface text-text-secondary hover:border-text-primary hover:text-text-primary"
                    }`}
                  >
                    {preset > 0 ? `+${preset}%` : `${preset}%`}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-6 pt-5 border-t border-noir flex items-center gap-2.5 text-xs font-body italic text-text-secondary">
          <Loader2 className="h-3.5 w-3.5 animate-spin text-text-secondary" />
          <span>Agent 007 formulating actionable strategic remediation &amp; sensitivity levers...</span>
        </div>
      )}
    </section>
  );
};
