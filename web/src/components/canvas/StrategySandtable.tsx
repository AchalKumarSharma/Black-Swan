"use client";

import React, { useState } from "react";
import { ShieldAlert, Sliders, CheckCircle2, TrendingUp } from "lucide-react";
import { Agent007_Strategy } from "@/types/contracts";

interface StrategySandtableProps {
  strategy: Agent007_Strategy;
}

export const StrategySandtable: React.FC<StrategySandtableProps> = ({
  strategy,
}) => {
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
    <section className="space-y-4 mb-6">
      {/* 1. Anchor Card: Deep Obsidian Vault with tactical dither & 007 Gun-Barrel Rifling */}
      <div className="relative rounded-md border border-noir bg-[#0a0908] p-6 text-[#f0eae0] shadow-md bg-dither-dark corner-ticks-dark overflow-hidden">
        {/* Classic 007 Gun-Barrel Spiral Rifling & Tactical Grid Watermark */}
        <div className="pointer-events-none select-none absolute right-0 top-0 bottom-0 w-80 overflow-hidden opacity-[0.15] mix-blend-screen z-0">
          <svg viewBox="0 0 300 200" className="w-full h-full text-[#f0eae0] stroke-current fill-none">
            {/* Center aperture */}
            <circle cx="200" cy="100" r="30" strokeWidth="1" />
            <circle cx="200" cy="100" r="14" strokeWidth="1.5" strokeDasharray="3 2" />
            <circle cx="200" cy="100" r="4" fill="#f0eae0" stroke="none" />
            {/* Rifling spiral grooves radiating outward from barrel aperture */}
            <path d="M 170 100 C 140 100, 80 50, 40 20" strokeWidth="1.2" />
            <path d="M 180 75 C 160 40, 110 10, 70 -20" strokeWidth="1.2" />
            <path d="M 200 70 C 210 30, 220 0, 240 -30" strokeWidth="1.2" />
            <path d="M 220 75 C 245 45, 280 20, 320 0" strokeWidth="1.2" />
            <path d="M 230 100 C 260 105, 310 120, 360 140" strokeWidth="1.2" />
            <path d="M 220 125 C 240 155, 270 190, 300 230" strokeWidth="1.2" />
            <path d="M 200 130 C 190 165, 170 200, 150 240" strokeWidth="1.2" />
            <path d="M 180 125 C 150 150, 100 180, 50 210" strokeWidth="1.2" />
            {/* Tactical concentric range rings */}
            <circle cx="200" cy="100" r="70" strokeWidth="0.5" strokeDasharray="4 4" />
            <circle cx="200" cy="100" r="115" strokeWidth="0.5" strokeDasharray="6 6" />
          </svg>
        </div>

        <div className="relative z-[2] flex flex-col gap-3">
          {/* Header — standardized structure */}
          <div className="flex items-center justify-between gap-4 pb-3 border-b border-[#f0eae0]/15 mb-1">
            <div className="flex items-center gap-3">
              <div className="flex h-5 w-5 flex-shrink-0 items-center justify-center text-[#b89b82]">
                <ShieldAlert className="h-4 w-4" />
              </div>
              <span className="font-display text-base font-bold uppercase tracking-tight text-[#f0eae0] leading-none">
                Stage 5: Remedial Strategy &amp; Executive Action
              </span>
              <span className="text-[#b89b82]/40 mx-2 text-xs">|</span>
              <span className="text-xs uppercase tracking-wider font-body font-medium italic text-[#b89b82]">
                AGENT 007 • STRATEGIC RECOMMENDATION
              </span>
            </div>

            <div className="h-7 px-2.5 inline-flex items-center gap-1.5 rounded-full border border-[#f0eae0]/30 bg-[#f0eae0]/10 font-body text-xs font-bold uppercase tracking-wider text-[#f0eae0]">
              <span>Pro-Forma Levers</span>
            </div>
          </div>

          {/* Headline Recommendation */}
          <h2 className="font-display text-xl font-bold uppercase tracking-tight leading-relaxed text-[#f0eae0] sm:text-2xl">
            {strategy.headline_recommendation}
          </h2>

          {/* Estimated Impact Pill */}
          <div className="mt-1 inline-flex items-center gap-2 rounded-full border border-[#f0eae0]/40 bg-[#f0eae0]/10 px-3 py-1 font-body text-xs font-bold text-[#f0eae0] w-fit tabular-nums">
            <TrendingUp className="h-3.5 w-3.5" />
            <span>Impact: {strategy.estimated_impact}</span>
          </div>
        </div>
      </div>

      {/* 2. Actionable Bullet Points Card — standardized wrapper */}
      <div className="rounded-md border border-noir bg-bg-surface p-6 shadow-none">
        <h3 className="font-display text-xs font-bold uppercase tracking-wider text-text-primary mb-3">
          Tactical Remediation Roadmap
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {strategy.strategic_actions.map((action, idx) => (
            <div
              key={idx}
              className="flex items-start gap-2.5 rounded border border-noir bg-bg-surface-subtle p-3 text-xs text-text-muted font-body"
            >
              <CheckCircle2 className="h-4 w-4 shrink-0 text-text-secondary mt-0.5" />
              <span className="leading-relaxed">{action}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Interactive "What-If" Sensitivity Sandtable — horizontal grid alignment */}
      <div className="rounded-md border border-noir bg-bg-surface-subtle p-6 shadow-none">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-4 border-b border-noir pb-3">
          <div className="flex items-center gap-3">
            <div className="flex h-5 w-5 flex-shrink-0 items-center justify-center text-text-secondary">
              <Sliders className="h-4 w-4" />
            </div>
            <span className="font-display text-base font-bold uppercase tracking-tight text-text-primary leading-none">
              Dynamic Sensitivity Sandtable
            </span>
            <span className="text-text-secondary/40 mx-2 text-xs">|</span>
            <span className="text-xs uppercase tracking-wider font-body font-medium italic text-text-secondary">
              Pro-Forma Levers
            </span>
          </div>

          {/* Live Pro-Forma Calculation Badge — aligned on horizontal grid with h-7 height */}
          <div className="h-7 inline-flex items-center gap-1.5 rounded border border-noir bg-bg-surface px-2.5 font-mono tabular-nums text-xs font-semibold text-text-primary">
            <span>
              Recovered GM: {marginRecoveryPct >= 0 ? `+${marginRecoveryPct.toFixed(2)}%` : `${marginRecoveryPct.toFixed(2)}%`} ({marginRecoveryBps >= 0 ? `+${marginRecoveryBps}` : marginRecoveryBps} bps)
            </span>
            <span className="text-text-secondary">•</span>
            <span className="text-text-muted">
              ${Math.abs(cogsSavingsMonthly).toLocaleString()}/mo {cogsSavingsMonthly >= 0 ? "cash conservation" : "cash burden"}
            </span>
          </div>
        </div>

        {/* Sensitivity Slider Control — clean horizontal alignment */}
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-4 text-xs font-body">
            <div>
              <span className="font-bold text-text-primary">
                Lever 1: South Region COGS Adjustment
              </span>
              <p className="text-[11px] text-text-muted mt-0.5">
                Simulate impact of freight carrier tender renegotiation, volume floors, and spot rate caps.
              </p>
            </div>
            <div className="font-mono tabular-nums text-sm font-bold text-text-primary bg-bg-surface h-7 px-2.5 flex items-center rounded border border-noir">
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

          {/* Quick Preset Buttons */}
          <div className="flex items-center gap-2 pt-1">
            <span className="font-body text-[10px] font-bold uppercase tracking-wider text-text-secondary">
              Presets:
            </span>
            {[-18, -12, -6, 0].map((preset) => (
              <button
                key={preset}
                onClick={() => setCogsAdjustment(preset)}
                className={`rounded border px-2 py-0.5 font-mono tabular-nums text-[10px] transition-colors ${
                  cogsAdjustment === preset
                    ? "border-text-secondary bg-text-secondary text-bg-canvas font-bold"
                    : "border-noir bg-bg-surface text-text-secondary hover:border-text-secondary hover:text-text-primary"
                }`}
              >
                {preset > 0 ? `+${preset}%` : `${preset}%`}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
