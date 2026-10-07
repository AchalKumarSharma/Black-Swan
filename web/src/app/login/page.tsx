"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { BlackSwanLogo } from "@/components/ui/BlackSwanLogo";
import { AlertCircle, CheckCircle2 } from "lucide-react";

function LoginTerminal() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const mode = searchParams.get("mode");
  const isSignUp = mode === "signup";

  const rawRedirect = searchParams.get("redirect") || "/workspace";
  const redirectUrl = rawRedirect.startsWith("/") ? rawRedirect : "/workspace";

  const [organization, setOrganization] = useState("");
  const [email, setEmail] = useState("analyst@firm.com");
  const [password, setPassword] = useState("••••••••••••");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);

  // Tab click handlers updating URL smoothly without scrolling
  const handleSelectSignIn = () => {
    router.replace(
      `/login?mode=signin&redirect=${encodeURIComponent(redirectUrl)}`,
      { scroll: false }
    );
    setErrorMsg(null);
    setInfoMsg(null);
  };

  const handleSelectSignUp = () => {
    router.replace(
      `/login?mode=signup&redirect=${encodeURIComponent(redirectUrl)}`,
      { scroll: false }
    );
    setErrorMsg(null);
    setInfoMsg(null);
  };

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

    router.push(redirectUrl);
  };

  // Submit Sign In or Request Clearance / Sign Up
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);
    setInfoMsg(null);

    if (!isSignUp) {
      // [ SIGN IN ]
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          setErrorMsg(error.message || "Invalid credentials");
          setIsLoading(false);
          return;
        }

        if (data?.session) {
          document.cookie =
            "bs_clearance_level=1; path=/; max-age=86400; SameSite=Lax";
          router.push(redirectUrl);
        } else {
          setErrorMsg("Invalid credentials. Try Guest Sandbox Clearance.");
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
      // [ SIGN UP ]
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
          router.push(redirectUrl);
        } else {
          setInfoMsg(
            "CLEARANCE INITIATED: Check your inbox for confirmation link."
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
    <div className="w-full max-w-md min-w-0">
      {/* Mobile-only brand badge */}
      <div className="lg:hidden flex items-center justify-center gap-2.5 mb-8">
        <BlackSwanLogo className="w-6 h-6 text-white" />
        <span className="font-mono text-xs tracking-widest text-neutral-300 uppercase font-bold">
          BLACK SWAN
        </span>
      </div>

      {/* Header section */}
      <div className="mb-8">
        <div className="inline-block mb-3 px-2.5 py-1 border border-[#2a221b] bg-[#14100d] rounded font-mono text-[10px] tracking-widest text-[#c4aa93] uppercase select-none">
          AGENTIC AI FINANCIAL INTELLIGENCE
        </div>
        <h1 className="font-mono text-2xl sm:text-3xl font-bold tracking-tight text-[#f5f2eb] uppercase mb-1.5">
          {mode === "signup" ? "WELCOME!" : "WELCOME BACK!"}
        </h1>
        <p className="font-mono text-xs text-[#a39486] mb-6">
          Verify corporate credentials to access workspace ledger.
        </p>
      </div>

      {/* Minimalist Tab Switcher: [ SIGN IN ] | [ SIGN UP ] */}
      <div className="flex items-center gap-6 border-b border-white/5 mb-6">
        <button
          type="button"
          onClick={handleSelectSignIn}
          className={
            !isSignUp
              ? "text-white border-b-2 border-[#d97746] pb-2 font-mono text-xs tracking-wider cursor-pointer transition-colors"
              : "text-neutral-500 hover:text-neutral-300 pb-2 font-mono text-xs tracking-wider cursor-pointer transition-colors"
          }
        >
          [ SIGN IN ]
        </button>
        <button
          type="button"
          onClick={handleSelectSignUp}
          className={
            isSignUp
              ? "text-white border-b-2 border-[#d97746] pb-2 font-mono text-xs tracking-wider cursor-pointer transition-colors"
              : "text-neutral-500 hover:text-neutral-300 pb-2 font-mono text-xs tracking-wider cursor-pointer transition-colors"
          }
        >
          [ SIGN UP ]
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
        {isSignUp && (
          <div>
            <label className="block font-mono text-[10px] uppercase tracking-wider text-[#b89b82] mb-1.5">
              ORGANIZATION / FIRM
            </label>
            <input
              type="text"
              value={organization}
              onChange={(e) => setOrganization(e.target.value)}
              placeholder="e.g. Apex Strategic Partners"
              required={isSignUp}
              className="w-full rounded bg-[#13100d]/90 border border-[#2a221b] px-3.5 py-2 font-mono text-base sm:text-xs text-[#f2ede4] placeholder-[#8c7b6e]/60 focus:border-[#b89b82]/60 focus:ring-1 focus:ring-[#b89b82]/30 focus:outline-none transition-all"
            />
          </div>
        )}

        <div>
          <label className="block font-mono text-[10px] uppercase tracking-wider text-[#b89b82] mb-1.5">
            WORK EMAIL
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="analyst@firm.com"
            required
            className="w-full rounded bg-[#13100d]/90 border border-[#2a221b] px-3.5 py-2 font-mono text-base sm:text-xs text-[#f2ede4] placeholder-[#8c7b6e]/60 focus:border-[#b89b82]/60 focus:ring-1 focus:ring-[#b89b82]/30 focus:outline-none transition-all"
          />
        </div>

        <div>
          <label className="block font-mono text-[10px] uppercase tracking-wider text-[#b89b82] mb-1.5">
            SECURITY KEY / PASSWORD
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••••••"
            required
            className="w-full rounded bg-[#13100d]/90 border border-[#2a221b] px-3.5 py-2 font-mono text-base sm:text-xs text-[#f2ede4] placeholder-[#8c7b6e]/60 focus:border-[#b89b82]/60 focus:ring-1 focus:ring-[#b89b82]/30 focus:outline-none transition-all"
          />
        </div>

        {/* Primary Action Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-2.5 rounded bg-[#1c1612] hover:bg-[#251e18] text-[#f2ede4] border border-[#3d3126] hover:border-[#b89b82]/40 transition-colors uppercase font-mono text-xs tracking-widest mt-4 cursor-pointer active:scale-[0.99] disabled:opacity-50"
        >
          {isLoading
            ? "PROCESSING CLEARANCE..."
            : isSignUp
            ? "CREATE ACCOUNT →"
            : "AUTHENTICATE →"}
        </button>
      </form>

      {/* Understated Guest Clearance */}
      <div className="mt-6 text-center">
        <button
          type="button"
          onClick={handleGuestClearance}
          className="font-mono text-xs text-neutral-400 hover:text-white transition-colors cursor-pointer inline-block"
        >
          [ Continue via Guest Sandbox → ]
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
      <div className="relative hidden lg:block lg:w-1/2 h-full min-h-screen overflow-hidden border-r border-[#221c17] bg-bg-canvas">
        {/* Top: Black Swan logo + "BLACK SWAN" monospace */}
        <div className="absolute top-6 left-6 z-20 flex items-center gap-3">
          <BlackSwanLogo className="w-6 h-6 text-white" />
          <span className="font-mono text-xs tracking-widest text-neutral-300 uppercase font-bold">
            BLACK SWAN
          </span>
        </div>

        <img
          src="/auth-balcony.png"
          alt="Black Swan Dossier Visual"
          className="w-full h-full object-cover object-center select-none"
        />
      </div>

      {/* B. RIGHT PANE (Login Terminal) */}
      <div className="flex-1 flex flex-col justify-center items-center px-4 sm:px-12 lg:px-16 py-8 min-h-screen bg-[#0b0907] relative overflow-y-auto">
        {/* Ambient Moonlight Ambient Glow from Left Artwork */}
        <div
          className="pointer-events-none absolute inset-0 select-none opacity-40"
          style={{
            background: "radial-gradient(ellipse 80% 60% at 10% 20%, rgba(184, 155, 130, 0.08) 0%, rgba(12, 10, 8, 0) 70%)"
          }}
        />

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
