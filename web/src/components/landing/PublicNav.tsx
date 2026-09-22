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
    <nav className="w-full border-b border-noir bg-bg-canvas/95 px-6 py-3.5 sm:px-10 backdrop-blur-sm transition-colors duration-200">
      <div className="mx-auto flex max-w-6xl items-center justify-between">
        {/* Left: Exact Swan Logo Mark */}
        <Link href="/" className="flex items-center gap-2 group">
          <BlackSwanLogo className="w-7 h-7 text-text-primary transition-colors" />
        </Link>

        {/* Center: Navigation Links (All text aligned along exact optical baseline) */}
        <div className="flex items-center gap-6 sm:gap-8 font-body text-xs font-bold uppercase tracking-widest">
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
            className="hidden sm:inline-flex items-center h-8 leading-none pb-0.5 border-b-2 border-transparent text-text-secondary hover:text-text-primary hover:border-noir transition-colors"
          >
            Community
          </a>
        </div>

        {/* Right: Theme Toggle & NEW REPORT Primary Button */}
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Link
            href="/workspace"
            className="inline-flex h-8 items-center justify-center rounded bg-accent-contrast px-5 font-body text-xs font-bold uppercase tracking-wider text-bg-canvas hover:opacity-90 transition-opacity shadow-none"
          >
            New Report
          </Link>
        </div>
      </div>
    </nav>
  );
};
