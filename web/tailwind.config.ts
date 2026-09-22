import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
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
        serif: ["var(--font-display)", "Playfair Display", "Cinzel", "Georgia", "serif"],
        sans: ["var(--font-sans)", "Inter", "system-ui", "sans-serif"],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "Monaco", "Consolas", "monospace"],
      },
      borderColor: {
        DEFAULT: "rgba(107, 77, 58, 0.45)",
      },
    },
  },
  plugins: [],
};

export default config;
