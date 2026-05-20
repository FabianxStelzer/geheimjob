import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { Providers } from "@/components/providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Geheimjob — Diskreter Jobwechsel",
  description:
    "Profile für ambitionierte Arbeitnehmer, kontrollierte Matches mit Arbeitgebern, DSGVO-orientierter Workflow.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-zinc-50 text-zinc-900">
        <Providers>
          <header className="border-b border-zinc-200 bg-white">
            <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-4">
              <Link href="/" className="text-lg font-semibold tracking-tight">
                Geheimjob
              </Link>
              <nav className="flex flex-wrap items-center gap-4 text-sm text-zinc-600">
                <Link href="/register/arbeitnehmer" className="hover:text-zinc-900">
                  Arbeitnehmer
                </Link>
                <Link href="/register/arbeitgeber" className="hover:text-zinc-900">
                  Arbeitgeber
                </Link>
                <Link href="/login" className="hover:text-zinc-900">
                  Login
                </Link>
                <Link href="/datenschutz" className="hover:text-zinc-900">
                  Datenschutz
                </Link>
              </nav>
            </div>
          </header>
          <div className="flex flex-1 flex-col">{children}</div>
          <footer className="border-t border-zinc-200 bg-white py-6 text-center text-xs text-zinc-500">
            Hinweis: Rechtsverbindliche Texte bitte durch eine Kanzlei prüfen lassen.
          </footer>
        </Providers>
      </body>
    </html>
  );
}
