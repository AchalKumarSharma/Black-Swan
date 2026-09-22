import React from "react";
import Link from "next/link";
import { PublicNav } from "@/components/landing/PublicNav";
import { Lock, ArrowRight } from "lucide-react";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-parchment text-swan-black selection:bg-swan-black selection:text-parchment flex flex-col">
      <PublicNav />
      <main className="mx-auto w-full max-w-md px-6 py-16 flex-1 flex flex-col justify-center">
        <div className="rounded-xl border border-swan-sepia bg-parchment-light p-8 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <Lock className="h-5 w-5 text-swan-sepia" />
            <h1 className="font-serif text-2xl font-bold text-swan-black">
              Sign In to Black Swan
            </h1>
          </div>
          <p className="font-sans text-xs text-swan-charcoal mb-6">
            Enter your corporate credentials to access the FP&A Intelligence Workspace.
          </p>

          <form action="/workspace" className="space-y-4">
            <div>
              <label className="block font-sans text-[11px] font-semibold uppercase tracking-wider text-swan-sepia mb-1">
                Corporate Email
              </label>
              <input
                type="email"
                defaultValue="analyst@firm.com"
                required
                className="w-full rounded border border-swan-sepia/60 bg-parchment px-3 py-2 font-sans text-xs text-swan-black focus:border-swan-sepia focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-sans text-[11px] font-semibold uppercase tracking-wider text-swan-sepia mb-1">
                Password
              </label>
              <input
                type="password"
                defaultValue="••••••••••••"
                required
                className="w-full rounded border border-swan-sepia/60 bg-parchment px-3 py-2 font-sans text-xs text-swan-black focus:border-swan-sepia focus:outline-none"
              />
            </div>
            <button
              type="submit"
              className="w-full inline-flex items-center justify-center gap-2 rounded bg-swan-black py-2.5 font-sans text-xs font-semibold uppercase tracking-wider text-parchment hover:bg-swan-charcoal transition-colors mt-2"
            >
              <span>Authenticate & Enter</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-swan-sepia/30 text-center">
            <Link
              href="/"
              className="font-sans text-xs text-swan-sepia hover:text-swan-black underline underline-offset-4"
            >
              ← Return to Home
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
