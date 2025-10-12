"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function ClientHeader({ sessionEmail }: { sessionEmail: string | null }) {
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(sessionEmail);

  useEffect(() => {
    setEmail(sessionEmail);
  }, [sessionEmail]);

  useEffect(() => {
    const handler = async () => {
      // After auth changes, fetch current session and update UI without full reload
      try {
        const res = await fetch("/api/auth/me", { cache: "no-store" });
        const data = await res.json().catch(() => ({}));
        setEmail(data.email || null);
      } catch {
        // ignore
      }
    };
    window.addEventListener("auth-change", handler);
    return () => window.removeEventListener("auth-change", handler);
  }, []);

  const onLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      // Inform other components and refresh header state
      window.dispatchEvent(new Event("auth-change"));
      setEmail(null);
      router.push("/auth/login?msg=please_sign_in");
    } catch {
      // ignore
    }
  };

  return (
    <header className="border-b bg-black/80 backdrop-blur supports-[backdrop-filter]:bg-black/60">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-3">
        <Link href={email ? "/admin" : "/auth/login"} className="flex items-center gap-2">
          <Image src="/logo.png" alt="EzyTask logo" width={128} height={28} />
        </Link>
        <nav className="ml-auto flex items-center gap-3 text-sm text-white/90 font-bold">
          {!email && (
            <>
              <Link className="hover:underline" href="/auth/login">Login</Link>
              <Link className="hover:underline" href="/auth/signup">Sign Up</Link>
            </>
          )}
          {email && (
            <>
              <span className="px-2 py-1 rounded bg-white/10">{email}</span>
              <button className="hover:underline" type="button" onClick={onLogout}>Logout</button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}