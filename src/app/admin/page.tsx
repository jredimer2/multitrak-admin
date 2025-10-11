"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function AdminDashboard() {
  const [iam, setIam] = useState<{ hasRestoreBackup: boolean } | null>(null);
  const [userId, setUserId] = useState("");
  const [backups, setBackups] = useState<string[]>([]);
  const [status, setStatus] = useState<string | null>(null);
  const [selected, setSelected] = useState<string>("");

  useEffect(() => {
    (async () => {
      const res = await fetch("/api/iam/check");
      if (res.ok) setIam(await res.json());
    })();
  }, []);

  const disabled = !iam?.hasRestoreBackup;

  const fetchBackups = async () => {
    setStatus("Loading backups...");
    try {
      const res = await fetch(`/api/backups?userId=${encodeURIComponent(userId)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load backups");
      const list = (data.files as string[]) || [];
      setBackups(list);
      setSelected(list[0] || "");
      setStatus(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error loading backups";
      setStatus(msg);
    }
  };

  const onRestore = async (file: string) => {
    setStatus(`Restoring ${file}...`);
    const performedBy = "admin-ui-user";
    const res = await fetch("/api/restore", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, filename: file, performedBy }),
    });
    const data = await res.json();
    setStatus(res.ok ? `Restore notified for ${file}` : data.error || "Failed");
  };

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <Link href="/restore" className="text-blue-600 hover:underline">Go to Restore Page</Link>
      </div>

      {disabled && (
        <div className="p-3 border border-yellow-200 bg-yellow-50 text-yellow-800 rounded">
          Your IAM user lacks restoreBackup permission. You can view but not restore.
        </div>
      )}

      <div className="space-y-2">
        <label className="block text-sm">User ID</label>
        <input
          className="w-full border rounded p-2"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          placeholder="Enter user ID"
        />
        <button className="bg-black text-white rounded px-4 py-2" onClick={fetchBackups}>
          Search Backups
        </button>
      </div>

      {backups.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-lg font-semibold">Backups</h2>
          <ul className="divide-y border rounded">
            {backups.map((b) => (
              <li key={b} className="p-3 flex items-center justify-between">
                <span className="truncate mr-3">{b}</span>
                <div className="flex items-center gap-2">
                  <button
                    className="bg-gray-100 border px-3 py-1 rounded"
                    onClick={() => setSelected(b)}
                  >
                    Select
                  </button>
                  <button
                    className="bg-blue-600 text-white px-3 py-1 rounded disabled:opacity-50"
                    onClick={() => onRestore(b)}
                    disabled={disabled || !userId}
                  >
                    Restore
                  </button>
                </div>
              </li>
            ))}
          </ul>
          {selected && (
            <div className="text-sm text-gray-600">Selected: {selected}</div>
          )}
        </div>
      )}

      {status && <p className="text-sm">{status}</p>}
    </div>
  );
}