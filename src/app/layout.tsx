import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Image from "next/image";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "EzyTask Admin",
  description: "Administrative panel for EzyTask",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <header className="border-b bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
          <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-3">
            <Link href="/auth/login" className="flex items-center gap-2">
              <Image src="/logo.svg" alt="EzyTask logo" width={28} height={28} />
              <span className="text-sm font-semibold tracking-wide">EzyTask Admin</span>
            </Link>
            <nav className="ml-auto flex items-center gap-3 text-sm">
              <Link className="hover:underline" href="/auth/login">Login</Link>
              <Link className="hover:underline" href="/auth/signup">Sign Up</Link>
            </nav>
          </div>
        </header>
        <main className="max-w-5xl mx-auto px-4 py-6">{children}</main>
      </body>
    </html>
  );
}
