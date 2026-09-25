"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { Search, X, Shield, Database, LineChart, Terminal, Lock } from "lucide-react";

import { DitherDistortionImage } from "@/components/ui/DitherDistortionImage";
import { BlackSwanLogo } from "@/components/ui/BlackSwanLogo";
import { JamesBondArchivalWatermark } from "@/components/ui/JamesBondArchivalWatermark";

export default function LandingPage() {
  const router = useRouter();
  const [selectedTier, setSelectedTier] = useState<"FREE" | "TEAM" | "ENTERPRISE" | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDocsOpen, setIsDocsOpen] = useState(false);
  const [isSignInOpen, setIsSignInOpen] = useState(false);
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchQuery.trim();
    if (query) {
      router.push(`/login?mode=signup&redirect=${encodeURIComponent('/workspace?q=' + encodeURIComponent(query))}`);
    } else {
      router.push(`/login?mode=signup&redirect=${encodeURIComponent('/workspace')}`);
    }
  };

  const handleSignInSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSignInOpen(false);
    router.push("/workspace");
  };

  return (
    <div className="min-h-screen bg-bg-canvas text-text-primary selection:bg-accent-contrast selection:text-bg-canvas flex flex-col relative overflow-x-hidden">
      {/* 1. Top Navigation */}
      <nav className="relative z-50 w-full bg-[#0A0A0A]/95 backdrop-blur-md px-4 py-3 flex items-center justify-between border-b border-white/5">
        <div className="mx-auto flex max-w-6xl items-center justify-between w-full">
          {/* Left: Exact Swan Logo Mark */}
          <Link href="/" className="flex items-center gap-2 group">
            <BlackSwanLogo className="w-7 h-7 text-white transition-colors" />
          </Link>

          {/* Center: Navigation Links (Hidden on mobile) */}
          <div className="hidden md:flex items-center gap-6 font-body text-xs font-bold uppercase tracking-widest">
            <Link
              href="/"
              onClick={() => {
                if (typeof window !== "undefined") {
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }
              }}
              className="inline-flex items-center h-8 leading-none pb-0.5 border-b-2 border-text-primary text-text-primary transition-colors"
            >
              Home
            </Link>
            <Link
              href="/login?mode=signin&redirect=/workspace"
              className="inline-flex items-center h-8 leading-none pb-0.5 border-b-2 border-transparent text-text-secondary hover:text-text-primary hover:border-noir transition-colors"
            >
              Reports
            </Link>
            <button
              type="button"
              onClick={() => setIsDocsOpen(true)}
              className="inline-flex items-center h-8 leading-none pb-0.5 border-b-2 border-transparent text-text-secondary hover:text-text-primary hover:border-noir uppercase font-bold text-xs tracking-widest transition-colors cursor-pointer"
            >
              Docs
            </button>
            <Link
              href="/login?mode=signin&redirect=/workspace"
              className="inline-flex items-center h-8 leading-none pb-0.5 border-b-2 border-transparent text-text-secondary hover:text-text-primary hover:border-noir transition-colors"
            >
              Sign In
            </Link>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center h-8 leading-none pb-0.5 border-b-2 border-transparent text-text-secondary hover:text-text-primary hover:border-noir transition-colors"
            >
              Community
            </a>
          </div>

          {/* Right: Theme Toggle & NEW REPORT Primary Button */}
          <div className="flex items-center gap-3">
            <div className="hidden md:inline-flex">
              <ThemeToggle />
            </div>
            <Link
              href="/login?mode=signup&redirect=/workspace"
              className="inline-flex items-center justify-center rounded bg-accent-contrast px-3 py-1.5 text-xs font-mono font-bold uppercase tracking-wider text-bg-canvas hover:opacity-90 transition-opacity shadow-none whitespace-nowrap"
            >
              New Report
            </Link>
          </div>
        </div>
      </nav>

      {/* MI6 / James Bond Cold War Archival Intelligence Dossier Watermark */}
      <JamesBondArchivalWatermark />

      {/* Main Container matching the reference layout */}
      <main className="mx-auto w-full max-w-6xl px-3.5 sm:px-10 py-6 sm:py-7 md:py-9 flex-1 flex flex-col justify-start relative z-10">

        {/* 2. Top-Secret Stamp Watermark & Interactive Tier Selector */}
        <div className="relative flex flex-col items-start gap-2 mb-3.5 z-10 pt-4 sm:pt-8">
          {/* Subtle Top-Secret Stamp Watermark positioned cleanly above pills without overlap */}
          <div className="pointer-events-none select-none inline-flex items-center opacity-45 -rotate-1 border border-dashed border-accent-rust/70 px-2 py-0.5 rounded font-mono text-[9px] font-bold tracking-[0.25em] text-accent-rust">
            CLASSIFIED // SECTION 007
          </div>

          {/* Row of 3 Outlined Tier Pills */}
          <div className="flex items-center gap-2.5">
            {(["FREE", "TEAM", "ENTERPRISE"] as const).map((tier) => {
              const isSelected = selectedTier === tier;
              return (
                <button
                  key={tier}
                  type="button"
                  onClick={() => setSelectedTier(selectedTier === tier ? null : tier)}
                  className={`px-3 py-1 text-[11px] font-mono uppercase tracking-wider rounded-full border transition-all duration-150 cursor-pointer select-none inline-flex items-center justify-center leading-none ${
                    isSelected
                      ? "bg-accent-contrast text-bg-canvas border-accent-contrast shadow-sm ring-1 ring-accent-contrast/20"
                      : "border-noir text-text-secondary bg-transparent hover:border-text-primary hover:text-text-primary hover:bg-text-primary/5 hover:-translate-y-0.5"
                  }`}
                  aria-pressed={isSelected}
                >
                  {tier}
                </button>
              );
            })}
          </div>
        </div>

        {/* 3, 4, 5. Headline, Tagline, Circular Swan Emblem, and Right Actions */}
        <div className="relative flex flex-col md:flex-row md:items-end justify-between gap-6 mb-7 z-10">
          {/* Left Block: Headline & Tagline */}
          <div className="flex flex-col">
            <div className="inline-flex items-center gap-3">
              <h1 className="font-display text-4xl sm:text-6xl md:text-7xl font-bold uppercase tracking-tight text-text-primary leading-none">
                Black Swan
              </h1>

              {/* Editorial / Cold War Classified Archival Ink Stamp */}
              <div
                className="inline-flex items-center justify-center rounded-full border border-dashed border-accent-rust/60 p-1.5 text-accent-rust -rotate-3 opacity-90 mix-blend-multiply dark:mix-blend-screen select-none transition-transform duration-300 hover:rotate-0 shrink-0"
                aria-label="Classified Archival Seal"
                title="Classified Archival Seal"
              >
                <BlackSwanLogo className="h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10 text-accent-rust" />
              </div>
            </div>

            {/* Small-Caps Tagline */}
            <div className="mt-2 font-body text-xs font-bold uppercase tracking-widest text-text-secondary">
              AI FINANCIAL INTELLIGENCE &amp; DECISION SYSTEM
            </div>
          </div>

          {/* Right Block: GET STARTED Button + Underlined SIGN IN Link */}
          <div className="flex items-center gap-6 self-start md:self-end">
            <Link
              href="/login?mode=signup&redirect=/workspace"
              className="inline-flex items-center justify-center rounded bg-accent-contrast px-7 py-2.5 font-body text-xs font-bold uppercase tracking-wider text-bg-canvas hover:opacity-90 transition-opacity shadow-none"
            >
              Get Started
            </Link>
            <Link
              href="/login?mode=signin&redirect=/workspace"
              className="font-body text-xs font-bold uppercase tracking-wider text-text-secondary underline underline-offset-4 hover:text-text-primary transition-colors cursor-pointer"
            >
              Sign In
            </Link>
          </div>
        </div>

        {/* 6. Full-Width Hero Image Panel with Interactive Cursor Magnet Distortion */}
        <div className="w-full rounded-lg border border-noir overflow-hidden shadow-none mb-6 bg-bg-surface z-10">
          <DitherDistortionImage
            src="/hero-illustration.jpg"
            alt="Black Swan Financial Intelligence - Vintage City Skyline at Night"
            className="w-full h-auto object-cover block"
            maxTilt={5}
            maxDistortion={12}
          />
        </div>

        {/* 7. Rounded Search-Style Input Bar */}
        <div className="w-full max-w-2xl px-3 mx-auto relative z-10">
          <form onSubmit={handleSearchSubmit} className="relative w-full">
            <div className="flex items-center w-full min-w-0 bg-[#0F0F0F] border border-neutral-800 rounded px-3 py-2.5">
              <Search className="h-4 w-4 text-neutral-500 shrink-0 mr-2.5 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Ask a question about your financial data..."
                className="min-w-0 flex-1 bg-transparent text-xs sm:text-sm text-neutral-200 placeholder-neutral-500 focus:outline-none"
              />
              <div className="shrink-0 ml-2 text-[10px] font-mono text-neutral-400 bg-neutral-900 border border-neutral-800 px-2 py-1 rounded select-none pointer-events-none">
                <span>[ENTER] RUN</span>
              </div>
            </div>
          </form>
        </div>
      </main>

      {/* 8. Bottom Telemetry Coordinates Footer */}
      <footer className="w-full pb-12 sm:pb-6 px-4 text-center relative z-10 mt-auto">
        <p className="text-[9px] sm:text-[10px] font-mono text-neutral-600 tracking-wider break-words">
          COORD: 51°29&apos;14&quot;N 0°07&apos;28&quot;W // CLEARANCE: TOP SECRET // VAUXHALL CROSS LONDON
        </p>
      </footer>

      {/* Docs Modal */}
      {isDocsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#12100e]/80 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-xl rounded-xl border border-noir bg-bg-surface p-6 shadow-2xl">
            <button
              onClick={() => setIsDocsOpen(false)}
              className="absolute right-4 top-4 text-text-secondary hover:text-text-primary cursor-pointer"
              aria-label="Close docs modal"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-2 mb-3">
              <span className="font-display text-xl font-bold uppercase tracking-tight text-text-primary">
                Black Swan Documentation
              </span>
            </div>
            <p className="font-body text-xs text-text-muted leading-relaxed mb-4">
              Black Swan is an autonomous, transparent AI financial decision assistant powered by a 4-agent FP&A team executing deterministic analytical workflows over local DuckDB engines.
            </p>
            <div className="space-y-3 mb-6 font-body text-xs">
              <div className="flex items-start gap-2.5 rounded border border-noir bg-bg-surface-subtle p-3">
                <Terminal className="h-4 w-4 text-text-secondary shrink-0 mt-0.5" />
                <div>
                  <strong className="text-text-primary font-bold">Agent M (Orchestrator):</strong> Decomposes inquiries into deterministic analysis plans.
                </div>
              </div>
              <div className="flex items-start gap-2.5 rounded border border-noir bg-bg-surface-subtle p-3">
                <Database className="h-4 w-4 text-text-secondary shrink-0 mt-0.5" />
                <div>
                  <strong className="text-text-primary font-bold">Agent Q (Data & Diagnostics):</strong> Executes sub-second SQL across in-memory DuckDB ledgers.
                </div>
              </div>
              <div className="flex items-start gap-2.5 rounded border border-noir bg-bg-surface-subtle p-3">
                <LineChart className="h-4 w-4 text-text-secondary shrink-0 mt-0.5" />
                <div>
                  <strong className="text-text-primary font-bold">Agent Eve (Audit & Viz):</strong> Compiles Recharts specifications and plain-language formula receipts.
                </div>
              </div>
              <div className="flex items-start gap-2.5 rounded border border-noir bg-bg-surface-subtle p-3">
                <Shield className="h-4 w-4 text-text-secondary shrink-0 mt-0.5" />
                <div>
                  <strong className="text-text-primary font-bold">Agent 007 (Strategy):</strong> Proposes executive remedial actions with bounded what-if sensitivity levers.
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setIsDocsOpen(false)}
                className="rounded border border-noir px-4 py-1.5 font-body text-xs font-bold uppercase tracking-wider text-text-secondary hover:text-text-primary hover:border-text-secondary cursor-pointer"
              >
                Close
              </button>
              <Link
                href="/workspace"
                className="rounded bg-accent-contrast px-4 py-1.5 font-body text-xs font-bold uppercase tracking-wider text-bg-canvas hover:opacity-90 transition-opacity"
              >
                Open Workspace
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Sign In Modal */}
      {isSignInOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#12100e]/80 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-sm rounded-xl border border-noir bg-bg-surface p-6 shadow-2xl">
            <button
              onClick={() => setIsSignInOpen(false)}
              className="absolute right-4 top-4 text-text-secondary hover:text-text-primary cursor-pointer"
              aria-label="Close sign in modal"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-2 mb-1">
              <Lock className="h-4 w-4 text-text-secondary" />
              <span className="font-display text-lg font-bold uppercase tracking-tight text-text-primary">
                Sign In to Black Swan
              </span>
            </div>
            <p className="font-body text-xs text-text-muted mb-4">
              Enter your corporate credentials to access the FP&A Intelligence Workspace.
            </p>
            <form onSubmit={handleSignInSubmit} className="space-y-3">
              <div>
                <label className="block font-body text-[11px] font-bold uppercase tracking-wider text-text-secondary mb-1">
                  Email
                </label>
                <input
                  type="email"
                  required
                  placeholder="analyst@firm.com"
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  className="w-full rounded border border-noir bg-bg-surface-subtle px-3 py-2 font-body text-xs text-text-primary focus:border-text-secondary focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-body text-[11px] font-bold uppercase tracking-wider text-text-secondary mb-1">
                  Password
                </label>
                <input
                  type="password"
                  required
                  placeholder="••••••••••••"
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  className="w-full rounded border border-noir bg-bg-surface-subtle px-3 py-2 font-body text-xs text-text-primary focus:border-text-secondary focus:outline-none"
                />
              </div>
              <button
                type="submit"
                className="w-full rounded bg-accent-contrast py-2.5 font-body text-xs font-bold uppercase tracking-wider text-bg-canvas hover:opacity-90 transition-opacity mt-2 cursor-pointer"
              >
                Sign In & Enter Workspace
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
