import type { Metadata } from "next";
import { Archivo_Narrow } from "next/font/google";
import "./globals.css";

import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { SmoothScrollProvider } from "@/components/providers/SmoothScrollProvider";

const archivoNarrow = Archivo_Narrow({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-body",
  display: "swap",
});

const displayFont = {
  variable: "font-display-var",
};

export const metadata: Metadata = {
  title: "Black Swan | Autonomous FP&A Intelligence",
  description: "Autonomous, transparent AI financial decision assistant powered by 4-agent FP&A team.",
};

const themeInitScript = `
(function() {
  try {
    var stored = localStorage.getItem('blackswan-theme');
    var isDark = stored ? stored === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  } catch (e) {}
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${displayFont.variable} ${archivoNarrow.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="min-h-screen bg-bg-canvas text-text-primary font-body antialiased selection:bg-accent-contrast selection:text-bg-canvas transition-colors duration-200" suppressHydrationWarning>
        <ThemeProvider>
          <SmoothScrollProvider>{children}</SmoothScrollProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
