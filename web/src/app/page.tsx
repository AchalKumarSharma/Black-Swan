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
  const [modalMode, setModalMode] = useState<"signin" | "signup">("signin");
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
      <nav className="relative z-50 w-full border-b border-noir bg-bg-canvas/85 backdrop-blur-md px-4 sm:px-8 py-3.5 transition-colors duration-200">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          {/* Left: Brand Logo */}
          <Link href="/" className="flex items-center gap-2 group cursor-pointer">
            <BlackSwanLogo className="w-6 h-6 text-text-primary transition-transform group-hover:scale-105" />
            <span className="font-mono text-xs font-bold uppercase tracking-widest text-text-primary">
              Black Swan
            </span>
          </Link>

          {/* Center: Primary Navigation Cluster (Equalized py-1 and border-b for perfect vertical alignment) */}
          <div className="hidden md:flex items-center gap-8 font-mono text-xs uppercase tracking-wider">
            {/* Home (Active Indicator) */}
            <Link
              href="/"
              onClick={(e) => {
                e.preventDefault();
                window.scrollTo(0, 0);
              }}
              className="inline-flex items-center py-1 border-b border-text-primary text-text-primary transition-colors cursor-pointer"
            >
              HOME
            </Link>

            {/* Reports (Triggers Sign In Modal instead of 404) */}
            <button
              type="button"
              onClick={() => setIsSignInOpen(true)}
              className="inline-flex items-center py-1 border-b border-transparent text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
            >
              REPORTS
            </button>

            {/* Docs */}
            <button
              type="button"
              onClick={() => setIsDocsOpen(true)}
              className="inline-flex items-center py-1 border-b border-transparent text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
            >
              DOCS
            </button>

            {/* Sign In */}
            <button
              type="button"
              onClick={() => setIsSignInOpen(true)}
              className="inline-flex items-center py-1 border-b border-transparent text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
            >
              SIGN IN
            </button>

            {/* Community */}
            <a
              href="https://github.com"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center py-1 border-b border-transparent text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
            >
              COMMUNITY
            </a>
          </div>

          {/* Right: Actions & Theme Controls */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:inline-flex">
              <ThemeToggle />
            </div>
            {/* New Report (Triggers Sign In Modal before granting workspace access) */}
            <button
              type="button"
              onClick={() => setIsSignInOpen(true)}
              className="inline-flex items-center justify-center px-3.5 py-1.5 text-xs font-mono font-medium uppercase tracking-wider rounded border border-noir bg-text-primary text-bg-canvas hover:opacity-90 transition-opacity shadow-none cursor-pointer"
            >
              NEW REPORT
            </button>
          </div>
        </div>
      </nav>

      {/* MI6 / James Bond Cold War Archival Intelligence Dossier Watermark */}
      <JamesBondArchivalWatermark />

      {/* Main Container matching the reference layout */}
      <main className="mx-auto w-full max-w-6xl px-3.5 sm:px-10 pt-6 sm:pt-7 md:pt-9 pb-6 sm:pb-8 flex-1 flex flex-col justify-start relative z-10">

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
            <button
              type="button"
              onClick={() => setIsSignInOpen(true)}
              className="text-xs font-mono uppercase tracking-wider text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
            >
              Sign In
            </button>
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

        {/* 7. Rounded Search-Style Input Bar with Halftone Dossier Framing */}
        <div className="w-full max-w-4xl mx-auto px-3 sm:px-4 min-w-0 relative z-10">
          <div
            className="pointer-events-none select-none absolute -inset-2 opacity-[0.08] rounded-xl border border-dashed border-noir"
            style={{
              backgroundImage: "radial-gradient(circle, var(--text-secondary) 1px, transparent 1px)",
              backgroundSize: "8px 8px",
              mixBlendMode: "var(--dither-blend)" as any,
            }}
          />
          <form onSubmit={handleSearchSubmit} className="relative w-full">
            <div className="relative flex items-center w-full rounded-lg border border-noir bg-bg-surface/75 hover:border-text-secondary transition-colors shadow-none backdrop-blur-xs">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary pointer-events-none"/>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Ask a question about your financial data..."
                className="w-full bg-transparent pl-11 pr-24 py-3.5 font-body text-sm text-text-primary placeholder:text-text-secondary/70 focus:outline-none"
              />
              <button
                type="submit"
                className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center px-2 py-1 text-[10px] font-mono uppercase tracking-wider text-text-secondary/90 bg-bg-canvas/80 border border-noir rounded cursor-pointer hover:text-text-primary hover:border-text-secondary transition-colors"
              >
                [ENTER] RUN
              </button>
            </div>
          </form>
        </div>
      </main>


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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-md bg-[#0b0907] border border-[#2a221b] rounded-lg p-6 sm:p-8 shadow-2xl overflow-hidden">
            {/* Background Ambient Glow */}
            <div
              className="pointer-events-none absolute inset-0 select-none opacity-40"
              style={{
                background: "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(184, 155, 130, 0.08) 0%, rgba(12, 10, 8, 0) 70%)"
              }}
            />

            {/* Top Close Button */}
            <button
              type="button"
              onClick={() => setIsSignInOpen(false)}
              className="absolute top-5 right-5 text-[#8c7b6e] hover:text-[#f2ede4] transition-colors cursor-pointer text-lg leading-none"
            >
              ✕
            </button>

            {/* Header Badge */}
            <div className="inline-block mb-3 px-2 py-0.5 border border-[#2a221b] bg-[#13100d] rounded text-[10px] font-mono tracking-wider text-[#b89b82] uppercase">
              AGENTIC AI FINANCIAL INTELLIGENCE
            </div>

            {/* Dynamic Title & Subtitle */}
            <h2 className="font-mono text-2xl font-bold tracking-tight text-[#f2ede4] uppercase mb-1">
              {modalMode === "signup" ? "WELCOME!" : "WELCOME BACK!"}
            </h2>
            <p className="font-mono text-xs text-[#8c7b6e] mb-6">
              Verify corporate credentials to access workspace ledger.
            </p>

            {/* Tabs */}
            <div className="flex items-center gap-4 border-b border-[#221c17] pb-3 mb-6 font-mono text-xs tracking-wider">
              <button
                type="button"
                onClick={() => setModalMode("signin")}
                className={`cursor-pointer transition-colors pb-1 ${
                  modalMode === "signin"
                    ? "text-[#f2ede4] border-b-2 border-[#d97746]"
                    : "text-[#8c7b6e] hover:text-[#f2ede4]"
                }`}
              >
                [ SIGN IN ]
              </button>
              <button
                type="button"
                onClick={() => setModalMode("signup")}
                className={`cursor-pointer transition-colors pb-1 ${
                  modalMode === "signup"
                    ? "text-[#f2ede4] border-b-2 border-[#d97746]"
                    : "text-[#8c7b6e] hover:text-[#f2ede4]"
                }`}
              >
                [ SIGN UP ]
              </button>
            </div>

            {/* Form Fields */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                window.location.href = "/workspace";
              }}
              className="space-y-4"
            >
              {modalMode === "signup" && (
                <div>
                  <label className="block font-mono text-[10px] uppercase tracking-wider text-[#8c7b6e] mb-1.5">
                    Organization / Firm
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Apex Strategic Partners"
                    className="w-full bg-[#13100d] border border-[#2a221b] text-[#f2ede4] font-mono text-xs px-3.5 py-2.5 rounded placeholder-[#8c7b6e]/50 focus:border-[#b89b82]/60 focus:outline-none transition-colors"
                  />
                </div>
              )}

              <div>
                <label className="block font-mono text-[10px] uppercase tracking-wider text-[#8c7b6e] mb-1.5">
                  Work Email
                </label>
                <input
                  type="email"
                  defaultValue="analyst@firm.com"
                  className="w-full bg-[#13100d] border border-[#2a221b] text-[#f2ede4] font-mono text-xs px-3.5 py-2.5 rounded placeholder-[#8c7b6e]/50 focus:border-[#b89b82]/60 focus:outline-none transition-colors"
                  required
                />
              </div>

              <div>
                <label className="block font-mono text-[10px] uppercase tracking-wider text-[#8c7b6e] mb-1.5">
                  Security Key / Password
                </label>
                <input
                  type="password"
                  defaultValue="••••••••••••"
                  className="w-full bg-[#13100d] border border-[#2a221b] text-[#f2ede4] font-mono text-xs px-3.5 py-2.5 rounded placeholder-[#8c7b6e]/50 focus:border-[#b89b82]/60 focus:outline-none transition-colors"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full mt-2 bg-[#1c1612] hover:bg-[#251e18] text-[#f2ede4] border border-[#3d3126] hover:border-[#b89b82]/40 font-mono text-xs tracking-widest py-3 rounded uppercase transition-colors cursor-pointer"
              >
                {modalMode === "signup" ? "CREATE ACCOUNT →" : "AUTHENTICATE →"}
              </button>
            </form>

            {/* Guest Sandbox Link */}
            <div className="mt-6 text-center">
              <Link
                href="/workspace"
                onClick={() => setIsSignInOpen(false)}
                className="font-mono text-xs text-[#8c7b6e] hover:text-[#f2ede4] transition-colors"
              >
                [ Continue via Guest Sandbox → ]
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
