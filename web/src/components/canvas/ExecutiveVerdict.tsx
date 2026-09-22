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
    <section className="rounded-lg border border-[#6b4d3a]/30 bg-[#f4f0e8] p-6 sm:p-7 shadow-none transition-all relative overflow-hidden">
      {/* ── Tier 1 Header ── */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#6b4d3a]/20 mb-6">
        <div className="flex items-center gap-3">
          <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded border border-[#8c432a]/40 bg-[#8c432a]/10 text-[#8c432a]">
            <ShieldAlert className="h-3.5 w-3.5" />
          </div>
          <span className="font-serif text-lg font-bold text-[#1a1613] leading-none tracking-tight">
            Tier 1: Executive Verdict &amp; Strategic Levers
          </span>
          <span className="text-[#6b4d3a]/30 mx-2 text-xs">|</span>
          <span className="text-xs uppercase tracking-wider font-sans font-medium text-[#6b4d3a]">
            Agent Q &amp; Agent 007 • Root Cause &amp; Remediation
          </span>
        </div>

        <div className="h-8 px-3.5 whitespace-nowrap text-xs font-sans uppercase tracking-wider inline-flex items-center gap-2 border border-[#6b4d3a]/30 rounded bg-transparent text-[#6b4d3a] font-semibold leading-none">
          <span>Priority Action Briefing</span>
        </div>
      </div>

      {/* ── 1. The Core Finding (The "What Happened") ── */}
      <div className="space-y-4">
        {/* Highlighted Core Finding in Bold Serif Display Text */}
        <div className="font-serif font-bold text-xl sm:text-2xl text-[#1a1613] [font-variant-numeric:lining-nums_tabular-nums] [font-feature-settings:'lnum'_1,'tnum'_1] leading-snug">
          Enterprise Gross Margin compressed{" "}
          <span className="font-sans font-bold tabular-nums text-inherit tracking-normal text-[#8c432a]">
            -311 bps YoY (42.97% → 39.86%)
          </span>
          . Isolated to South Region COGS expanding{" "}
          <span className="font-sans font-bold tabular-nums text-inherit tracking-normal text-[#8c432a]">
            +6.06%
          </span>{" "}
          despite a{" "}
          <span className="font-sans font-bold tabular-nums text-inherit tracking-normal text-[#1a1613]">
            -12.50%
          </span>{" "}
          top-line contraction.
        </div>

        {/* Narrative findings */}
        <div className="flex flex-col gap-1 text-xs text-swan-charcoal">
          {diagnostic.summary_findings.slice(0, 2).map((finding, idx) => (
            <div key={idx} className="flex items-start gap-2">
              <span className="text-[#6b4d3a] font-serif font-bold leading-none mt-0.5">•</span>
              <span className="leading-relaxed tabular-nums">{finding}</span>
            </div>
          ))}
        </div>

        {/* Diagnostic Anomaly Metric Box */}
        {anomaly && (
          <div className="relative overflow-hidden rounded border border-swan-rust/40 bg-[#f0eae0] border-l-4 border-l-[#8c432a] p-4 text-xs">
            {/* Cold War Acoustic Waveform & Crosshair Watermark */}
            <div className="pointer-events-none select-none absolute right-2 bottom-1 w-48 h-20 opacity-[0.10] mix-blend-multiply z-0">
              <svg viewBox="0 0 200 80" className="w-full h-full text-[#8c432a] stroke-current fill-none">
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

            <div className="relative z-10 flex items-center gap-1.5 font-sans font-semibold text-swan-rust uppercase text-[10px] tracking-wider mb-2">
              <AlertTriangle className="h-3.5 w-3.5 flex-shrink-0" />
              <span>Diagnostic Anomaly Flag: {anomaly.field || "COGS Anomaly"}</span>
            </div>

            <div className="relative z-10 grid grid-cols-1 sm:grid-cols-3 gap-6 items-start pt-2 border-t border-[#6b4d3a]/20">
              <div>
                <span className="text-xs text-[#6b4d3a] uppercase font-sans font-semibold tracking-wider block mb-1">
                  Volume-Expected
                </span>
                <span className="text-base font-semibold text-[#1a1613] tabular-nums font-mono block">
                  ${Number(anomaly.expected).toLocaleString("en-US")}
                </span>
              </div>
              <div>
                <span className="text-xs text-[#6b4d3a] uppercase font-sans font-semibold tracking-wider block mb-1">
                  Actual Billed
                </span>
                <span className="text-base font-semibold text-[#8c432a] tabular-nums font-mono block">
                  ${Number(anomaly.actual).toLocaleString("en-US")}
                </span>
              </div>
              <div>
                <span className="text-xs text-[#6b4d3a] uppercase font-sans font-semibold tracking-wider block mb-1">
                  Discrepancy
                </span>
                <span className="text-base font-semibold text-[#8c432a] tabular-nums font-mono block">
                  +{anomaly.delta_pct}%
                </span>
                <span className="text-xs text-[#6b4d3a] mt-0.5 block">
                  [{anomaly.cause || "Supplier customs escalation fee & unhedged spot logistics surge"}]
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── 2. The Actionable Solution & Sensitivity Levers (The "So What") ── */}
      {strategy ? (
        <div className="mt-7 pt-6 border-t border-[#6b4d3a]/25 space-y-5">
          {/* Action Header */}
          <div className="flex items-center gap-2 font-sans text-xs uppercase tracking-widest font-semibold text-[#6b4d3a]">
            <TrendingUp className="h-4 w-4 text-[#6b4d3a]" />
            <span>Remedial Directive &amp; Sensitivity Sandtable</span>
          </div>

          {/* 007 Noir Anchor Card */}
          <div className="relative rounded-md border border-swan-black bg-swan-black p-5 text-parchment shadow-sm bg-dither-dark corner-ticks-dark overflow-hidden">
            {/* Classic 007 Gun-Barrel Spiral Rifling Watermark */}
            <div className="pointer-events-none select-none absolute right-0 top-0 bottom-0 w-72 overflow-hidden opacity-[0.14] mix-blend-screen z-0">
              <svg viewBox="0 0 300 200" className="w-full h-full text-parchment stroke-current fill-none">
                <circle cx="200" cy="100" r="30" strokeWidth="1" />
                <circle cx="200" cy="100" r="14" strokeWidth="1.5" strokeDasharray="3 2" />
                <circle cx="200" cy="100" r="4" fill="#f4f0e8" stroke="none" />
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
              <div className="font-sans text-[10px] font-bold uppercase tracking-widest text-parchment/60">
                Agent 007 Strategic Directive
              </div>
              <h3 className="font-serif text-lg sm:text-xl font-bold leading-snug text-parchment">
                {strategy.headline_recommendation}
              </h3>
              <div className="inline-flex items-center gap-2 rounded-full border border-parchment/40 bg-parchment/10 px-3 py-1 font-sans text-xs font-medium text-parchment w-fit tabular-nums">
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
                className="flex items-start gap-2.5 rounded border border-[#6b4d3a]/30 bg-parchment-light/70 p-3 text-xs text-swan-charcoal"
              >
                <CheckCircle2 className="h-4 w-4 shrink-0 text-[#6b4d3a] mt-0.5" />
                <span className="leading-relaxed">{action}</span>
              </div>
            ))}
          </div>

          {/* Interactive Sensitivity Sandtable Slider */}
          <div className="rounded-md border border-[#6b4d3a]/30 bg-parchment-light/80 p-5">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-4 border-b border-[#6b4d3a]/20 pb-3">
              <div className="flex items-center gap-2.5">
                <Sliders className="h-4 w-4 text-[#4a4540]" />
                <span className="font-serif text-sm font-bold text-[#1a1613]">
                  What-If Sensitivity Simulation
                </span>
                <span className="text-[#6b4d3a]/30 mx-1 text-xs">|</span>
                <span className="text-xs uppercase tracking-wider font-sans font-medium text-[#6b4d3a]">
                  South Region COGS Lever
                </span>
              </div>

              {/* Single-line pro-forma badge with h-8 height */}
              <div className="h-8 px-3.5 whitespace-nowrap inline-flex items-center gap-2 rounded border border-[#6b4d3a]/40 bg-[#f4f0e8] font-mono tabular-nums text-xs font-semibold text-[#1a1613] leading-none">
                <span>
                  Recovered GM: {marginRecoveryPct >= 0 ? `+${marginRecoveryPct.toFixed(2)}%` : `${marginRecoveryPct.toFixed(2)}%`} ({marginRecoveryBps >= 0 ? `+${marginRecoveryBps}` : marginRecoveryBps} bps)
                </span>
                <span className="text-[#6b4d3a]">•</span>
                <span className="text-[#4a4540]">
                  ${Math.abs(cogsSavingsMonthly).toLocaleString()}/mo {cogsSavingsMonthly >= 0 ? "cash conservation" : "cash burden"}
                </span>
              </div>
            </div>

            {/* Slider control */}
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-4 text-xs font-sans">
                <span className="font-semibold text-[#1a1613]">
                  Renegotiated Freight &amp; Demurrage Floor:
                </span>
                <div className="font-mono tabular-nums text-sm font-bold text-[#1a1613] bg-[#f4f0e8] h-8 px-3 flex items-center rounded border border-[#6b4d3a]/40">
                  {cogsAdjustment > 0 ? `+${cogsAdjustment}%` : `${cogsAdjustment}%`}
                </div>
              </div>

              <div className="flex items-center gap-4">
                <span className="font-mono tabular-nums text-[11px] text-[#4a4540] w-10 text-left">-20%</span>
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
                <span className="font-mono tabular-nums text-[11px] text-[#4a4540] w-10 text-right">+10%</span>
              </div>

              {/* Preset buttons */}
              <div className="flex items-center gap-2 pt-1">
                <span className="font-sans text-[10px] uppercase tracking-wider text-[#6b4d3a]">
                  Simulation Presets:
                </span>
                {[-18, -12, -6, 0].map((preset) => (
                  <button
                    key={preset}
                    onClick={() => setCogsAdjustment(preset)}
                    className={`h-7 px-2.5 rounded border font-mono tabular-nums text-[10px] transition-colors cursor-pointer ${
                      cogsAdjustment === preset
                        ? "border-[#6b4d3a] bg-[#6b4d3a] text-parchment font-bold"
                        : "border-[#6b4d3a]/40 bg-[#f4f0e8] text-[#6b4d3a] hover:border-[#6b4d3a] hover:text-[#1a1613]"
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
        <div className="mt-6 pt-5 border-t border-[#6b4d3a]/20 flex items-center gap-2.5 text-xs font-sans text-swan-sepia">
          <Loader2 className="h-3.5 w-3.5 animate-spin text-[#6b4d3a]" />
          <span>Agent 007 formulating actionable strategic remediation &amp; sensitivity levers...</span>
        </div>
      )}
    </section>
  );
};
