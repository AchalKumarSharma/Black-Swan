"use client";

import React from "react";
import { AlertCircle, X, RefreshCw } from "lucide-react";
import { ValidationIssue } from "@/types/data";

interface IngestionErrorTrayProps {
  errors: ValidationIssue[];
  onDismiss: () => void;
  onRetry?: () => void;
}

export const IngestionErrorTray: React.FC<IngestionErrorTrayProps> = ({
  errors,
  onDismiss,
  onRetry,
}) => {
  if (!errors || errors.length === 0) return null;

  return (
    <div className="w-full rounded-xl border border-red-900/50 bg-red-950/30 p-5 backdrop-blur-sm transition-all duration-200 shadow-lg">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-red-800/60 bg-red-900/40 text-red-300">
            <AlertCircle className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-red-400">
                AUDIT REJECTION // CODE 422
              </span>
            </div>
            <h4 className="font-display text-sm font-bold uppercase tracking-wide text-red-100 mt-0.5">
              Ledger Ingestion Failed
            </h4>
            <p className="mt-1 font-body text-xs text-red-200/80">
              The uploaded file does not satisfy Black Swan analytical requirements. Please review the
              itemized findings below:
            </p>

            {/* Itemized issue list */}
            <ul className="mt-3 space-y-1.5 font-mono text-xs">
              {errors.map((err, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-2 rounded bg-black/30 px-3 py-1.5 text-red-200"
                >
                  <span className="font-bold text-red-400 uppercase tracking-wider text-[10px] shrink-0 mt-0.5">
                    [{err.field}]
                  </span>
                  <span className="text-[11px] leading-relaxed">{err.issue}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 shrink-0">
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="inline-flex items-center gap-1.5 rounded border border-red-800/60 bg-red-900/30 px-3 py-1.5 font-body text-xs font-semibold text-red-200 hover:bg-red-900/50 hover:text-white transition-colors cursor-pointer"
            >
              <RefreshCw className="h-3 w-3" />
              <span>Retry</span>
            </button>
          )}
          <button
            type="button"
            onClick={onDismiss}
            className="rounded p-1 text-red-300 hover:bg-red-900/40 hover:text-white transition-colors cursor-pointer"
            aria-label="Dismiss error tray"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
