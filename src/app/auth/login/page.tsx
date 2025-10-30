"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function LoginPage() {
  const params = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [unverified, setUnverified] = useState(false);
  const router = useRouter();
  const msg = params.get("msg");

  useEffect(() => {
    (async () => {
      const res = await fetch("/api/iam/check");
      // If user can call IAM check and has cookie, just let middleware handle.
      // No-op; rely on middleware redirect.
    })();
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("Signing in...");
    setError(null);
    setLoading(true);
    setUnverified(false);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (
          res.status === 401 &&
          typeof data.error === "string" &&
          data.error.toLowerCase().includes("not verified")
        ) {
          setError("Account not verified");
          setUnverified(true);
          setStatus(null);
          setLoading(false);
          return;
        }
        setError(data.error || "Login failed");
        setStatus(null);
        setLoading(false);
        return;
      }
      setStatus("Signed in!");
      // Refresh server components (header) so menu updates immediately
      router.refresh();
      // Notify client header to re-fetch session without full reload
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("auth-change"));
      }
      router.push("/admin");
      /* eslint-disable @typescript-eslint/no-explicit-any */
    } catch (err: any) {
      setError(err.message || "Network error");
      setStatus(null);
      setLoading(false);
    }
  };

  const sendVerification = async () => {
    setStatus("Sending verification code...");
    setError(null);
    setLoading(true);
    try {
      const resendRes = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const resendData = await resendRes.json().catch(() => ({}));
      if (resendRes.ok) {
        setStatus("Verification code sent. Redirecting to verify page...");
        setLoading(false);
        router.push(`/auth/verify?email=${encodeURIComponent(email)}`);
      } else {
        setError(resendData.error || "Failed to send verification code.");
        setStatus(null);
        setLoading(false);
      }
    } catch (err: any) {
      setError(err.message || "Network error while sending code.");
      setStatus(null);
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 rounded-lg border bg-white/80">
      {msg === "please_sign_in" && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 text-blue-800 rounded">
          Please sign in to continue.
        </div>
      )}
      <h1 className="text-2xl font-bold mb-2">Welcome back</h1>
      <p className="text-sm text-gray-600 mb-4">Sign in to EzyTask Admin</p>
      <form className="space-y-3" onSubmit={onSubmit}>
        <input
          className="w-full border rounded p-2"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          className="w-full border rounded p-2"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button className="w-full bg-black text-white rounded px-4 py-2 disabled:opacity-50" type="submit" disabled={loading}>
          {loading ? "Signing in..." : "Login"}
        </button>
      </form>
      {unverified && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 text-yellow-800 rounded">
          Your account is not verified yet. Send a verification code and proceed to the verify page.
          <button
            className="mt-3 w-full bg-black text-white rounded px-4 py-2 disabled:opacity-50"
            onClick={sendVerification}
            disabled={loading || !email || !password}
          >
            Send verification code
          </button>
        </div>
      )}
      {status && <p className="mt-3 text-sm">{status}</p>}
      {error && (
        <div className="mt-2 p-3 bg-red-50 border border-red-200 text-red-700 rounded text-sm">
          ⚠ {error}
        </div>
      )}
      <div className="mt-4 text-sm">
        <Link href="/auth/signup" className="text-blue-600 hover:underline">Create an account</Link>
      </div>
    </div>
  );
}