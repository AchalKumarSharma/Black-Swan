"use client";

import Link from "next/link";
import { ChevronDown, FileText, User } from "lucide-react";

interface TopHeaderProps {
  isSystemLive?: boolean;
}

export const TopHeader: React.FC<TopHeaderProps> = ({ isSystemLive = true }) => {
  return (
    <header className="sticky top-0 z-30 flex h-16 w-full shrink-0 items-center justify-between border-b border-swan-sepia/30 bg-parchment/95 px-6 backdrop-blur-sm">
      {/* Left: Brand Identity & Mode Tag */}
      <div className="flex items-center gap-4">
        {/* Swan Silhouette Mark + Brand Name matching Landing Page */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <img
            src="/swan-logo-clean.png"
            alt="Black Swan"
            className="h-8 w-8 object-contain"
          />
          <span className="font-serif text-2xl font-bold tracking-tight text-swan-black">
            Black Swan
          </span>
        </Link>

        {/* Small-Caps Outlined Mode Pill */}
        <div className="hidden sm:inline-flex items-center rounded-full border border-swan-sepia/50 px-2.5 py-0.5 font-sans text-[10px] font-semibold uppercase tracking-widest text-swan-sepia">
          FINANCE INTELLIGENCE
        </div>
      </div>

      {/* Middle: Workspace Selector & Dataset Details */}
      <div className="hidden md:flex items-center gap-3">
        <div className="flex items-center gap-2 rounded-md border border-swan-sepia/40 bg-parchment-light px-3 py-1.5 text-xs text-swan-black">
          <span className="font-medium">Default Workspace</span>
          <span className="text-swan-sepia/60">/</span>
          <span className="font-mono text-[11px] text-swan-charcoal">
            SaaS_Q2_Financials.csv
          </span>
          <span className="font-sans text-[11px] text-swan-sepia">
            • 12,450 rows
          </span>
          <ChevronDown className="h-3.5 w-3.5 text-swan-sepia ml-1" />
        </div>
      </div>

      {/* Right Utility Bar */}
      <div className="flex items-center gap-4">
        {/* Status Indicator */}
        <div className="flex items-center gap-2 text-xs font-sans uppercase tracking-wider text-swan-sepia">
          <span
            className={`inline-block h-2 w-2 rounded-full border border-swan-sepia ${
              isSystemLive ? "bg-swan-sepia" : "bg-transparent"
            }`}
            title={isSystemLive ? "Engine Ready" : "Idle"}
          />
          <span className="hidden sm:inline text-[11px]">
            {isSystemLive ? "Live" : "Idle"}
          </span>
        </div>

        {/* Documentation Link */}
        <Link
          href="/docs"
          className="flex items-center gap-1.5 text-xs font-sans uppercase tracking-wider text-swan-sepia hover:text-swan-black transition-colors"
        >
          <FileText className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Docs</span>
        </Link>

        {/* User Avatar Button */}
        <button
          className="flex h-8 w-8 items-center justify-center rounded-full border border-swan-sepia/50 bg-parchment-light text-swan-sepia hover:border-swan-black hover:text-swan-black transition-colors"
          aria-label="User profile"
        >
          <User className="h-4 w-4 text-swan-sepia" />
        </button>
      </div>
    </header>
  );
};
