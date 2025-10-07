"use client";
import Link from "next/link";
import { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // No actual auth yet; this is placeholder
    setStatus("Login is not implemented yet.");
  };

  return (
    <div className="max-w-md mx-auto p-6 rounded-lg border bg-white/80">
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
        <button className="w-full bg-black text-white rounded px-4 py-2" type="submit">
          Login
        </button>
      </form>
      {status && <p className="mt-3 text-sm">{status}</p>}
      <div className="mt-4 text-sm">
        <Link href="/auth/signup" className="text-blue-600 hover:underline">Create an account</Link>
      </div>
    </div>
  );
}