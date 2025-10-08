import { NextRequest } from "next/server";
import { STSClient, GetCallerIdentityCommand } from "@aws-sdk/client-sts";
import {
  IAMClient,
  ListAttachedUserPoliciesCommand,
  ListUserPoliciesCommand,
} from "@aws-sdk/client-iam";

export async function GET(_req: NextRequest) {
  try {
    const region = process.env.AWS_REGION || "us-east-1";
    const sts = new STSClient({ region });
    const identity = await sts.send(new GetCallerIdentityCommand({}));

    const iam = new IAMClient({ region });
    const arn = identity.Arn || "";
    const usernameMatch = arn.match(/user\/(.+)$/);
    let hasRestore = false;
    if (usernameMatch) {
      const userName = usernameMatch[1];
      const attached = await iam.send(
        new ListAttachedUserPoliciesCommand({ UserName: userName })
      );
      hasRestore = (attached.AttachedPolicies || []).some(
        (p) => (p.PolicyName || "").toLowerCase().includes("restorebackup")
      );
      if (!hasRestore) {
        const inline = await iam.send(new ListUserPoliciesCommand({ UserName: userName }));
        hasRestore = (inline.PolicyNames || []).some((n) => n.toLowerCase().includes("restorebackup"));
      }
    }

    return new Response(
      JSON.stringify({ ok: true, identity, hasRestoreBackup: hasRestore }),
      { status: 200 }
    );
  } catch (err) {
    return new Response(JSON.stringify({ ok: false, error: String(err) }), {
      status: 500,
    });
  }
}
