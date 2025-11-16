"use client";
import { useEffect, useState } from "react";

export default function RestorePage() {
  const [userId, setUserId] = useState("");
  const [dates, setDates] = useState<string[]>([]);
  const [files, setFiles] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedFile, setSelectedFile] = useState<string>("");
  const [status, setStatus] = useState<string | null>(null);
  const [iam, setIam] = useState<{ hasRestoreBackup: boolean } | null>(null);
  const [performedBy, setPerformedBy] = useState<string>("admin-ui-user");

  const formatDateLabel = (mmddyyyy: string) => {
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const m = Number(mmddyyyy.slice(0, 2));
    const d = mmddyyyy.slice(3, 5);
    const y = mmddyyyy.slice(6, 10);
    if (!m || m < 1 || m > 12) return mmddyyyy;
    return `${months[m - 1]}-${d}-${y}`;
  };

  useEffect(() => {
    (async () => {
      const res = await fetch("/api/iam/check");
      if (res.ok) setIam(await res.json());
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/auth/me", { cache: "no-store" });
        const data = await res.json().catch(() => ({}));
        if (data.email) setPerformedBy(data.email);
      } catch {
        // ignore
      }
    })();
  }, []);

  const onPopulate = async () => {
    setStatus("Fetching backup dates...");
    try {
      const res = await fetch(`/api/backups`, { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load backups");
      const list = (data.dates as string[]) || [];
      setDates(list);
      const first = list[0] || "";
      setSelectedDate(first);
      setStatus(null);
    /* eslint-disable @typescript-eslint/no-explicit-any */
    } catch (err: any) {
      setStatus(err.message || "Error fetching backups");
    }
  };

  // When a date is selected, load JSON files under that date folder
  useEffect(() => {
    (async () => {
      if (!selectedDate) {
        setFiles([]);
        setSelectedFile("");
        return;
      }
      setStatus(`Loading files for ${selectedDate}...`);
      try {
        const res = await fetch(`/api/backups?date=${encodeURIComponent(selectedDate)}`, { cache: "no-store" });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to load files");
        const list = (data.files as string[]) || [];
        setFiles(list);
        setSelectedFile(list[0] || "");
        setStatus(null);
      /* eslint-disable @typescript-eslint/no-explicit-any */
      } catch (err: any) {
        setStatus(err.message || "Error loading files");
      }
    })();
  }, [selectedDate]);

  const onRestore = async () => {
    setStatus("Sending restore notification...");
    const res = await fetch("/api/restore", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, filename: selectedFile, performedBy }),
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
      {dates.length > 0 && (
        <div className="space-y-2">
          <label className="block text-sm">Select Date</label>
          <select
            className="w-full border rounded p-2"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          >
            {dates.map((d) => (
              <option key={d} value={d}>
                {formatDateLabel(d)}
              </option>
            ))}
          </select>

          {files.length > 0 && (
            <>
              <label className="block text-sm">Select Backup File</label>
              <select
                className="w-full border rounded p-2"
                value={selectedFile}
                onChange={(e) => setSelectedFile(e.target.value)}
              >
                {files.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
              <button
                className="bg-blue-600 text-white rounded px-4 py-2"
                onClick={onRestore}
                disabled={!selectedFile || !userId || disabled}
              >
                Restore
              </button>
            </>
          )}
        </div>
      )}
      {status && <p className="text-sm">{status}</p>}
    </div>
  );
}