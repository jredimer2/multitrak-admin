"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("Sending verification code...");
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Failed to send verification code.");
        setStatus(null);
        setLoading(false);
        return;
      }
      router.push(`/auth/verify?email=${encodeURIComponent(email)}`);
    /* eslint-disable @typescript-eslint/no-explicit-any */
    } catch (err: any) {
      setError(err.message || "Network error while sending code.");
      setStatus(null);
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 rounded-lg border bg-white/80">
      <h1 className="text-2xl font-bold mb-4">Admin Sign Up</h1>
      <form className="space-y-4" onSubmit={onSubmit}>
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
        />
        <button className="bg-black text-white rounded px-4 py-2 disabled:opacity-50" type="submit" disabled={loading}>
          Send Verification
        </button>
      </form>
      {status && <p className="mt-4 text-sm">{status}</p>}
      {error && (
        <div className="mt-2 p-3 bg-red-50 border border-red-200 text-red-700 rounded text-sm">
          ⚠ {error}
        </div>
      )}
      <div className="mt-4 text-sm">
        <Link href="/auth/login" className="text-blue-600 hover:underline">Back to login</Link>
      </div>
    </div>
  );
}