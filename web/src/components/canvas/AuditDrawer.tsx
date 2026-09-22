"use client";

import React, { useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  ShieldCheck,
  Copy,
  Check,
  FileCode,
  Info,
} from "lucide-react";
import { Eve_Audit, Q_Diagnostic } from "@/types/contracts";

interface AuditDrawerProps {
  audit: Eve_Audit;
  diagnostic?: Q_Diagnostic;
}

export const AuditDrawer: React.FC<AuditDrawerProps> = ({
  audit,
  diagnostic,
}) => {
  // Strictly collapsed by default to keep raw code from cluttering primary analytical view
  const [isOpen, setIsOpen] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);

  const confidencePct = (audit.confidence_score * 100).toFixed(1);
  const sqlToDisplay = diagnostic?.executed_sql || "-- No SQL available";

  const handleCopySql = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(sqlToDisplay);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  return (
    <section className="rounded-md border border-noir bg-bg-surface shadow-none overflow-hidden transition-all">
      {/* Collapsible Accordion Header — Single-line executive summary trigger */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full px-6 py-4 text-left bg-bg-surface hover:bg-bg-surface-subtle transition-colors select-none cursor-pointer group"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-5 w-5 flex-shrink-0 items-center justify-center text-text-secondary transition-transform duration-200">
            {isOpen ? (
              <ChevronDown className="h-4 w-4 text-text-secondary" />
            ) : (
              <ChevronRight className="h-4 w-4 text-text-secondary group-hover:translate-x-0.5 transition-transform" />
            )}
          </div>
          <span className="font-display text-base font-bold uppercase tracking-tight text-text-primary leading-none">
            {isOpen ? "Tier 3: Verification Proof & SQL Receipt" : "▶ View Verification Proof & SQL Receipt"}
          </span>
          <span className="text-text-secondary/40 mx-2 text-xs">|</span>
          <span className="text-xs uppercase tracking-wider font-body font-medium italic text-text-secondary">
            AGENT EVE • AUDIT &amp; VERIFICATION LEDGER
          </span>
        </div>

        {/* Confidence Score Pill — Single-line whitespace-nowrap */}
        <div className="h-8 px-3.5 whitespace-nowrap text-xs font-body uppercase tracking-wider inline-flex items-center gap-2 border border-noir rounded-full bg-transparent text-text-secondary font-bold leading-none">
          <ShieldCheck className="h-3.5 w-3.5 flex-shrink-0 text-text-secondary" />
          <span className="tabular-nums font-mono">{confidencePct}% Deterministic Confidence</span>
        </div>
      </button>

      {/* Expanded Accordion Body — Smooth presentation */}
      {isOpen && (
        <div className="border-t border-noir bg-bg-canvas/40 p-6 space-y-6 animate-in fade-in duration-200">
          {/* Plain-Language Narrative Overview */}
          <div>
            <div className="font-display text-[10px] font-bold uppercase tracking-widest text-text-secondary mb-1.5 flex items-center gap-1.5">
              <Info className="h-3.5 w-3.5 flex-shrink-0 text-text-secondary" />
              <span>Auditor Narrative Assessment</span>
            </div>
            <p className="font-body text-xs leading-relaxed text-text-muted border-l-2 border-text-secondary pl-3">
              {audit.plain_language_narrative}
            </p>
          </div>

          {/* Formula Ledger Receipts — uniform padding and borders */}
          <div>
            <div className="font-display text-[10px] font-bold uppercase tracking-widest text-text-secondary mb-2">
              Formula Ledger &amp; Math Receipts
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {audit.formula_ledger.map((entry, idx) => (
                <div
                  key={idx}
                  className="rounded border border-noir bg-bg-surface p-3.5 text-xs font-body"
                >
                  <div className="font-display font-bold uppercase tracking-tight text-text-primary mb-1.5 leading-none">
                    {entry.metric}
                  </div>
                  <div className="font-mono tabular-nums text-[11px] text-text-muted bg-bg-surface-subtle px-2.5 py-1.5 rounded border border-noir mb-2">
                    {entry.formula}
                  </div>
                  <div className="text-[11px] text-text-secondary leading-snug">
                    <span className="font-bold">Step: </span>
                    {entry.computation_step}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Assumptions List */}
          <div>
            <div className="font-display text-[10px] font-bold uppercase tracking-widest text-text-secondary mb-2">
              Declared Audit Assumptions &amp; Data Caveats
            </div>
            <ul className="space-y-1.5 text-xs text-text-muted font-body">
              {audit.assumptions.map((assumption, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-text-secondary font-mono font-bold leading-none mt-0.5 tabular-nums">[A{idx + 1}]</span>
                  <span className="leading-relaxed">{assumption}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Executed SQL Code Block with Cold War Cipher Matrix Watermark */}
          <div>
            <div className="mb-2 flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-1.5 font-display text-[10px] font-bold uppercase tracking-widest text-text-secondary">
                <FileCode className="h-3.5 w-3.5 flex-shrink-0 text-text-secondary" />
                <span>Deterministic DuckDB SQL Execution</span>
              </div>
              <button
                type="button"
                onClick={handleCopySql}
                className="h-8 px-3.5 whitespace-nowrap text-xs font-body font-bold uppercase tracking-wider inline-flex items-center gap-2 border border-noir rounded bg-transparent hover:bg-bg-surface-subtle transition-colors leading-none text-text-primary cursor-pointer"
              >
                {copiedSql ? (
                  <Check className="h-3.5 w-3.5 text-text-primary" />
                ) : (
                  <Copy className="h-3.5 w-3.5 text-text-secondary" />
                )}
                <span>{copiedSql ? "Copied" : "Copy SQL Receipt"}</span>
              </button>
            </div>
            <div className="relative overflow-hidden rounded border border-noir bg-[#0a0908]">
              {/* Cold War Binary / Hex Cryptographic Cipher Matrix Watermark */}
              <div className="pointer-events-none select-none absolute right-2 top-2 bottom-2 w-72 opacity-[0.10] mix-blend-screen overflow-hidden font-mono text-[8px] text-[#f0eae0] leading-tight select-none">
                <pre className="bg-transparent text-[#f0eae0] p-0 border-0">{`01000010 01001100 01000001 01000011 01001011
SHA256: 8f7b2a9e4d1c5e6b0a3f789d2c1e4a5b
DUCKDB_VERIFIED // 51.5074° N, 0.1278° W
MI6_FP&A_SECTION_007 // RECEIPT_OK
CIPHER_STREAM: A7-9F-3C-8E-2B-1D-4A-6E
01010011 01010111 01000001 01001110 00110000`}</pre>
              </div>
              <pre data-lenis-prevent className="relative z-10 p-4 font-mono tabular-nums text-[11px] leading-relaxed text-emerald-400/90 overflow-x-auto selection:bg-[#f0eae0] selection:text-[#12100e] bg-transparent">
                <code>{sqlToDisplay}</code>
              </pre>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
