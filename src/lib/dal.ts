import { ddbDoc } from "@/lib/aws";
import {
  PutCommand,
  GetCommand,
  DeleteCommand,
  QueryCommand,
} from "@aws-sdk/lib-dynamodb";

const ADMIN_TABLE = process.env.DDB_ADMIN_TABLE || "AdminUsers";
const VERIFY_TABLE = process.env.DDB_VERIFY_TABLE || "VerificationCodes";
const RESTORE_TABLE = process.env.DDB_RESTORE_TABLE || "RestoreAttempts";

export async function putVerificationCode(email: string, code: string, ttlSeconds: number) {
  const ttl = Math.floor(Date.now() / 1000) + ttlSeconds;
  await ddbDoc.send(
    new PutCommand({
      TableName: VERIFY_TABLE,
      Item: { email, code, created_at: Date.now(), ttl },
    })
  );
}

export async function getVerificationCode(email: string) {
  const res = await ddbDoc.send(
    new GetCommand({ TableName: VERIFY_TABLE, Key: { email } })
  );
  return (res.Item as { email: string; code: string } | undefined) || undefined;
}

export async function deleteVerificationCode(email: string) {
  await ddbDoc.send(new DeleteCommand({ TableName: VERIFY_TABLE, Key: { email } }));
}

export async function putAdminUser(email: string, fields: Record<string, any>) {
  await ddbDoc.send(
    new PutCommand({ TableName: ADMIN_TABLE, Item: { email, ...fields } })
  );
}

export async function logRestoreAttempt(item: {
  userId: string;
  attempt_ts: number;
  filename: string;
  performed_by: string;
  status: string;
  reason?: string;
}) {
  await ddbDoc.send(new PutCommand({ TableName: RESTORE_TABLE, Item: item }));
}