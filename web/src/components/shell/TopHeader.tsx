"use client";

import Link from "next/link";
import { ChevronDown, FileText, User } from "lucide-react";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { BlackSwanLogo } from "@/components/ui/BlackSwanLogo";

interface TopHeaderProps {
  isSystemLive?: boolean;
}

export const TopHeader: React.FC<TopHeaderProps> = ({ isSystemLive = true }) => {
  return (
    <header className="sticky top-0 z-30 flex h-16 w-full shrink-0 items-center justify-between border-b border-noir bg-bg-canvas/95 px-6 backdrop-blur-sm transition-colors duration-200">
      {/* Left: Brand Identity & Mode Tag */}
      <div className="flex items-center gap-4">
        {/* Swan Silhouette Mark + Brand Name matching Landing Page */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <BlackSwanLogo className="w-7 h-7 text-text-primary transition-colors" />
          <span className="font-serif text-2xl font-bold tracking-tight text-text-primary">
            Black Swan
          </span>
        </Link>

        {/* Small-Caps Outlined Mode Pill */}
        <div className="hidden sm:inline-flex items-center rounded-full border border-noir px-2.5 py-0.5 font-sans text-[10px] font-semibold uppercase tracking-widest text-text-secondary">
          FINANCE INTELLIGENCE
        </div>
      </div>

      {/* Middle: Workspace Selector & Dataset Details */}
      <div className="hidden md:flex items-center gap-3">
        <div className="flex items-center gap-2 rounded-md border border-noir bg-bg-surface px-3 py-1.5 text-xs text-text-primary">
          <span className="font-medium">Default Workspace</span>
          <span className="text-text-secondary/60">/</span>
          <span className="font-mono text-[11px] text-text-muted">
            SaaS_Q2_Financials.csv
          </span>
          <span className="font-sans text-[11px] text-text-secondary">
            • 12,450 rows
          </span>
          <ChevronDown className="h-3.5 w-3.5 text-text-secondary ml-1" />
        </div>
      </div>

      {/* Right Utility Bar */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Obsidian Vault / Parchment Mode Toggle */}
        <ThemeToggle />

        {/* Status Indicator */}
        <div className="flex items-center gap-2 text-xs font-sans uppercase tracking-wider text-text-secondary">
          <span
            className={`inline-block h-2 w-2 rounded-full border border-text-secondary ${
              isSystemLive ? "bg-text-secondary" : "bg-transparent"
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
          className="flex items-center gap-1.5 text-xs font-sans uppercase tracking-wider text-text-secondary hover:text-text-primary transition-colors"
        >
          <FileText className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Docs</span>
        </Link>

        {/* User Avatar Button */}
        <button
          className="flex h-8 w-8 items-center justify-center rounded-full border border-noir bg-bg-surface text-text-secondary hover:border-text-primary hover:text-text-primary transition-colors"
          aria-label="User profile"
        >
          <User className="h-4 w-4 text-text-secondary" />
        </button>
      </div>
    </header>
  );
};
