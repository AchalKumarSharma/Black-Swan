"use client";

import React, { useEffect, useState } from "react";
import { useTheme } from "./ThemeProvider";
import { Moon, Sun } from "lucide-react";

export const ThemeToggle: React.FC<{ className?: string }> = ({ className = "" }) => {
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <button
        type="button"
        disabled
        className={`h-7 px-2.5 text-xs font-sans uppercase tracking-wider border border-noir text-text-secondary inline-flex items-center gap-1.5 rounded transition-colors opacity-70 ${className}`}
      >
        <Moon className="h-3 w-3" />
        <span>VAULT [DARK]</span>
      </button>
    );
  }

  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      title={isDark ? "Switch to Parchment (Light Mode)" : "Switch to Obsidian Vault (Dark Mode)"}
      className={`h-7 px-2.5 text-xs font-sans uppercase tracking-wider border border-noir text-text-secondary hover:text-text-primary hover:border-text-primary inline-flex items-center gap-1.5 rounded transition-colors cursor-pointer select-none ${className}`}
    >
      {isDark ? (
        <>
          <Sun className="h-3 w-3 text-accent-rust" />
          <span>PARCHMENT [LIGHT]</span>
        </>
      ) : (
        <>
          <Moon className="h-3 w-3 text-text-secondary" />
          <span>VAULT [DARK]</span>
        </>
      )}
    </button>
  );
};
