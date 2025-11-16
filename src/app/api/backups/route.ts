import { NextRequest } from "next/server";
import { s3Client } from "@/lib/aws";
import { ListObjectsV2Command } from "@aws-sdk/client-s3";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const bucket = process.env.BACKUPS_BUCKET || "ezytask-backup";
  const basePrefix = "MultitrakTable/";

  // If a specific date is requested, list JSON files under that folder
  const date = url.searchParams.get("date") || ""; // Expected format: MM-DD-YYYY
  if (date) {
    const prefix = `${basePrefix}${date}/`;
    try {
      const res = await s3Client.send(
        new ListObjectsV2Command({ Bucket: bucket, Prefix: prefix, MaxKeys: 1000 })
      );
      const files = (res.Contents || [])
        .map((o) => o.Key || "")
        .filter((k) => k.endsWith(".json"));
      console.log(files, "-------")
      return new Response(JSON.stringify({ files }), { status: 200 });
    } catch(error)
    {
        console.log(error)
        return new Response(JSON.stringify({ error: "Failed to list backups" }), { status: 500 });
    }

  }

  // Otherwise, list date folders under MultitrakTable-Staging/ for the last 30 days
  const res = await s3Client.send(
    new ListObjectsV2Command({ Bucket: bucket, Prefix: basePrefix, Delimiter: "/", MaxKeys: 1000 })
  );
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const dayMs = 24 * 60 * 60 * 1000;
  // Inclusive 30 calendar days window: today and previous 29 days
  const cutoff = new Date(startOfToday.getTime() - 29 * dayMs);

  const toDate = (mmddyyyy: string) => {
    const m = Number(mmddyyyy.slice(0, 2));
    const d = Number(mmddyyyy.slice(3, 5));
    const y = Number(mmddyyyy.slice(6, 10));
    return new Date(y, m - 1, d);
  };

  const commonPrefixes = res.CommonPrefixes || [];
  const dates = commonPrefixes
    .map((p) => (p.Prefix || "").replace(basePrefix, "").replace(/\/$/, ""))
    // Keep only MM-DD-YYYY
    .filter((name) => /^(\d{2})-(\d{2})-(\d{4})$/.test(name))
    // Filter by last 30 calendar days (inclusive)
    .filter((name) => {
      const dt = toDate(name);
      return dt >= cutoff && dt <= startOfToday;
    })
    // Sort newest first
    .sort((a, b) => toDate(b).getTime() - toDate(a).getTime());
  // Return up to 30 entries in case there are more folders in the window
  const limited = dates.slice(0, 30);
  return new Response(JSON.stringify({ dates: limited }), { status: 200 });
}