"use client";

import React from "react";
import { AlertTriangle, TrendingDown } from "lucide-react";
import { Q_Diagnostic } from "@/types/contracts";

interface RootCauseCalloutProps {
  diagnostic: Q_Diagnostic;
}

export const RootCauseCallout: React.FC<RootCauseCalloutProps> = ({ diagnostic }) => {
  const anomaly = diagnostic.anomalies_detected?.[0];

  return (
    <section className="rounded-md border border-noir bg-bg-surface p-6 mb-6 shadow-none transition-all">
      {/* Card Header — Standardized */}
      <div className="flex items-center justify-between gap-4 pb-3 border-b border-noir mb-5">
        <div className="flex items-center gap-3">
          <div className="flex h-5 w-5 flex-shrink-0 items-center justify-center text-text-secondary">
            <TrendingDown className="h-4 w-4" />
          </div>
          <span className="font-display text-base font-bold uppercase tracking-tight text-text-primary leading-none">
            Stage 2: Mathematical Root-Cause Isolation
          </span>
          <span className="text-text-secondary/40 mx-2 text-xs">|</span>
          <span className="text-xs uppercase tracking-wider font-body font-medium italic text-text-secondary">
            AGENT Q • ROOT-CAUSE DIAGNOSTIC
          </span>
        </div>
      </div>

      {/* Primary Mathematical Finding Callout — lining figures & font-body wrapped numbers */}
      <div className="font-body text-xl text-text-primary leading-snug">
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

      {/* Summary Bullet Points */}
      <div className="mt-4 flex flex-col gap-1.5 border-t border-noir pt-3 text-xs text-text-muted">
        {diagnostic.summary_findings.map((finding, idx) => (
          <div key={idx} className="flex items-start gap-2">
            <span className="text-text-secondary font-body font-bold leading-none mt-0.5">•</span>
            <span className="leading-relaxed tabular-nums font-body">{finding}</span>
          </div>
        ))}
      </div>

      {/* Detected Anomaly Box — Strict Two-Tier 3-Column Layout with Acoustic Waveform Watermark */}
      {anomaly && (
        <div className="relative overflow-hidden mt-4 rounded border border-accent-rust/40 bg-bg-surface-subtle border-l-4 border-l-accent-rust p-4 text-xs">
          {/* Cold War Acoustic Waveform & Crosshair Watermark */}
          <div
            className="pointer-events-none select-none absolute right-2 bottom-1 w-48 h-20 opacity-[0.10] z-0"
            style={{ mixBlendMode: "var(--dither-blend)" as any }}
          >
            <svg viewBox="0 0 200 80" className="w-full h-full text-accent-rust stroke-current fill-none">
              {/* Crosshair target */}
              <circle cx="160" cy="40" r="30" strokeWidth="0.75" />
              <circle cx="160" cy="40" r="15" strokeWidth="0.5" strokeDasharray="2 2" />
              <line x1="120" y1="40" x2="195" y2="40" strokeWidth="0.5" />
              <line x1="160" y1="5" x2="160" y2="75" strokeWidth="0.5" />
              {/* Acoustic waveform oscilloscope lines */}
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
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-start pt-3 border-t border-noir">
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
              <span className="text-base font-bold text-accent-rust tabular-nums font-mono block">
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
              <span className="text-xs text-text-secondary font-body italic mt-0.5 block">
                [{anomaly.cause || "Supplier customs escalation fee & unhedged spot logistics surge"}]
              </span>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
