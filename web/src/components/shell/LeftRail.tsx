"use client";

import React, { useState } from "react";
import {
  Plus,
  Search,
  Database,
  Settings,
  ChevronRight,
  X,
} from "lucide-react";

interface LeftRailProps {
  onNewReport?: () => void;
  onSelectReport?: (title: string) => void;
  onSelectDataSource?: (sourceName: string) => void;
  onOpenSettings?: () => void;
  className?: string;
}

export const LeftRail: React.FC<LeftRailProps> = ({
  onNewReport,
  onSelectReport,
  onSelectDataSource,
  onOpenSettings,
  className,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeReport, setActiveReport] = useState("Q2 Gross Margin Contraction");
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  const recentToday = [
    { title: "Q2 Gross Margin Contraction", time: "12m ago" },
    { title: "OPEX Headcount Variance", time: "2h ago" },
  ];

  const recentWeek = [
    { title: "South Region Logistics Spike", time: "3d ago" },
    { title: "SaaS ARR Cohort Drift", time: "5d ago" },
    { title: "Q1 Working Capital Bridge", time: "6d ago" },
  ];

  const dataSources = [
    { name: "SaaS_Q2_Financials.csv", active: true, size: "4.2 MB" },
    { name: "Postgres_GL_Sync", active: true, size: "128 MB" },
    { name: "Salesforce_Billing_Export", active: false, size: "Offline" },
  ];

  const filteredToday = recentToday.filter((item) =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredWeek = recentWeek.filter((item) =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <aside
      data-lenis-prevent
      className={
        className ??
        "hidden md:flex w-[260px] h-full shrink-0 flex-col justify-between overflow-y-auto border-r border-noir bg-bg-surface/70 text-text-primary p-4 relative transition-colors duration-200"
      }
    >
      {/* Cold War Telemetry Coordinates Ruler along inner rail border */}
      <div
        className="pointer-events-none select-none absolute right-0 top-0 bottom-0 w-3 overflow-hidden opacity-[0.14] flex flex-col justify-between py-6"
        style={{ mixBlendMode: "var(--dither-blend)" as any }}
      >
        <svg viewBox="0 0 12 600" preserveAspectRatio="none" className="w-full h-full stroke-current" style={{ color: "var(--text-secondary)" }}>
          {Array.from({ length: 30 }).map((_, i) => (
            <g key={i}>
              <line x1={i % 5 === 0 ? "2" : "6"} y1={i * 20} x2="12" y2={i * 20} strokeWidth={i % 5 === 0 ? "1" : "0.5"} />
              {i % 5 === 0 && (
                <text x="0" y={i * 20 + 3} fill="currentColor" stroke="none" className="font-mono text-[5px] select-none">
                  {String(i * 10).padStart(3, '0')}
                </text>
              )}
            </g>
          ))}
        </svg>
      </div>

      {/* Upper Navigation Block */}
      <div className="flex flex-col gap-5 relative z-10">
        {/* + New Report Primary Action */}
        <button
          onClick={onNewReport}
          className="flex h-10 w-full items-center justify-center gap-2 rounded-md bg-accent-contrast px-4 font-body text-xs font-bold uppercase tracking-wider text-bg-canvas hover:opacity-90 transition-opacity shadow-none cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>New Report</span>
        </button>

        {/* Search Input for Historical Inquiries with centered icon */}
        <div className="relative flex items-center">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-muted pointer-events-none" />
          <input
            type="text"
            placeholder="Search inquiries..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-8.5 w-full rounded-md border border-noir bg-bg-canvas pl-9 pr-3 font-body text-xs text-text-primary placeholder:text-text-muted focus:border-text-secondary focus:outline-none transition-colors"
          />
        </div>

        {/* Recent Reports Groups */}
        <div className="flex flex-col gap-4">
          {/* Today Group */}
          {filteredToday.length > 0 && (
            <div>
              <div className="mb-2 font-display text-[10px] font-bold uppercase tracking-widest text-text-secondary">
                Today
              </div>
              <div className="flex flex-col gap-1">
                {filteredToday.map((item) => (
                  <button
                    key={item.title}
                    type="button"
                    onClick={() => {
                      setActiveReport(item.title);
                      if (onSelectReport) onSelectReport(item.title);
                    }}
                    className={`flex w-full items-center justify-between rounded px-2.5 py-1.5 text-left font-body text-xs transition-colors cursor-pointer ${
                      activeReport === item.title
                        ? "bg-accent-contrast text-bg-canvas font-semibold"
                        : "text-text-secondary hover:bg-bg-surface hover:text-text-primary"
                    }`}
                  >
                    <span className="truncate pr-2">{item.title}</span>
                    <span
                      className={`shrink-0 text-[10px] ${
                        activeReport === item.title
                          ? "text-bg-canvas/70"
                          : "text-text-muted"
                      }`}
                    >
                      {item.time}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Previous 7 Days Group */}
          {filteredWeek.length > 0 && (
            <div>
              <div className="mb-2 font-display text-[10px] font-bold uppercase tracking-widest text-text-secondary">
                Previous 7 Days
              </div>
              <div className="flex flex-col gap-1">
                {filteredWeek.map((item) => (
                  <button
                    key={item.title}
                    type="button"
                    onClick={() => {
                      setActiveReport(item.title);
                      if (onSelectReport) onSelectReport(item.title);
                    }}
                    className={`flex w-full items-center justify-between rounded px-2.5 py-1.5 text-left font-body text-xs transition-colors cursor-pointer ${
                      activeReport === item.title
                        ? "bg-accent-contrast text-bg-canvas font-semibold"
                        : "text-text-secondary hover:bg-bg-surface hover:text-text-primary"
                    }`}
                  >
                    <span className="truncate pr-2">{item.title}</span>
                    <span
                      className={`shrink-0 text-[10px] ${
                        activeReport === item.title
                          ? "text-bg-canvas/70"
                          : "text-text-muted"
                      }`}
                    >
                      {item.time}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {filteredToday.length === 0 && filteredWeek.length === 0 && searchQuery.trim() && (
            <div className="px-2 py-3 text-center font-mono text-[11px] text-text-muted italic border border-dashed border-noir rounded">
              No matching inquiries found
            </div>
          )}

          {/* Data Connections Drawer */}
          <div className="border-t border-noir pt-3">
            <div className="mb-2 flex items-center justify-between">
              <span className="font-display text-[10px] font-bold uppercase tracking-widest text-text-secondary">
                Data Connections
              </span>
              <Database className="h-3 w-3 text-text-secondary" />
            </div>
            <div className="flex flex-col gap-1.5">
              {dataSources.map((ds) => (
                <button
                  key={ds.name}
                  type="button"
                  onClick={() => {
                    if (onSelectDataSource) {
                      onSelectDataSource(ds.name);
                    }
                  }}
                  className="flex w-full items-center justify-between rounded border border-noir bg-bg-canvas px-2 py-1 text-[11px] hover:bg-neutral-800/50 cursor-pointer transition-colors text-left"
                >
                  <div className="flex items-center gap-2 truncate">
                    <span
                      className={`inline-block h-1.5 w-1.5 rounded-full ${
                        ds.active
                          ? "bg-accent-rust"
                          : "border border-noir border-dashed bg-transparent"
                      }`}
                    ></span>
                    <span className="truncate text-text-primary font-mono text-[10px]">
                      {ds.name}
                    </span>
                  </div>
                  <span className="text-[9px] text-text-secondary uppercase font-semibold">
                    {ds.size}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Utility & Capacity Meter */}
      <div className="border-t border-noir pt-4">
        {/* Storage Capacity Bar */}
        <div className="mb-3">
          <div className="mb-1.5 flex items-center justify-between text-[10px] font-body uppercase tracking-wider text-text-secondary font-semibold">
            <span>In-Memory DuckDB</span>
            <span className="font-mono text-text-muted">1.2 / 8 GB</span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-bg-surface-subtle border border-noir overflow-hidden">
            <div
              className="h-full bg-text-secondary rounded-full"
              style={{ width: "15%" }}
            />
          </div>
        </div>

        {/* Settings button */}
        <button
          type="button"
          onClick={() => {
            if (onOpenSettings) {
              onOpenSettings();
            } else {
              setShowSettingsModal(true);
            }
          }}
          className="flex w-full items-center justify-between rounded px-2 py-1.5 font-body text-xs text-text-secondary hover:bg-bg-surface hover:text-text-primary transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <Settings className="h-3.5 w-3.5 text-text-secondary" />
            <span>Workspace Settings</span>
          </div>
          <ChevronRight className="h-3 w-3 text-text-secondary" />
        </button>
      </div>

      {/* Workspace Configuration Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#12100e]/80 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm rounded-xl border border-noir bg-bg-surface p-5 shadow-2xl relative">
            <button
              type="button"
              onClick={() => setShowSettingsModal(false)}
              className="absolute right-4 top-4 text-text-secondary hover:text-text-primary cursor-pointer"
              aria-label="Close settings"
            >
              <X className="h-4 w-4" />
            </button>
            <div className="flex items-center gap-2 mb-3">
              <Settings className="h-4 w-4 text-text-secondary" />
              <h3 className="font-display text-sm font-bold uppercase tracking-wider text-text-primary">
                Workspace Configuration
              </h3>
            </div>
            <div className="space-y-2.5 font-mono text-xs">
              <div className="flex justify-between py-1 border-b border-noir">
                <span className="text-text-secondary">Workspace ID:</span>
                <span className="text-text-primary truncate max-w-[170px]">00000000-0000-0000-0000-000000000001</span>
              </div>
              <div className="flex justify-between py-1 border-b border-noir">
                <span className="text-text-secondary">Execution Engine:</span>
                <span className="text-text-primary">In-Memory DuckDB</span>
              </div>
              <div className="flex justify-between py-1 border-b border-noir">
                <span className="text-text-secondary">Classification:</span>
                <span className="text-accent-rust font-bold">SECTION 007 // TOP SECRET</span>
              </div>
              <div className="flex justify-between py-1 border-b border-noir">
                <span className="text-text-secondary">Orchestration:</span>
                <span className="text-text-primary">Agent M (Deterministic)</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-text-secondary">Status:</span>
                <span className="text-emerald-500 font-bold">SYSTEM ACTIVE</span>
              </div>
            </div>
            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={() => setShowSettingsModal(false)}
                className="rounded border border-noir bg-bg-canvas px-3.5 py-1.5 font-body text-xs font-bold uppercase tracking-wider text-text-secondary hover:text-text-primary cursor-pointer transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};
