import React from "react";
import Link from "next/link";
import { PublicNav } from "@/components/landing/PublicNav";
import { Terminal, Database, LineChart, Shield, ArrowRight } from "lucide-react";

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-parchment text-swan-black selection:bg-swan-black selection:text-parchment flex flex-col">
      <PublicNav />
      <main className="mx-auto w-full max-w-4xl px-6 py-12 flex-1">
        <div className="mb-8">
          <div className="font-body text-xs font-bold uppercase tracking-widest text-swan-sepia mb-2">
            Architecture &amp; Design Manual
          </div>
          <h1 className="font-display text-4xl font-bold uppercase tracking-tight text-swan-black mb-4">
            Black Swan System Documentation
          </h1>
          <p className="font-body text-sm text-swan-charcoal leading-relaxed">
            Black Swan provides autonomous, mathematically verifiable financial intelligence. The system coordinates four specialized FP&A AI agents connected through symmetric contracts and executing deterministic analytical SQL over local in-memory DuckDB engines.
          </p>
        </div>

        <div className="space-y-6">
          <section className="rounded-lg border border-swan-sepia/40 bg-parchment-light p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex h-8 w-8 items-center justify-center rounded border border-swan-sepia/60 bg-parchment text-swan-black">
                <Terminal className="h-4 w-4 text-swan-sepia" />
              </div>
              <h2 className="font-display text-xl font-bold uppercase tracking-tight text-swan-black">
                Agent M — Strategic Orchestrator
              </h2>
            </div>
            <p className="font-body text-xs text-swan-charcoal leading-relaxed">
              Decomposes high-level executive questions (e.g. &ldquo;Why did Gross Margin drop in Q2?&rdquo;) into structured, phased analytical plans. Dispatches sub-queries to downstream agents and compiles final run logs.
            </p>
          </section>

          <section className="rounded-lg border border-swan-sepia/40 bg-parchment-light p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex h-8 w-8 items-center justify-center rounded border border-swan-sepia/60 bg-parchment text-swan-black">
                <Database className="h-4 w-4 text-swan-sepia" />
              </div>
              <h2 className="font-display text-xl font-bold uppercase tracking-tight text-swan-black">
                Agent Q — Data &amp; Diagnostics
              </h2>
            </div>
            <p className="font-body text-xs text-swan-charcoal leading-relaxed">
              Executes deterministic, sub-second DuckDB SQL queries directly on columnar financial data. Computes variance bridges, flags statistical anomalies, and isolates mathematical root causes with zero LLM hallucination in the arithmetic layer.
            </p>
          </section>

          <section className="rounded-lg border border-swan-sepia/40 bg-parchment-light p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex h-8 w-8 items-center justify-center rounded border border-swan-sepia/60 bg-parchment text-swan-black">
                <LineChart className="h-4 w-4 text-swan-sepia" />
              </div>
              <h2 className="font-display text-xl font-bold uppercase tracking-tight text-swan-black">
                Agent Eve — Audit &amp; Visualization
              </h2>
            </div>
            <p className="font-body text-xs text-swan-charcoal leading-relaxed">
              Synthesizes interactive Recharts specifications, documents plain-language formula receipts, computes deterministic confidence scores, and exposes full executed SQL code in an inspection audit ledger.
            </p>
          </section>

          <section className="rounded-lg border border-swan-sepia/40 bg-parchment-light p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex h-8 w-8 items-center justify-center rounded border border-swan-sepia/60 bg-parchment text-swan-black">
                <Shield className="h-4 w-4 text-swan-sepia" />
              </div>
              <h2 className="font-display text-xl font-bold uppercase tracking-tight text-swan-black">
                Agent 007 — Strategy &amp; Remediation
              </h2>
            </div>
            <p className="font-body text-xs text-swan-charcoal leading-relaxed">
              Proposes bounded remedial business actions and dynamic what-if sensitivity levers, allowing executives to model real-time gross margin recovery and cash flow conservation.
            </p>
          </section>
        </div>

        <div className="mt-10 flex items-center justify-between border-t border-swan-sepia/30 pt-6">
          <Link
            href="/"
            className="font-body text-xs font-bold uppercase tracking-wider text-swan-sepia hover:text-swan-black"
          >
            ← Back to Home
          </Link>
          <Link
            href="/workspace"
            className="inline-flex items-center gap-2 rounded bg-swan-black px-6 py-2.5 font-body text-xs font-bold uppercase tracking-wider text-parchment hover:bg-swan-charcoal"
          >
            <span>Launch Workspace</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </main>
    </div>
  );
}
