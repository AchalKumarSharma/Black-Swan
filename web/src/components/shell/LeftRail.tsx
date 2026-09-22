"use client";

import React, { useState } from "react";
import {
  Plus,
  Search,
  Database,
  Settings,
  ChevronRight,
} from "lucide-react";

interface LeftRailProps {
  onNewReport?: () => void;
  onSelectReport?: (title: string) => void;
}

export const LeftRail: React.FC<LeftRailProps> = ({
  onNewReport,
  onSelectReport,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeReport, setActiveReport] = useState("Q2 Gross Margin Contraction");

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

  return (
    <aside className="hidden lg:flex w-[260px] h-full shrink-0 flex-col justify-between overflow-y-auto border-r border-[#6b4d3a]/30 bg-parchment-light/70 p-4 relative">
      {/* Cold War Telemetry Coordinates Ruler along inner rail border */}
      <div className="pointer-events-none select-none absolute right-0 top-0 bottom-0 w-3 overflow-hidden opacity-[0.14] mix-blend-multiply flex flex-col justify-between py-6">
        <svg viewBox="0 0 12 600" preserveAspectRatio="none" className="w-full h-full text-swan-sepia stroke-current">
          {Array.from({ length: 30 }).map((_, i) => (
            <g key={i}>
              <line x1={i % 5 === 0 ? "2" : "6"} y1={i * 20} x2="12" y2={i * 20} strokeWidth={i % 5 === 0 ? "1" : "0.5"} />
              {i % 5 === 0 && (
                <text x="0" y={i * 20 + 3} fill="#6b4d3a" stroke="none" className="font-mono text-[5px] select-none">
                  {String(i * 10).padStart(3, '0')}
                </text>
              )}
            </g>
          ))}
        </svg>
      </div>

      {/* Upper Navigation Block */}
      <div className="flex flex-col gap-5 relative z-10">
        {/* + New Report Primary Action (Stays Solid Black) */}
        <button
          onClick={onNewReport}
          className="flex h-10 w-full items-center justify-center gap-2 rounded-md bg-swan-black px-4 font-sans text-xs font-semibold uppercase tracking-wider text-parchment hover:bg-swan-charcoal transition-colors shadow-none cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>New Report</span>
        </button>

        {/* Search Input for Historical Inquiries with centered icon */}
        <div className="relative flex items-center">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#4a4540] pointer-events-none" />
          <input
            type="text"
            placeholder="Search inquiries..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-8.5 w-full rounded-md border border-swan-sepia/60 bg-parchment pl-9 pr-3 font-sans text-xs text-swan-black placeholder:text-swan-sepia/60 focus:border-swan-sepia focus:outline-none transition-colors"
          />
        </div>

        {/* Recent Reports Groups */}
        <div className="flex flex-col gap-4">
          {/* Today Group */}
          <div>
            <div className="mb-2 font-sans text-[10px] font-bold uppercase tracking-widest text-swan-sepia">
              Today
            </div>
            <div className="flex flex-col gap-1">
              {recentToday.map((item) => (
                <button
                  key={item.title}
                  onClick={() => {
                    setActiveReport(item.title);
                    if (onSelectReport) onSelectReport(item.title);
                  }}
                  className={`flex w-full items-center justify-between rounded px-2.5 py-1.5 text-left font-sans text-xs transition-colors ${
                    activeReport === item.title
                      ? "bg-swan-black text-parchment font-medium"
                      : "text-swan-charcoal hover:bg-parchment-dark hover:text-swan-black"
                  }`}
                >
                  <span className="truncate pr-2">{item.title}</span>
                  <span
                    className={`shrink-0 text-[10px] ${
                      activeReport === item.title
                        ? "text-parchment/70"
                        : "text-swan-sepia/80"
                    }`}
                  >
                    {item.time}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Previous 7 Days Group */}
          <div>
            <div className="mb-2 font-sans text-[10px] font-bold uppercase tracking-widest text-swan-sepia">
              Previous 7 Days
            </div>
            <div className="flex flex-col gap-1">
              {recentWeek.map((item) => (
                <button
                  key={item.title}
                  onClick={() => {
                    setActiveReport(item.title);
                    if (onSelectReport) onSelectReport(item.title);
                  }}
                  className={`flex w-full items-center justify-between rounded px-2.5 py-1.5 text-left font-sans text-xs transition-colors ${
                    activeReport === item.title
                      ? "bg-swan-black text-parchment font-medium"
                      : "text-swan-charcoal hover:bg-parchment-dark hover:text-swan-black"
                  }`}
                >
                  <span className="truncate pr-2">{item.title}</span>
                  <span
                    className={`shrink-0 text-[10px] ${
                      activeReport === item.title
                        ? "text-parchment/70"
                        : "text-swan-sepia/80"
                    }`}
                  >
                    {item.time}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Data Connections Drawer */}
          <div className="border-t border-swan-sepia/25 pt-3">
            <div className="mb-2 flex items-center justify-between">
              <span className="font-sans text-[10px] font-bold uppercase tracking-widest text-swan-sepia">
                Data Connections
              </span>
              <Database className="h-3 w-3 text-swan-sepia" />
            </div>
            <div className="flex flex-col gap-1.5">
              {dataSources.map((ds) => (
                <div
                  key={ds.name}
                  className="flex items-center justify-between rounded border border-swan-sepia/35 bg-parchment px-2 py-1 text-[11px]"
                >
                  <div className="flex items-center gap-2 truncate">
                    <span
                      className={`inline-block h-1.5 w-1.5 rounded-full ${
                        ds.active
                          ? "bg-swan-sepia"
                          : "border border-swan-sepia/70 border-dashed bg-transparent"
                      }`}
                    />
                    <span className="truncate text-swan-black font-mono text-[10px]">
                      {ds.name}
                    </span>
                  </div>
                  <span className="text-[9px] text-swan-sepia uppercase font-semibold">
                    {ds.size}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Utility & Capacity Meter */}
      <div className="border-t border-swan-sepia/30 pt-4">
        {/* Storage Capacity Bar */}
        <div className="mb-3">
          <div className="mb-1.5 flex items-center justify-between text-[10px] font-sans uppercase tracking-wider text-swan-sepia font-semibold">
            <span>In-Memory DuckDB</span>
            <span className="font-mono text-swan-charcoal">1.2 / 8 GB</span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-parchment-dark">
            <div
              className="h-1.5 rounded-full bg-swan-sepia"
              style={{ width: "15%" }}
            />
          </div>
        </div>

        {/* Settings button */}
        <button className="flex w-full items-center justify-between rounded px-2 py-1.5 text-xs text-swan-charcoal hover:bg-parchment-dark hover:text-swan-black transition-colors">
          <div className="flex items-center gap-2">
            <Settings className="h-3.5 w-3.5 text-swan-sepia" />
            <span>Workspace Settings</span>
          </div>
          <ChevronRight className="h-3 w-3 text-swan-sepia" />
        </button>
      </div>
    </aside>
  );
};
