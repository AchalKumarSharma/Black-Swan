"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Sliders,
  RotateCcw,
  Check,
} from "lucide-react";

export interface ScenarioLever {
  id: string;
  label: string;
  impactBps: number; // e.g. +250 bps margin recovery
  costSavings: number; // e.g. 92000
  description: string;
  enabledByDefault?: boolean;
}

export interface ScenarioSimulatorProps {
  baselineRevenue: number;
  baselineCosts: number;
  currencySymbol: string;
  levers?: ScenarioLever[];
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

export function formatSignedCurrency(val: number, symbol: string): string {
  const formatted = formatCurrencyHuman(Math.abs(val), symbol);
  if (val > 0) return `+${formatted}`;
  if (val < 0) return `-${formatted}`;
  return formatted;
}

export const DEFAULT_LEVERS: ScenarioLever[] = [
  {
    id: "lever_carrier_consolidation",
    label: "Carrier Contract Consolidation",
    impactBps: 140,
    costSavings: 52000,
    description: "Renegotiate regional logistics contracts and consolidate freight routes to curtail carrier cost leakage.",
    enabledByDefault: true,
  },
  {
    id: "lever_opex_freeze",
    label: "Discretionary OPEX Freeze",
    impactBps: 110,
    costSavings: 40000,
    description: "Institute a temporary moratorium on non-essential operational and travel expenditures across departments.",
    enabledByDefault: false,
  },
  {
    id: "lever_sku_rationalization",
    label: "Underperforming SKU Rationalization",
    impactBps: 80,
    costSavings: 35000,
    description: "Prune bottom 5% negative-margin SKUs to lift overall product mix realization.",
    enabledByDefault: false,
  },
];

export class ScenarioSimulatorErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error: any) {
    console.error("ScenarioSimulator error boundary caught error:", error);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="rounded-lg border border-noir bg-bg-surface-subtle p-4 text-xs font-mono text-text-muted">
          Simulation model temporarily unavailable.
        </div>
      );
    }
    return this.props.children;
  }
}

export const ScenarioSimulator: React.FC<ScenarioSimulatorProps> = ({
  baselineRevenue = 0,
  baselineCosts = 0,
  currencySymbol = "₹",
  levers,
}) => {
  // If baseline is completely absent and no levers are passed, render an elegant loading skeleton
  if (baselineRevenue <= 0 && baselineCosts <= 0 && (!levers || levers.length === 0)) {
    return (
      <div className="rounded-lg border border-noir/60 bg-bg-surface-subtle/40 p-5 space-y-3.5 animate-pulse">
        <div className="flex items-center justify-between">
          <div className="h-4 w-48 bg-noir/50 rounded" />
          <div className="h-4 w-24 bg-noir/50 rounded" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="h-24 bg-noir/30 rounded border border-noir/30" />
          <div className="h-24 bg-noir/30 rounded border border-noir/30" />
          <div className="h-24 bg-noir/30 rounded border border-noir/30" />
        </div>
        <div className="h-10 bg-noir/30 rounded border border-noir/30" />
      </div>
    );
  }

  const activeLeversList = useMemo(() => {
    return levers && levers.length > 0 ? levers : DEFAULT_LEVERS;
  }, [levers]);

  // Manage active set of enabled lever IDs using local React state
  const [enabledLevers, setEnabledLevers] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    activeLeversList.forEach((lever, idx) => {
      initial[lever.id] = lever.enabledByDefault !== undefined ? Boolean(lever.enabledByDefault) : idx === 0;
    });
    return initial;
  });

  // Re-sync if levers array changes identity/content
  useEffect(() => {
    const initial: Record<string, boolean> = {};
    activeLeversList.forEach((lever, idx) => {
      initial[lever.id] = lever.enabledByDefault !== undefined ? Boolean(lever.enabledByDefault) : idx === 0;
    });
    setEnabledLevers(initial);
  }, [activeLeversList]);

  const toggleLever = (id: string) => {
    setEnabledLevers((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleResetToBaseline = () => {
    const reset: Record<string, boolean> = {};
    activeLeversList.forEach((lever) => {
      reset[lever.id] = false;
    });
    setEnabledLevers(reset);
  };

  // Dynamic Pro-Forma Metrics Calculations:
  // 1. Active Cost Savings = sum of costSavings for all checked levers
  const activeCostSavings = useMemo(() => {
    return activeLeversList.reduce((sum, lever) => {
      return enabledLevers[lever.id] ? sum + (Number(lever.costSavings) || 0) : sum;
    }, 0);
  }, [activeLeversList, enabledLevers]);

  // 2. Active Margin Delta = sum of impactBps for all checked levers
  const activeMarginDelta = useMemo(() => {
    return activeLeversList.reduce((sum, lever) => {
      return enabledLevers[lever.id] ? sum + (Number(lever.impactBps) || 0) : sum;
    }, 0);
  }, [activeLeversList, enabledLevers]);

  // 3. Pro-Forma Total Costs = baselineCosts - activeCostSavings
  const proFormaCosts = Math.max(0, baselineCosts - activeCostSavings);

  // 4. Pro-Forma Net Result & Margin
  const baselineNetResult = baselineRevenue - baselineCosts;
  const proFormaNetResult = baselineRevenue - proFormaCosts;

  const baselineNetMarginPct = baselineRevenue > 0
    ? (baselineNetResult / baselineRevenue) * 100
    : 0;

  const proFormaNetMarginPct = baselineRevenue > 0
    ? (proFormaNetResult / baselineRevenue) * 100
    : 0;

  const marginDeltaPct = proFormaNetMarginPct - baselineNetMarginPct;
  const activeLeversCount = Object.values(enabledLevers).filter(Boolean).length;

  return (
    <div className="rounded-lg border border-noir/60 bg-bg-surface-subtle/60 p-4 sm:p-5 space-y-4 shadow-none">
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-noir/40 pb-3">
        <div className="flex items-center gap-2">
          <Sliders className="h-4 w-4 text-emerald-400" />
          <span className="font-mono text-xs font-bold uppercase tracking-wider text-text-primary">
            SIMULATION // PRO-FORMA SENSITIVITY ENGINE
          </span>
          <span className="font-mono text-[10px] text-text-muted bg-bg-surface px-2 py-0.5 rounded border border-noir">
            {activeLeversCount} Active {activeLeversCount === 1 ? "Lever" : "Levers"}
          </span>
        </div>

        <button
          type="button"
          onClick={handleResetToBaseline}
          className="inline-flex items-center gap-1.5 rounded border border-noir bg-bg-surface px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-wider text-text-secondary hover:text-text-primary hover:border-text-primary transition-colors cursor-pointer"
        >
          <RotateCcw className="h-3 w-3 text-text-muted" />
          RESET TO BASELINE
        </button>
      </div>

      {/* Interactive Lever List (Minimalist Check-Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {activeLeversList.map((lever) => {
          const isActive = Boolean(enabledLevers[lever.id]);
          return (
            <div
              key={lever.id}
              onClick={() => toggleLever(lever.id)}
              className={`rounded border p-3.5 space-y-2 text-xs cursor-pointer select-none transition-all duration-150 ${
                isActive
                  ? "border-emerald-700/60 bg-emerald-950/25 shadow-sm"
                  : "border-noir bg-bg-surface hover:border-noir/80 hover:bg-bg-surface-subtle/50 opacity-75"
              }`}
            >
              {/* Card top row: Checkbox + Metric Badges */}
              <div className="flex items-center justify-between gap-1 font-mono text-[10px]">
                <div className="flex items-center gap-2">
                  <div
                    className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors ${
                      isActive
                        ? "border-emerald-500 bg-emerald-500 text-swan-black"
                        : "border-text-muted/60 bg-transparent text-transparent"
                    }`}
                  >
                    <Check className="h-3 w-3 stroke-[3]" />
                  </div>
                  <span
                    className={`font-bold tabular-nums ${
                      isActive ? "text-emerald-400" : "text-text-muted"
                    }`}
                  >
                    +{lever.impactBps} bps recovery
                  </span>
                </div>

                <span
                  className={`tabular-nums font-semibold px-1.5 py-0.2 rounded border ${
                    isActive
                      ? "text-emerald-300 bg-emerald-950/60 border-emerald-800/40"
                      : "text-text-muted bg-bg-canvas border-noir"
                  }`}
                >
                  -{formatCurrencyHuman(lever.costSavings, currencySymbol)}
                </span>
              </div>

              {/* Title */}
              <h5
                className={`font-display font-bold uppercase tracking-tight text-[11px] leading-snug ${
                  isActive ? "text-text-primary" : "text-text-secondary"
                }`}
              >
                {lever.label}
              </h5>

              {/* Description */}
              <p className="font-body text-[11px] text-text-secondary leading-relaxed line-clamp-2">
                {lever.description}
              </p>
            </div>
          );
        })}
      </div>

      {/* Real-Time Impact Summary Pill (Obsidian Vault Emerald styling) */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-lg border border-emerald-800/40 bg-emerald-950/30">
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="relative flex h-2 w-2">
            <span
              className={`absolute inline-flex h-full w-full rounded-full bg-emerald-400 ${
                activeLeversCount > 0 ? "animate-ping opacity-75" : "opacity-0"
              }`}
            />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
          </span>

          <span className="font-mono text-xs sm:text-sm font-bold text-emerald-300 tabular-nums">
            PRO-FORMA NET RESULT: {formatSignedCurrency(proFormaNetResult, currencySymbol)}
          </span>

          <span className="font-mono text-[11px] font-bold text-emerald-400 bg-emerald-900/50 border border-emerald-700/50 px-2.5 py-0.5 rounded tabular-nums">
            [ +{activeMarginDelta} bps recovery ]
          </span>
        </div>

        {/* Dynamic Secondary Metrics: Pro-Forma Costs & Net Margin % */}
        <div className="flex flex-wrap items-center gap-4 text-xs font-mono">
          <div className="text-text-muted">
            Pro-Forma Costs:{" "}
            <span className="font-bold text-text-primary tabular-nums">
              {formatCurrencyHuman(proFormaCosts, currencySymbol)}
            </span>
            {activeCostSavings > 0 && (
              <span className="ml-1 text-[10px] text-emerald-400 tabular-nums">
                (-{formatCurrencyHuman(activeCostSavings, currencySymbol)})
              </span>
            )}
          </div>

          <div className="text-text-muted">
            Net Margin:{" "}
            <span className="font-bold text-emerald-400 tabular-nums">
              {proFormaNetMarginPct.toFixed(2)}%
            </span>
            {marginDeltaPct > 0 && (
              <span className="ml-1 text-[10px] text-emerald-300 tabular-nums">
                (+{marginDeltaPct.toFixed(2)}%)
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScenarioSimulator;
