import { NextRequest } from "next/server";
import { s3Client } from "@/lib/aws";
import { ListObjectsV2Command } from "@aws-sdk/client-s3";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const userId = url.searchParams.get("userId") || "";
  if (!userId) return new Response(JSON.stringify({ error: "Missing userId" }), { status: 400 });

  const bucket = process.env.BACKUPS_BUCKET || "";
  const prefixBase = process.env.BACKUPS_PREFIX || ""; // e.g. backups/
  const prefix = `${prefixBase}${userId}/`;
  if (!bucket) return new Response(JSON.stringify({ files: [] }), { status: 200 });

  const res = await s3Client.send(
    new ListObjectsV2Command({ Bucket: bucket, Prefix: prefix, MaxKeys: 1000 })
  );
  const files = (res.Contents || [])
    .sort((a, b) => (b.LastModified?.getTime() || 0) - (a.LastModified?.getTime() || 0))
    .slice(0, 30)
    .map((o) => o.Key || "");

  return new Response(JSON.stringify({ files }), { status: 200 });
}