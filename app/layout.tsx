import type { Metadata, Viewport } from "next";
import Link from "next/link";
import { HtmlLang, Msg } from "@/components/i18n";
import "./globals.css";

export const metadata: Metadata = {
  title: "Norsk – learn Norwegian",
  description: "Learn Norwegian (bokmål) with flashcards, sentence building, writing practice and inflections.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#059669",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="flex min-h-full flex-col bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
        <HtmlLang />
        <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 backdrop-blur dark:border-slate-800 dark:bg-slate-900/90">
          <nav className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3">
            <Link href="/" className="text-lg font-bold">
              🇳🇴 Norsk
            </Link>
            <div className="flex gap-4 text-sm font-medium text-slate-600 dark:text-slate-300">
              <Link href="/" className="hover:text-emerald-700">
                <Msg id="nav.overview" />
              </Link>
              <Link href="/due" className="hover:text-emerald-700">
                <Msg id="nav.due" />
              </Link>
              <Link href="/settings" className="hover:text-emerald-700">
                <Msg id="nav.settings" />
              </Link>
              <Link href="/about" className="hover:text-emerald-700">
                <Msg id="nav.about" />
              </Link>
            </div>
          </nav>
        </header>
        <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-6">{children}</main>
      </body>
    </html>
  );
}
