"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";

export default function ReceiveCodeContent() {
  const params = useSearchParams();
  const emailParam = params.get("email") || "";
  const [email, setEmail] = useState(emailParam);
  const [status, setStatus] = useState<string | null>(null);

  const resend = async () => {
    setStatus("Resending...");
    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    setStatus(res.ok ? "Code resent to admin@ezytask.io" : "Failed to resend");
  };

  return (
    <div className="max-w-md mx-auto p-6 rounded-lg border bg-white/80">
      <h1 className="text-2xl font-bold mb-2">Check your email</h1>
      <p className="text-sm text-gray-700 mb-4">
        A verification code has been sent to admin@ezytask.io for the account:
        <span className="font-medium"> {email || "(no email)"}</span>
      </p>

      <div className="space-y-2">
        <label className="text-sm">Email</label>
        <input
          className="w-full border rounded p-2"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Your email"
        />
      </div>

      <button className="mt-3 bg-black text-white rounded px-4 py-2" onClick={resend}>
        Resend code
      </button>
      {status && <p className="mt-3 text-sm">{status}</p>}

      <div className="mt-4 text-sm flex justify-between">
        <Link href="/auth/login" className="text-blue-600 hover:underline">Back to login</Link>
        <Link href="/auth/signup" className="text-blue-600 hover:underline">Create new account</Link>
        <Link href="/auth/verify" className="text-gray-600 hover:underline">Enter verification code</Link>
      </div>
    </div>
  );
}