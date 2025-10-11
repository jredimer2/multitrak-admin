"use client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";

export default function VerifyContent() {
  const params = useSearchParams();
  const router = useRouter();
  const emailParam = params.get("email") || "";

  // Redirect to login if no email in URL
  useEffect(() => {
    if (!emailParam) {
      router.push("/auth/login");
    }
  }, [emailParam, router]);

  const [code, setCode] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const resend = async () => {
    setStatus(null);
    setError(null);
    router.push(`/auth/signup?email=${encodeURIComponent(emailParam)}`);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setStatus("Verifying...");
    const res = await fetch("/api/auth/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: emailParam, code }),
    });
    const data = await res.json();
    if (res.ok) {
    setStatus("Verified successfully! You can now access the admin panel.");
    } else {
      setError(data.error || "Verification failed. Please check your code and try again.");
      setStatus(null);
    }
  };

  // Don't render if no email (will redirect)
  if (!emailParam) return null;

  return (
    <div className="max-w-md mx-auto p-6 rounded-lg border bg-white/80">
      <h1 className="text-2xl font-bold mb-2">Verify Account</h1>
      <p className="text-sm text-gray-600 mb-4">
        Enter the verification code sent to admin@ezytask.io for:
      </p>
      <p className="text-sm font-medium mb-4 p-2 bg-gray-50 rounded border">
        {emailParam}
      </p>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded">
          ⚠ {error}
          <div className="mt-2 text-sm">
            Your code may be expired. You can resend a new code or go back to signup to start over.
          </div>
        </div>
      )}

      <form className="space-y-4" onSubmit={onSubmit}>
        <input
          className="w-full border rounded p-2"
          type="text"
          placeholder="Verification Code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          required
        />
        <button
          className="w-full bg-black text-white rounded px-4 py-2"
          type="submit"
          disabled={!code.trim()}
        >
          Verify
        </button>
      </form>

      <div className="mt-4 flex justify-between items-center">
        <button className="text-blue-600 hover:underline text-sm" onClick={resend}>Resend code</button>
        <Link href="/auth/login" className="text-gray-600 hover:underline text-sm">
          Back to login
        </Link>
        <Link href="/auth/signup" className="text-blue-600 hover:underline text-sm">
          Start over
        </Link>
      </div>

      {status && <p className="mt-4 text-sm">{status}</p>}
    </div>
  );
}