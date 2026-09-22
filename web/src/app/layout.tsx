import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";

const displayFont = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const sansFont = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Black Swan | Autonomous FP&A Intelligence",
  description: "Autonomous, transparent AI financial decision assistant powered by 4-agent FP&A team.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${displayFont.variable} ${sansFont.variable}`} suppressHydrationWarning>
      <body className="min-h-screen bg-parchment text-swan-black font-sans antialiased selection:bg-swan-black selection:text-parchment" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
