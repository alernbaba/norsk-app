import type { Metadata, Viewport } from "next";
import Link from "next/link";
import { HtmlLang, Msg } from "@/components/i18n";
import { Logo } from "@/components/Logo";
import { HeaderNav, TabBar } from "@/components/NavLinks";
import "./globals.css";

export const metadata: Metadata = {
  title: "Norsk – learn Norwegian",
  description: "Learn Norwegian (bokmål) with flashcards, sentence building, writing practice and inflections.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f4eee2" },
    { media: "(prefers-color-scheme: dark)", color: "#11161c" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="flex min-h-full flex-col bg-paper text-ink">
        <HtmlLang />
        <header className="sticky top-0 z-10 border-b border-line/70 bg-paper/85 backdrop-blur-md">
          <div className="mx-auto flex max-w-2xl items-center justify-between gap-3 px-4 py-3">
            <Link href="/" className="flex items-center gap-2">
              <Logo />
              <span className="font-display text-xl font-semibold tracking-tight italic">norsk</span>
            </Link>
            <HeaderNav />
          </div>
        </header>
        <main className="mx-auto w-full max-w-2xl flex-1 px-4 pt-7 pb-16">{children}</main>
        <footer className="mx-auto w-full max-w-2xl px-4 pb-28 text-xs text-muted sm:pb-8">
          <p className="border-t border-dashed border-line pt-4">
            <span lang="nb" className="font-display italic">
              Litt hver dag.
            </span>{" "}
            <Msg id="common.tagline" />
          </p>
        </footer>
        <TabBar />
      </body>
    </html>
  );
}
