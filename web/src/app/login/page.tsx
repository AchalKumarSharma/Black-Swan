"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { BlackSwanLogo } from "@/components/ui/BlackSwanLogo";
import { DitherDistortionImage } from "@/components/ui/DitherDistortionImage";
import { AlertCircle, CheckCircle2 } from "lucide-react";

function LoginTerminal() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawRedirect = searchParams.get("redirect") || "/workspace";
  const redirectTarget = rawRedirect.startsWith("/") ? rawRedirect : "/workspace";

  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [organization, setOrganization] = useState("");
  const [email, setEmail] = useState("analyst@firm.com");
  const [password, setPassword] = useState("••••••••••••");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);

  // Guest Sandbox Clearance (Zero-Lockout)
  const handleGuestClearance = () => {
    document.cookie =
      "bs_clearance_level=1; path=/; max-age=86400; SameSite=Lax";

    try {
      if (supabase && typeof supabase.auth?.signInAnonymously === "function") {
        supabase.auth.signInAnonymously().catch(() => {});
      }
    } catch {
      // Non-blocking
    }

    router.push(redirectTarget);
  };

  // Submit Sign In or Request Clearance
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);
    setInfoMsg(null);

    if (mode === "signin") {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          setErrorMsg(error.message);
          setIsLoading(false);
          return;
        }

        if (data?.session) {
          document.cookie =
            "bs_clearance_level=1; path=/; max-age=86400; SameSite=Lax";
          router.push(redirectTarget);
        } else {
          setErrorMsg("Authentication failed. Use Guest Sandbox Clearance to proceed.");
          setIsLoading(false);
        }
      } catch (err: unknown) {
        const message =
          err instanceof Error
            ? err.message
            : "Authentication service offline. Continue via Guest Sandbox Clearance.";
        setErrorMsg(message);
        setIsLoading(false);
      }
    } else {
      // Sign Up / Request Clearance
      try {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              organization: organization.trim() || "Independent FP&A",
            },
          },
        });

        if (error) {
          setErrorMsg(error.message);
          setIsLoading(false);
          return;
        }

        if (data?.session) {
          document.cookie =
            "bs_clearance_level=1; path=/; max-age=86400; SameSite=Lax";
          router.push(redirectTarget);
        } else {
          setInfoMsg(
            "Clearance credentials created. Please verify via email or sign in."
          );
          setIsLoading(false);
        }
      } catch (err: unknown) {
        const message =
          err instanceof Error
            ? err.message
            : "Registration service offline. Use Guest Sandbox Clearance.";
        setErrorMsg(message);
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="w-full max-w-md">
      {/* Mobile-only brand badge */}
      <div className="lg:hidden flex items-center justify-center gap-2.5 mb-8">
        <BlackSwanLogo className="w-6 h-6 text-white" />
        <span className="font-mono text-xs tracking-widest text-neutral-300 uppercase font-bold">
          BLACK SWAN
        </span>
      </div>

      {/* Header section */}
      <div className="mb-8">
        <div className="border border-white/10 px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-widest text-neutral-400 mb-4 inline-block">
          SYSTEM CLEARANCE // SECTION 007
        </div>
        <h1 className="font-mono text-lg tracking-widest text-neutral-100 uppercase font-bold">
          CLEARANCE TERMINAL
        </h1>
        <p className="text-xs text-neutral-500 mt-1">
          Verify corporate credentials to access workspace ledger.
        </p>
      </div>

      {/* Minimalist Tab Switcher */}
      <div className="flex items-center gap-6 border-b border-white/5 mb-6">
        <button
          type="button"
          onClick={() => {
            setMode("signin");
            setErrorMsg(null);
            setInfoMsg(null);
          }}
          className={
            mode === "signin"
              ? "text-white border-b-2 border-[#C25E3E] pb-2 font-mono text-xs tracking-wider cursor-pointer"
              : "text-neutral-500 hover:text-neutral-300 pb-2 font-mono text-xs tracking-wider cursor-pointer"
          }
        >
          [ SIGN IN ]
        </button>
        <button
          type="button"
          onClick={() => {
            setMode("signup");
            setErrorMsg(null);
            setInfoMsg(null);
          }}
          className={
            mode === "signup"
              ? "text-white border-b-2 border-[#C25E3E] pb-2 font-mono text-xs tracking-wider cursor-pointer"
              : "text-neutral-500 hover:text-neutral-300 pb-2 font-mono text-xs tracking-wider cursor-pointer"
          }
        >
          [ REQUEST CLEARANCE ]
        </button>
      </div>

      {/* Alerts */}
      {errorMsg && (
        <div className="mb-5 rounded border border-[#C25E3E]/40 bg-[#160d09] p-3 text-left">
          <div className="flex items-start gap-2.5">
            <AlertCircle className="h-4 w-4 text-[#C25E3E] shrink-0 mt-0.5" />
            <div className="text-xs font-mono text-neutral-300 leading-relaxed">
              {errorMsg}
            </div>
          </div>
        </div>
      )}

      {infoMsg && (
        <div className="mb-5 rounded border border-white/20 bg-neutral-900 p-3 text-left">
          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="h-4 w-4 text-neutral-300 shrink-0 mt-0.5" />
            <div className="text-xs font-mono text-neutral-300 leading-relaxed">
              {infoMsg}
            </div>
          </div>
        </div>
      )}

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {mode === "signup" && (
          <div>
            <label className="block font-mono text-[10px] uppercase tracking-widest text-neutral-400 mb-1.5">
              ORGANIZATION / FIRM
            </label>
            <input
              type="text"
              value={organization}
              onChange={(e) => setOrganization(e.target.value)}
              placeholder="e.g. Apex Strategic Partners"
              required={mode === "signup"}
              className="w-full rounded bg-[#0F0F0F] border border-neutral-800 px-3.5 py-2 font-mono text-xs text-neutral-200 placeholder-neutral-600 focus:border-[#C25E3E]/70 focus:outline-none transition-colors"
            />
          </div>
        )}

        <div>
          <label className="block font-mono text-[10px] uppercase tracking-widest text-neutral-400 mb-1.5">
            WORK EMAIL
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="analyst@firm.com"
            required
            className="w-full rounded bg-[#0F0F0F] border border-neutral-800 px-3.5 py-2 font-mono text-xs text-neutral-200 placeholder-neutral-600 focus:border-[#C25E3E]/70 focus:outline-none transition-colors"
          />
        </div>

        <div>
          <label className="block font-mono text-[10px] uppercase tracking-widest text-neutral-400 mb-1.5">
            SECURITY KEY / PASSWORD
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••••••"
            required
            className="w-full rounded bg-[#0F0F0F] border border-neutral-800 px-3.5 py-2 font-mono text-xs text-neutral-200 placeholder-neutral-600 focus:border-[#C25E3E]/70 focus:outline-none transition-colors"
          />
        </div>

        {/* Primary Action Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-2.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 hover:border-neutral-500 text-neutral-200 font-mono text-xs uppercase tracking-widest transition-all mt-4 cursor-pointer active:scale-[0.99] disabled:opacity-50"
        >
          {isLoading
            ? "PROCESSING CLEARANCE..."
            : mode === "signin"
            ? "AUTHENTICATE →"
            : "REGISTER CLEARANCE →"}
        </button>
      </form>

      {/* Understated Guest Clearance */}
      <div className="mt-6 text-center">
        <button
          type="button"
          onClick={handleGuestClearance}
          className="font-mono text-xs text-neutral-400 hover:text-white transition-colors cursor-pointer inline-block"
        >
          [ Continue via Guest Sandbox Clearance → ]
        </button>
      </div>

      {/* Return to Public Terminal */}
      <div className="mt-8 pt-4 border-t border-white/5 text-center">
        <Link
          href="/"
          className="font-mono text-xs text-neutral-500 hover:text-neutral-300 transition-colors"
        >
          ← Return to Public Terminal
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#070707] text-neutral-200 flex flex-col lg:flex-row">
      {/* A. LEFT PANE (Desktop 50/50 Split) */}
      <div className="lg:flex hidden lg:w-1/2 flex-col justify-between p-12 border-r border-white/5 bg-[#050505]">
        {/* Top: Black Swan logo + "BLACK SWAN" monospace */}
        <div className="flex items-center gap-3">
          <BlackSwanLogo className="w-6 h-6 text-white" />
          <span className="font-mono text-xs tracking-widest text-neutral-300 uppercase font-bold">
            BLACK SWAN
          </span>
        </div>

        {/* Middle: London night visual framed in archival copper/charcoal border */}
        <div className="my-auto py-8">
          <div className="border border-white/10 rounded-sm overflow-hidden bg-bg-surface shadow-2xl">
            <DitherDistortionImage
              src="/hero-illustration.jpg"
              alt="Black Swan Financial Intelligence - Vintage City Skyline at Night"
              className="w-full h-auto object-cover block"
              maxTilt={4}
              maxDistortion={8}
            />
          </div>
        </div>

        {/* Bottom: Minimalist editorial quote */}
        <div>
          <div className="font-serif italic text-sm text-neutral-300 leading-relaxed mb-2">
            &ldquo;Forensic visibility when the market turns.&rdquo;
          </div>
          <div className="text-[11px] font-mono text-neutral-500 tracking-wider uppercase">
            CLASSIFIED // FP&amp;A INTELLIGENCE PROTOCOL
          </div>
        </div>
      </div>

      {/* B. RIGHT PANE (Login Terminal) */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 bg-[#0A0A0A]">
        <Suspense
          fallback={
            <div className="text-neutral-500 font-mono text-xs">
              INITIALIZING TERMINAL...
            </div>
          }
        >
          <LoginTerminal />
        </Suspense>
      </div>
    </div>
  );
}
