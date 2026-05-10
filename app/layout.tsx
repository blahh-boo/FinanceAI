import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ThemeToggle } from "@/components/ThemeToggle";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jb-mono", display: "swap" });

export const metadata: Metadata = {
  title: "FinanceAI — Financial Research",
  description: "AI-powered financial research with live web search and citations",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${mono.variable}`}>
      <body className="m-0 flex h-screen flex-col">
        <header className="flex h-12 shrink-0 items-center justify-between border-b border-line bg-surface px-5">
          <div className="flex items-center gap-2.5">
            <span className="font-mono text-[13px] font-semibold tracking-wider text-accent">
              FINANCEAI
            </span>
            <span className="rounded border border-line bg-elevated px-1.5 py-px font-mono text-[11px] text-muted">
              beta
            </span>
          </div>
          <ThemeToggle />
        </header>
        <main className="flex flex-1 flex-col overflow-hidden">{children}</main>
      </body>
    </html>
  );
}
