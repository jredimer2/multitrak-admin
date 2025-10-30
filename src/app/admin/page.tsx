"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

export default function AdminDashboard() {
  const params = useSearchParams();
  const [dates, setDates] = useState<string[]>([]);
  const [status, setStatus] = useState<string | null>(null);
  const msg = params.get("msg");

  // Populate last 30 days backups from staging on load
  useEffect(() => {
    (async () => {
      setStatus("Loading backups...");
      try {
        const res = await fetch(`/api/backups`, { cache: "no-store" });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to load backups");
        setDates((data.dates as string[]) || []);
        setStatus(null);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Error loading backups";
        setStatus(msg);
      }
    })();
  }, []);

  const onBackup = async (date: string) => {
    // Placeholder action; currently only showing list per requirement.
    setStatus(`Backup action requested for ${date}`);
    // Future: call an API to perform backup.
  };

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <div className="flex items-center">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
      </div>

      {msg === "already_signed_in" && (
        <div className="p-3 border border-blue-200 bg-blue-50 text-blue-800 rounded">
          You’re already signed in.
        </div>
      )}

      <div className="space-y-2">
        <h2 className="text-lg font-semibold">Recent Backups (Staging)</h2>
        <div className="overflow-x-auto border rounded">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-3 py-2 w-16">No</th>
                <th className="text-left px-3 py-2">Date</th>
                <th className="text-left px-3 py-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {dates.length === 0 && (
                <tr>
                  <td className="px-3 py-2" colSpan={3}>No backups found in last 30 days.</td>
                </tr>
              )}
              {dates.map((date, idx) => (
                <tr key={date} className="border-t">
                  <td className="px-3 py-2">{idx + 1}</td>
                  <td className="px-3 py-2">{date}</td>
                  <td className="px-3 py-2">
                    <button
                      className="bg-black text-white rounded px-3 py-1"
                      onClick={() => onBackup(date)}
                    >
                      Backup
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {status && <p className="text-sm">{status}</p>}
    </div>
  );
}