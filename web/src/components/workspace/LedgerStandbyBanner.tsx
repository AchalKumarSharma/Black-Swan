"use client";

import React from "react";
import { Database, X } from "lucide-react";

interface LedgerStandbyBannerProps {
  onDismiss: () => void;
}

export const LedgerStandbyBanner: React.FC<LedgerStandbyBannerProps> = ({
  onDismiss,
}) => {
  return (
    <div className="w-full rounded-xl border border-neutral-800 bg-[#0F0F0F] text-neutral-300 p-5 backdrop-blur-sm transition-all duration-200 shadow-lg">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-neutral-800 bg-neutral-900 text-neutral-400 mt-0.5">
            <Database className="h-4 w-4 text-neutral-300" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-neutral-400">
                AUDIT STANDBY // CODE 422
              </span>
            </div>
            <h4 className="font-display text-sm font-bold uppercase tracking-wide text-neutral-100">
              LEDGER REQUIRED // INGESTION STANDBY
            </h4>
            <p className="font-body text-xs text-neutral-400 leading-relaxed max-w-2xl">
              No active financial ledger loaded into DuckDB. Upload an Excel/CSV file or click &apos;Load Sample Dataset&apos; to initialize analysis.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onDismiss}
          className="rounded p-1 text-neutral-400 hover:bg-neutral-800 hover:text-white transition-colors cursor-pointer shrink-0"
          aria-label="Dismiss standby notice"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};
