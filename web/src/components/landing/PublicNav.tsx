"use client";

import React from "react";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { BlackSwanLogo } from "@/components/ui/BlackSwanLogo";

interface PublicNavProps {
  onOpenDocs?: () => void;
}

export const PublicNav: React.FC<PublicNavProps> = ({ onOpenDocs }) => {
  return (
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
            href="/workspace?view=reports"
            className="inline-flex items-center h-8 leading-none pb-0.5 border-b-2 border-transparent text-text-secondary hover:text-text-primary hover:border-noir transition-colors"
          >
            Reports
          </Link>
          {onOpenDocs ? (
            <button
              type="button"
              onClick={onOpenDocs}
              className="inline-flex items-center h-8 leading-none pb-0.5 border-b-2 border-transparent text-text-secondary hover:text-text-primary hover:border-noir uppercase font-bold text-xs tracking-widest transition-colors cursor-pointer"
            >
              Docs
            </button>
          ) : (
            <Link
              href="/docs"
              className="inline-flex items-center h-8 leading-none pb-0.5 border-b-2 border-transparent text-text-secondary hover:text-text-primary hover:border-noir transition-colors"
            >
              Docs
            </Link>
          )}
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
            href="/workspace"
            className="inline-flex items-center justify-center rounded bg-accent-contrast px-3 py-1.5 text-xs font-mono font-bold uppercase tracking-wider text-bg-canvas hover:opacity-90 transition-opacity shadow-none whitespace-nowrap"
          >
            New Report
          </Link>
        </div>
      </div>
    </nav>
  );
};
