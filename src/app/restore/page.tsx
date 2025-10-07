"use client";
import { useEffect, useState } from "react";

export default function RestorePage() {
  const [userId, setUserId] = useState("");
  const [backups, setBackups] = useState<string[]>([]);
  const [selected, setSelected] = useState<string>("");
  const [status, setStatus] = useState<string | null>(null);
  const [iam, setIam] = useState<{ hasRestoreBackup: boolean } | null>(null);

  useEffect(() => {
    (async () => {
      const res = await fetch("/api/iam/check");
      if (res.ok) setIam(await res.json());
    })();
  }, []);

  const onPopulate = async () => {
    setStatus("Fetching backups...");
    try {
      const res = await fetch(`/api/backups?userId=${encodeURIComponent(userId)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load backups");
      const list = data.files as string[];
      setBackups(list);
      setSelected(list[0] || "");
      setStatus(null);
    } catch (err: any) {
      setStatus(err.message || "Error fetching backups");
    }
  };

  const onRestore = async () => {
    setStatus("Sending restore notification...");
    const performedBy = "admin-ui-user"; // Placeholder username
    const res = await fetch("/api/restore", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, filename: selected, performedBy }),
    });
    const data = await res.json();
    setStatus(res.ok ? "Notification sent" : data.error || "Failed");
  };

  const disabled = !iam?.hasRestoreBackup;

  return (
    <div className="max-w-lg mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-bold">Restore from Backup</h1>
      {disabled && (
        <div className="p-3 border border-red-200 bg-red-50 text-red-700 rounded">
          Your IAM user lacks restoreBackup permission. Access is limited.
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
        <button className="bg-black text-white rounded px-4 py-2" onClick={onPopulate}>
          Populate Backups
        </button>
      </div>
      {backups.length > 0 && (
        <div className="space-y-2">
          <label className="block text-sm">Select Backup</label>
          <select
            className="w-full border rounded p-2"
            value={selected}
            onChange={(e) => setSelected(e.target.value)}
          >
            {backups.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
          <button
            className="bg-blue-600 text-white rounded px-4 py-2"
            onClick={onRestore}
            disabled={!selected || !userId || disabled}
          >
            Restore
          </button>
        </div>
      )}
      {status && <p className="text-sm">{status}</p>}
    </div>
  );
}