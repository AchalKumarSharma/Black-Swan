import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "bg-canvas": "var(--bg-canvas)",
        "bg-surface": "var(--bg-surface)",
        "bg-surface-subtle": "var(--bg-surface-subtle)",
        "border-noir": "var(--border-noir)",
        "text-primary": "var(--text-primary)",
        "text-secondary": "var(--text-secondary)",
        "text-muted": "var(--text-muted)",
        "accent-rust": "var(--accent-rust)",
        "accent-contrast": "var(--accent-contrast)",
        canvas: "var(--bg-canvas)",
        surface: {
          DEFAULT: "var(--bg-surface)",
          subtle: "var(--bg-surface-subtle)",
        },
        noir: "var(--border-noir)",
        parchment: {
          light: "#faf7f2",
          DEFAULT: "#f4f0e8",
          dark: "#eae4d6",
        },
        swan: {
          black: "#1a1613",
          charcoal: "#4a4540",
          sepia: "#6b4d3a",
          rust: "#8c432a",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "Helvetica Neue Condensed", "Impact", "sans-serif"],
        body: ["var(--font-body)", "Archivo Narrow", "sans-serif"],
        sans: ["var(--font-body)", "Archivo Narrow", "sans-serif"],
        serif: ["var(--font-display)", "Helvetica Neue Condensed", "Impact", "sans-serif"],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "Monaco", "Consolas", "monospace"],
      },
      borderColor: {
        DEFAULT: "var(--border-noir)",
        noir: "var(--border-noir)",
        "border-noir": "var(--border-noir)",
        "accent-rust": "var(--accent-rust)",
      },
    },
  },
  plugins: [],
};

export default config;
