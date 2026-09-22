"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PublicNav } from "@/components/landing/PublicNav";
import { Search, X, Shield, Database, LineChart, Terminal, Lock } from "lucide-react";

import { DitherDistortionImage } from "@/components/ui/DitherDistortionImage";

export default function LandingPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [isDocsOpen, setIsDocsOpen] = useState(false);
  const [isSignInOpen, setIsSignInOpen] = useState(false);
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/workspace?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push("/workspace");
    }
  };

  const handleSignInSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSignInOpen(false);
    router.push("/workspace");
  };

  return (
    <div className="min-h-screen bg-parchment text-swan-black selection:bg-swan-black selection:text-parchment flex flex-col relative overflow-x-hidden">
      {/* 1. Top Navigation */}
      <PublicNav onOpenDocs={() => setIsDocsOpen(true)} />

      {/* Main Container matching the reference layout */}
      <main className="mx-auto w-full max-w-6xl px-6 sm:px-10 py-7 md:py-9 flex-1 flex flex-col justify-start relative">
        {/* Cold War MI6 Cryptographic Radar Sweep & Cipher Strip Watermark (Top Right) */}
        <div className="pointer-events-none select-none absolute right-4 sm:right-10 top-6 overflow-hidden opacity-[0.11] mix-blend-multiply hidden md:block w-72 h-44 z-0">
          <svg viewBox="0 0 280 180" className="w-full h-full text-swan-sepia stroke-current fill-none">
            {/* Radar range rings */}
            <circle cx="200" cy="90" r="75" strokeWidth="0.75" />
            <circle cx="200" cy="90" r="50" strokeWidth="0.5" strokeDasharray="3 3" />
            <circle cx="200" cy="90" r="25" strokeWidth="0.5" />
            <line x1="125" y1="90" x2="275" y2="90" strokeWidth="0.5" />
            <line x1="200" y1="15" x2="200" y2="165" strokeWidth="0.5" />
            <line x1="200" y1="90" x2="255" y2="35" strokeWidth="1" />
            {/* Coordinate & cipher annotations */}
            <text x="120" y="24" fill="#6b4d3a" stroke="none" className="font-mono text-[8px] tracking-[0.2em]">LAT 51°30'26"N LON 00°07'39"W</text>
            <text x="120" y="36" fill="#6b4d3a" stroke="none" className="font-mono text-[8px] tracking-[0.2em]">CIPHER // 8F-7B-2A // Q-KERNEL</text>
            <text x="120" y="48" fill="#6b4d3a" stroke="none" className="font-mono text-[8px] tracking-[0.2em]">CLEARANCE: MI6 EYES ONLY</text>
          </svg>
        </div>

        {/* 2. Row of 3 Outlined Pill Tags with classified watermark stamp */}
        <div className="relative flex items-center gap-2.5 mb-3 z-10">
          {/* Subtle Top-Secret Stamp Watermark */}
          <div className="pointer-events-none select-none absolute -left-2 -top-1.5 opacity-[0.14] -rotate-3 border border-dashed border-[#8c432a] px-2 py-0.5 rounded font-mono text-[9px] font-bold tracking-[0.25em] text-[#8c432a]">
            CLASSIFIED // SECTION 007
          </div>
          {["FREE", "TEAM", "ENTERPRISE"].map((tag) => (
            <span
              key={tag}
              className="h-6 px-3.5 inline-flex items-center justify-center text-center leading-none rounded-full border border-swan-sepia/80 font-sans text-[10px] font-semibold uppercase tracking-widest text-swan-sepia bg-transparent backdrop-blur-xs"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* 3, 4, 5. Headline, Tagline, Circular Swan Emblem, and Right Actions */}
        <div className="relative flex flex-col md:flex-row md:items-end justify-between gap-6 mb-7 z-10">
          {/* Left Block: Headline & Tagline */}
          <div className="flex flex-col">
            <div className="flex items-center gap-3.5">
              <h1 className="font-serif text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight text-swan-black">
                Black Swan
              </h1>

              {/* Exact Circular Sepia-Outlined Swan Icon from Reference */}
              <img
                src="/swan-emblem-circle.png"
                alt="Black Swan Emblem"
                className="h-11 w-11 sm:h-13 sm:w-13 md:h-14 md:w-14 object-contain rounded-full"
              />
            </div>

            {/* Small-Caps Tagline */}
            <div className="mt-2 font-sans text-xs font-semibold uppercase tracking-widest text-swan-sepia">
              AI FINANCIAL INTELLIGENCE &amp; DECISION SYSTEM
            </div>
          </div>

          {/* Right Block: GET STARTED Button + Underlined SIGN IN Link */}
          <div className="flex items-center gap-6 self-start md:self-end">
            <Link
              href="/workspace"
              className="inline-flex items-center justify-center rounded bg-swan-black px-7 py-2.5 font-sans text-xs font-semibold uppercase tracking-wider text-parchment hover:bg-swan-charcoal transition-colors shadow-none"
            >
              Get Started
            </Link>
            <button
              type="button"
              onClick={() => setIsSignInOpen(true)}
              className="font-sans text-xs font-semibold uppercase tracking-wider text-swan-sepia underline underline-offset-4 hover:text-swan-black transition-colors cursor-pointer"
            >
              Sign In
            </button>
          </div>
        </div>

        {/* 6. Full-Width Hero Image Panel with Interactive Cursor Magnet Distortion */}
        <div className="w-full rounded-lg border border-swan-sepia/40 overflow-hidden shadow-none mb-6 bg-[#1a1613] z-10">
          <DitherDistortionImage
            src="/hero-illustration.jpg"
            alt="Black Swan Financial Intelligence - Vintage City Skyline at Night"
            className="w-full h-auto object-cover block"
            maxTilt={5}
            maxDistortion={12}
          />
        </div>

        {/* 7. Rounded Search-Style Input Bar with Halftone Dossier Framing */}
        <div className="relative w-full z-10">
          {/* Subtle Halftone Dossier Background Texture */}
          <div
            className="pointer-events-none select-none absolute -inset-2 opacity-[0.06] rounded-xl border border-dashed border-swan-sepia"
            style={{
              backgroundImage: "radial-gradient(circle, #6b4d3a 1px, transparent 1px)",
              backgroundSize: "8px 8px",
            }}
          />

          <form onSubmit={handleSearchSubmit} className="relative w-full">
            <div className="relative flex items-center w-full rounded-lg border border-swan-sepia/60 bg-parchment/75 hover:border-swan-sepia transition-colors shadow-none">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-swan-sepia pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Ask a question about your financial data..."
                className="w-full bg-transparent pl-11 pr-4 py-3.5 font-sans text-sm text-swan-black placeholder:text-swan-sepia/75 focus:outline-none"
              />
              <div className="hidden sm:flex items-center gap-2 pr-3 pointer-events-none text-[10px] font-mono uppercase tracking-wider text-swan-sepia/60">
                <span>[ENTER] RUN</span>
              </div>
            </div>
          </form>
        </div>
      </main>

      {/* Docs Modal */}
      {isDocsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-swan-black/60 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-xl rounded-xl border border-swan-sepia bg-parchment p-6 shadow-2xl">
            <button
              onClick={() => setIsDocsOpen(false)}
              className="absolute right-4 top-4 text-swan-sepia hover:text-swan-black"
              aria-label="Close docs modal"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-2 mb-3">
              <span className="font-serif text-xl font-bold text-swan-black">
                Black Swan Documentation
              </span>
            </div>
            <p className="font-sans text-xs text-swan-charcoal leading-relaxed mb-4">
              Black Swan is an autonomous, transparent AI financial decision assistant powered by a 4-agent FP&A team executing deterministic analytical workflows over local DuckDB engines.
            </p>
            <div className="space-y-3 mb-6 font-sans text-xs">
              <div className="flex items-start gap-2.5 rounded border border-swan-sepia/30 bg-parchment-light p-3">
                <Terminal className="h-4 w-4 text-swan-sepia shrink-0 mt-0.5" />
                <div>
                  <strong className="text-swan-black">Agent M (Orchestrator):</strong> Decomposes inquiries into deterministic analysis plans.
                </div>
              </div>
              <div className="flex items-start gap-2.5 rounded border border-swan-sepia/30 bg-parchment-light p-3">
                <Database className="h-4 w-4 text-swan-sepia shrink-0 mt-0.5" />
                <div>
                  <strong className="text-swan-black">Agent Q (Data & Diagnostics):</strong> Executes sub-second SQL across in-memory DuckDB ledgers.
                </div>
              </div>
              <div className="flex items-start gap-2.5 rounded border border-swan-sepia/30 bg-parchment-light p-3">
                <LineChart className="h-4 w-4 text-swan-sepia shrink-0 mt-0.5" />
                <div>
                  <strong className="text-swan-black">Agent Eve (Audit & Viz):</strong> Compiles Recharts specifications and plain-language formula receipts.
                </div>
              </div>
              <div className="flex items-start gap-2.5 rounded border border-swan-sepia/30 bg-parchment-light p-3">
                <Shield className="h-4 w-4 text-swan-sepia shrink-0 mt-0.5" />
                <div>
                  <strong className="text-swan-black">Agent 007 (Strategy):</strong> Proposes executive remedial actions with bounded what-if sensitivity levers.
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setIsDocsOpen(false)}
                className="rounded border border-swan-sepia/50 px-4 py-1.5 font-sans text-xs uppercase tracking-wider text-swan-charcoal hover:border-swan-black"
              >
                Close
              </button>
              <Link
                href="/workspace"
                className="rounded bg-swan-black px-4 py-1.5 font-sans text-xs font-semibold uppercase tracking-wider text-parchment hover:bg-swan-charcoal"
              >
                Open Workspace
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Sign In Modal */}
      {isSignInOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-swan-black/60 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-sm rounded-xl border border-swan-sepia bg-parchment p-6 shadow-2xl">
            <button
              onClick={() => setIsSignInOpen(false)}
              className="absolute right-4 top-4 text-swan-sepia hover:text-swan-black"
              aria-label="Close sign in modal"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-2 mb-1">
              <Lock className="h-4 w-4 text-swan-sepia" />
              <span className="font-serif text-lg font-bold text-swan-black">
                Sign In to Black Swan
              </span>
            </div>
            <p className="font-sans text-xs text-swan-charcoal mb-4">
              Enter your corporate credentials to access the FP&A Intelligence Workspace.
            </p>
            <form onSubmit={handleSignInSubmit} className="space-y-3">
              <div>
                <label className="block font-sans text-[11px] font-semibold uppercase tracking-wider text-swan-sepia mb-1">
                  Email
                </label>
                <input
                  type="email"
                  required
                  placeholder="analyst@firm.com"
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  className="w-full rounded border border-swan-sepia/60 bg-parchment-light px-3 py-2 font-sans text-xs text-swan-black focus:border-swan-sepia focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-sans text-[11px] font-semibold uppercase tracking-wider text-swan-sepia mb-1">
                  Password
                </label>
                <input
                  type="password"
                  required
                  placeholder="••••••••••••"
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  className="w-full rounded border border-swan-sepia/60 bg-parchment-light px-3 py-2 font-sans text-xs text-swan-black focus:border-swan-sepia focus:outline-none"
                />
              </div>
              <button
                type="submit"
                className="w-full rounded bg-swan-black py-2.5 font-sans text-xs font-semibold uppercase tracking-wider text-parchment hover:bg-swan-charcoal transition-colors mt-2"
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
