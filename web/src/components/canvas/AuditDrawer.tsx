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
    <section className="rounded-md border border-[#6b4d3a]/30 bg-[#f4f0e8] shadow-none overflow-hidden transition-all">
      {/* Collapsible Accordion Header — Single-line executive summary trigger */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full px-6 py-4 text-left bg-[#f4f0e8] hover:bg-parchment-light transition-colors select-none cursor-pointer group"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-5 w-5 flex-shrink-0 items-center justify-center text-[#6b4d3a] transition-transform duration-200">
            {isOpen ? (
              <ChevronDown className="h-4 w-4 text-[#6b4d3a]" />
            ) : (
              <ChevronRight className="h-4 w-4 text-[#6b4d3a] group-hover:translate-x-0.5 transition-transform" />
            )}
          </div>
          <span className="font-serif text-base font-bold text-[#1a1613] leading-none tracking-tight">
            {isOpen ? "Tier 3: Verification Proof & SQL Receipt" : "▶ View Verification Proof & SQL Receipt"}
          </span>
          <span className="text-[#6b4d3a]/30 mx-2 text-xs">|</span>
          <span className="text-xs uppercase tracking-wider font-sans font-medium text-[#6b4d3a]">
            AGENT EVE • AUDIT &amp; VERIFICATION LEDGER
          </span>
        </div>

        {/* Confidence Score Pill — Single-line whitespace-nowrap */}
        <div className="h-8 px-3.5 whitespace-nowrap text-xs font-sans uppercase tracking-wider inline-flex items-center gap-2 border border-[#6b4d3a]/50 rounded-full bg-transparent text-[#6b4d3a] font-semibold leading-none">
          <ShieldCheck className="h-3.5 w-3.5 flex-shrink-0 text-[#6b4d3a]" />
          <span className="tabular-nums">{confidencePct}% Deterministic Confidence</span>
        </div>
      </button>

      {/* Expanded Accordion Body — Smooth presentation */}
      {isOpen && (
        <div className="border-t border-[#6b4d3a]/20 bg-parchment-light/40 p-6 space-y-6 animate-in fade-in duration-200">
          {/* Plain-Language Narrative Overview */}
          <div>
            <div className="font-sans text-[10px] font-bold uppercase tracking-widest text-[#6b4d3a] mb-1.5 flex items-center gap-1.5">
              <Info className="h-3.5 w-3.5 flex-shrink-0 text-[#6b4d3a]" />
              <span>Auditor Narrative Assessment</span>
            </div>
            <p className="font-sans text-xs leading-relaxed text-swan-charcoal border-l-2 border-[#6b4d3a] pl-3">
              {audit.plain_language_narrative}
            </p>
          </div>

          {/* Formula Ledger Receipts — uniform padding and borders */}
          <div>
            <div className="font-sans text-[10px] font-bold uppercase tracking-widest text-[#6b4d3a] mb-2">
              Formula Ledger &amp; Math Receipts
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {audit.formula_ledger.map((entry, idx) => (
                <div
                  key={idx}
                  className="rounded border border-[#6b4d3a]/30 bg-[#f4f0e8] p-3.5 text-xs"
                >
                  <div className="font-serif font-bold text-[#1a1613] mb-1.5 leading-none">
                    {entry.metric}
                  </div>
                  <div className="font-mono tabular-nums text-[11px] text-swan-charcoal bg-parchment-dark/50 px-2.5 py-1.5 rounded border border-[#6b4d3a]/20 mb-2">
                    {entry.formula}
                  </div>
                  <div className="text-[11px] text-[#6b4d3a] leading-snug">
                    <span className="font-bold">Step: </span>
                    {entry.computation_step}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Assumptions List */}
          <div>
            <div className="font-sans text-[10px] font-bold uppercase tracking-widest text-[#6b4d3a] mb-2">
              Declared Audit Assumptions &amp; Data Caveats
            </div>
            <ul className="space-y-1.5 text-xs text-swan-charcoal">
              {audit.assumptions.map((assumption, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-[#6b4d3a] font-serif font-bold leading-none mt-0.5 tabular-nums">[A{idx + 1}]</span>
                  <span className="leading-relaxed">{assumption}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Executed SQL Code Block with Cold War Cipher Matrix Watermark */}
          <div>
            <div className="mb-2 flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-1.5 font-sans text-[10px] font-bold uppercase tracking-widest text-[#6b4d3a]">
                <FileCode className="h-3.5 w-3.5 flex-shrink-0 text-[#6b4d3a]" />
                <span>Deterministic DuckDB SQL Execution</span>
              </div>
              <button
                type="button"
                onClick={handleCopySql}
                className="h-8 px-3.5 whitespace-nowrap text-xs font-sans uppercase tracking-wider inline-flex items-center gap-2 border border-[#6b4d3a]/30 rounded bg-transparent hover:bg-[#1a1613]/5 transition-colors leading-none text-[#1a1613] cursor-pointer"
              >
                {copiedSql ? (
                  <Check className="h-3.5 w-3.5 text-[#1a1613]" />
                ) : (
                  <Copy className="h-3.5 w-3.5 text-[#6b4d3a]" />
                )}
                <span>{copiedSql ? "Copied" : "Copy SQL Receipt"}</span>
              </button>
            </div>
            <div className="relative overflow-hidden rounded border border-[#6b4d3a]/40 bg-swan-black">
              {/* Cold War Binary / Hex Cryptographic Cipher Matrix Watermark */}
              <div className="pointer-events-none select-none absolute right-2 top-2 bottom-2 w-72 opacity-[0.10] mix-blend-screen overflow-hidden font-mono text-[8px] text-parchment leading-tight select-none">
                <pre className="bg-transparent text-parchment p-0 border-0">{`01000010 01001100 01000001 01000011 01001011
SHA256: 8f7b2a9e4d1c5e6b0a3f789d2c1e4a5b
DUCKDB_VERIFIED // 51.5074° N, 0.1278° W
MI6_FP&A_SECTION_007 // RECEIPT_OK
CIPHER_STREAM: A7-9F-3C-8E-2B-1D-4A-6E
01010011 01010111 01000001 01001110 00110000`}</pre>
              </div>
              <pre className="relative z-10 p-4 font-mono tabular-nums text-[11px] leading-relaxed text-parchment overflow-x-auto selection:bg-parchment selection:text-swan-black bg-transparent">
                <code>{sqlToDisplay}</code>
              </pre>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
