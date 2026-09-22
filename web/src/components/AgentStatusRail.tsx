"use client";

import React from "react";
import {
  Check,
  AlertCircle,
  Clock,
  Terminal,
  Database,
  LineChart,
  ShieldAlert,
} from "lucide-react";

export type AgentNodeStatus = "pending" | "active" | "completed" | "failed";

export interface AgentStepState {
  code: "M" | "Q" | "Eve" | "007";
  name: string;
  roleDescription: string;
  status: AgentNodeStatus;
  timing?: string;
  subtext?: string;
}

interface AgentStatusRailProps {
  steps: AgentStepState[];
  isRunning: boolean;
  totalElapsedSeconds: number;
  estimatedRemainingSeconds: number;
}

/* ── Per-agent watermark insignia (inline SVG as CSS background) ── */
const agentInsignia: Record<string, string> = {
  // M — Radar / concentric rings
  M: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120' viewBox='0 0 120 120'%3E%3Ccircle cx='60' cy='60' r='50' fill='none' stroke='%236b4d3a' stroke-width='1'/%3E%3Ccircle cx='60' cy='60' r='35' fill='none' stroke='%236b4d3a' stroke-width='0.8'/%3E%3Ccircle cx='60' cy='60' r='20' fill='none' stroke='%236b4d3a' stroke-width='0.6'/%3E%3Cline x1='60' y1='10' x2='60' y2='110' stroke='%236b4d3a' stroke-width='0.5'/%3E%3Cline x1='10' y1='60' x2='110' y2='60' stroke='%236b4d3a' stroke-width='0.5'/%3E%3Cline x1='60' y1='60' x2='95' y2='25' stroke='%236b4d3a' stroke-width='1'/%3E%3C/svg%3E")`,
  // Q — Telemetry grid matrix
  Q: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120' viewBox='0 0 120 120'%3E%3Cdefs%3E%3Cpattern id='g' patternUnits='userSpaceOnUse' width='15' height='15'%3E%3Crect width='15' height='15' fill='none'/%3E%3Crect x='0' y='0' width='1' height='1' fill='%236b4d3a'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width='120' height='120' fill='url(%23g)'/%3E%3Crect x='20' y='20' width='80' height='80' rx='2' fill='none' stroke='%236b4d3a' stroke-width='1'/%3E%3Cline x1='20' y1='46' x2='100' y2='46' stroke='%236b4d3a' stroke-width='0.5'/%3E%3Cline x1='20' y1='73' x2='100' y2='73' stroke='%236b4d3a' stroke-width='0.5'/%3E%3Cline x1='46' y1='20' x2='46' y2='100' stroke='%236b4d3a' stroke-width='0.5'/%3E%3Cline x1='73' y1='20' x2='73' y2='100' stroke='%236b4d3a' stroke-width='0.5'/%3E%3C/svg%3E")`,
  // Eve — Cipher ledger / encoded lines
  Eve: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120' viewBox='0 0 120 120'%3E%3Cline x1='10' y1='20' x2='80' y2='20' stroke='%236b4d3a' stroke-width='0.8'/%3E%3Cline x1='10' y1='32' x2='60' y2='32' stroke='%236b4d3a' stroke-width='0.6'/%3E%3Cline x1='10' y1='44' x2='95' y2='44' stroke='%236b4d3a' stroke-width='0.8'/%3E%3Cline x1='10' y1='56' x2='50' y2='56' stroke='%236b4d3a' stroke-width='0.6'/%3E%3Cline x1='10' y1='68' x2='70' y2='68' stroke='%236b4d3a' stroke-width='0.8'/%3E%3Cline x1='10' y1='80' x2='90' y2='80' stroke='%236b4d3a' stroke-width='0.6'/%3E%3Cline x1='10' y1='92' x2='45' y2='92' stroke='%236b4d3a' stroke-width='0.8'/%3E%3Cline x1='10' y1='104' x2='75' y2='104' stroke='%236b4d3a' stroke-width='0.6'/%3E%3Crect x='85' y='10' width='25' height='30' rx='2' fill='none' stroke='%236b4d3a' stroke-width='0.8' stroke-dasharray='3 2'/%3E%3C/svg%3E")`,
  // 007 — Optical target / crosshair
  "007": `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120' viewBox='0 0 120 120'%3E%3Ccircle cx='60' cy='60' r='45' fill='none' stroke='%236b4d3a' stroke-width='1'/%3E%3Ccircle cx='60' cy='60' r='28' fill='none' stroke='%236b4d3a' stroke-width='0.8'/%3E%3Ccircle cx='60' cy='60' r='12' fill='none' stroke='%236b4d3a' stroke-width='0.6'/%3E%3Ccircle cx='60' cy='60' r='3' fill='%236b4d3a'/%3E%3Cline x1='60' y1='5' x2='60' y2='35' stroke='%236b4d3a' stroke-width='0.8'/%3E%3Cline x1='60' y1='85' x2='60' y2='115' stroke='%236b4d3a' stroke-width='0.8'/%3E%3Cline x1='5' y1='60' x2='35' y2='60' stroke='%236b4d3a' stroke-width='0.8'/%3E%3Cline x1='85' y1='60' x2='115' y2='60' stroke='%236b4d3a' stroke-width='0.8'/%3E%3C/svg%3E")`,
};

export const AgentStatusRail: React.FC<AgentStatusRailProps> = ({
  steps,
  isRunning,
  totalElapsedSeconds,
  estimatedRemainingSeconds,
}) => {
  const iconMap = {
    M: Terminal,
    Q: Database,
    Eve: LineChart,
    "007": ShieldAlert,
  };

  return (
    <div className="w-full rounded-lg border border-noir bg-bg-surface p-4 transition-colors duration-200">
      {/* Top Header: Title and Live Countdown Timer */}
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2 border-b border-noir pb-2.5">
        <div className="flex items-center gap-2">
          <span className="font-display text-xs font-bold uppercase tracking-wider text-text-primary">
            Autonomous FP&A Pipeline
          </span>
          <span className="font-body text-[10px] uppercase tracking-widest text-text-secondary font-bold">
            • 4-Agent Execution
          </span>
        </div>

        {/* Live Elapsed & Countdown Timer */}
        <div className="flex items-center gap-3 font-body text-xs font-medium uppercase tracking-wider text-text-secondary">
          <div className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-text-secondary" />
            <span className="tabular-nums font-mono">Elapsed: {totalElapsedSeconds.toFixed(1)}s</span>
          </div>
          {isRunning && (
            <div className="flex items-center gap-1 text-accent-rust font-bold">
              <span className="tabular-nums font-mono">• Est. Remaining: ~{Math.max(0, estimatedRemainingSeconds).toFixed(0)}s</span>
            </div>
          )}
        </div>
      </div>

      {/* 4-Agent Step Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {steps.map((step) => {
          const Icon = iconMap[step.code];
          const insignia = agentInsignia[step.code];
          const isActive = step.status === "active";

          return (
            <div
              key={step.code}
              className={`relative flex flex-col justify-between rounded-md p-3 transition-all duration-200 bg-dither ${
                isActive ? "bg-scanline active" : ""
              } ${
                step.status === "pending"
                  ? "border border-dashed border-noir bg-bg-canvas/50 text-text-muted"
                  : step.status === "active"
                  ? "border-2 border-text-secondary bg-bg-surface-subtle shadow-sm animate-sepia-glow"
                  : step.status === "completed"
                  ? "border border-noir bg-bg-surface-subtle text-text-primary"
                  : "border border-accent-rust bg-bg-surface text-accent-rust"
              }`}
            >
              {/* Background insignia watermark */}
              <div
                className="absolute inset-0 z-0 pointer-events-none opacity-[0.08] bg-no-repeat bg-center bg-contain"
                style={{
                  backgroundImage: insignia,
                  backgroundSize: "85%",
                  backgroundPosition: "center center",
                  mixBlendMode: "var(--dither-blend)" as any,
                }}
              />

              {/* Card Header: Agent Label & Status Indicator */}
              <div className="relative z-[2] flex items-center justify-between gap-2 mb-1.5">
                <div className="flex items-center gap-2">
                  <div
                    className={`flex h-6 w-6 items-center justify-center rounded border ${
                      step.status === "pending"
                        ? "border-noir bg-bg-surface text-text-muted"
                        : step.status === "active"
                        ? "border-text-secondary bg-text-secondary text-bg-canvas animate-pulse"
                        : step.status === "completed"
                        ? "border-noir bg-bg-surface text-text-primary"
                        : "border-accent-rust bg-accent-rust text-bg-canvas"
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                  </div>
                  <span className="font-display text-sm font-bold uppercase tracking-tight text-text-primary">
                    Agent {step.code}
                  </span>
                </div>

                {/* State-specific Badge */}
                {step.status === "pending" && (
                  <span className="font-body text-[10px] uppercase tracking-widest text-text-muted font-bold">
                    Pending
                  </span>
                )}

                {step.status === "active" && (
                  <span className="inline-flex items-center gap-1 font-body text-[10px] font-bold uppercase tracking-wider text-accent-rust">
                    <span className="h-1.5 w-1.5 rounded-full bg-accent-rust animate-ping" />
                    Active
                  </span>
                )}

                {step.status === "completed" && (
                  <div className="flex items-center gap-1.5">
                    <span className="rounded border border-noir bg-bg-surface px-1.5 py-0.5 font-mono text-[10px] text-text-muted">
                      {step.timing || "Done"}
                    </span>
                    <div className="flex h-4 w-4 items-center justify-center rounded-full bg-accent-contrast text-bg-canvas">
                      <Check className="h-2.5 w-2.5 stroke-[3]" />
                    </div>
                  </div>
                )}

                {step.status === "failed" && (
                  <div className="flex items-center gap-1 text-accent-rust">
                    <AlertCircle className="h-3.5 w-3.5" />
                    <span className="font-body text-[10px] uppercase tracking-wider font-bold">
                      Failed
                    </span>
                  </div>
                )}
              </div>

              {/* Agent Title & Live Subtext */}
              <div className="relative z-[2]">
                <div className="font-body text-xs font-bold text-text-primary">
                  {step.name}
                </div>
                <div className="mt-1 font-body text-[11px] leading-snug text-text-secondary">
                  {step.status === "active" && step.subtext ? (
                    <span className="text-accent-rust font-medium animate-pulse">
                      {step.subtext}
                    </span>
                  ) : (
                    step.roleDescription
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
