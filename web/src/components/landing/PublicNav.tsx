"use client";

import React from "react";
import Link from "next/link";

interface PublicNavProps {
  onOpenDocs?: () => void;
}

export const PublicNav: React.FC<PublicNavProps> = ({ onOpenDocs }) => {
  return (
    <nav className="w-full border-b border-swan-sepia/30 bg-parchment px-6 py-3.5 sm:px-10">
      <div className="mx-auto flex max-w-6xl items-center justify-between">
        {/* Left: Exact Swan Logo Mark */}
        <Link href="/" className="flex items-center gap-2 group">
          <img
            src="/swan-logo-clean.png"
            alt="Black Swan"
            className="h-8 w-8 object-contain"
          />
        </Link>

        {/* Center: Navigation Links (All text aligned along exact optical baseline) */}
        <div className="flex items-center gap-8 font-sans text-xs font-semibold uppercase tracking-widest">
          <Link
            href="/"
            onClick={() => {
              if (typeof window !== "undefined") {
                window.scrollTo({ top: 0, behavior: "smooth" });
              }
            }}
            className="inline-flex items-center h-8 leading-none pb-0.5 border-b-2 border-swan-black text-swan-black transition-colors"
          >
            Home
          </Link>
          <Link
            href="/workspace?view=reports"
            className="inline-flex items-center h-8 leading-none pb-0.5 border-b-2 border-transparent text-swan-charcoal hover:text-swan-black hover:border-swan-sepia/40 transition-colors"
          >
            Reports
          </Link>
          {onOpenDocs ? (
            <button
              type="button"
              onClick={onOpenDocs}
              className="inline-flex items-center h-8 leading-none pb-0.5 border-b-2 border-transparent text-swan-charcoal hover:text-swan-black hover:border-swan-sepia/40 uppercase font-semibold text-xs tracking-widest transition-colors cursor-pointer"
            >
              Docs
            </button>
          ) : (
            <Link
              href="/docs"
              className="inline-flex items-center h-8 leading-none pb-0.5 border-b-2 border-transparent text-swan-charcoal hover:text-swan-black hover:border-swan-sepia/40 transition-colors"
            >
              Docs
            </Link>
          )}
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center h-8 leading-none pb-0.5 border-b-2 border-transparent text-swan-charcoal hover:text-swan-black hover:border-swan-sepia/40 transition-colors"
          >
            Community
          </a>
        </div>

        {/* Right: NEW REPORT Primary Button */}
        <div className="flex items-center">
          <Link
            href="/workspace"
            className="inline-flex h-8 items-center justify-center rounded bg-swan-black px-5 font-sans text-xs font-semibold uppercase tracking-wider text-parchment hover:bg-swan-charcoal transition-colors shadow-none"
          >
            New Report
          </Link>
        </div>
      </div>
    </nav>
  );
};
