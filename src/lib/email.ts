import nodemailer from "nodemailer";
import { sesClient } from "@/lib/aws";
import { SendEmailCommand } from "@aws-sdk/client-ses";

export type MailPayload = {
  to: string;
  subject: string;
  text?: string;
  html?: string;
};

export async function sendMail(payload: MailPayload) {
  const from = process.env.MAIL_FROM || "admin@ezytask.io";
  const useSes = process.env.USE_SES === "true";

  if (useSes) {
    const cmd = new SendEmailCommand({
      Destination: { ToAddresses: [payload.to] },
      Message: {
        Subject: { Data: payload.subject },
        Body: payload.html
          ? { Html: { Data: payload.html } }
          : { Text: { Data: payload.text || "" } },
      },
      Source: from,
    });
    const res = await sesClient.send(cmd);
    return { messageId: res.MessageId };
  }

  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    console.warn("SMTP env vars missing and USE_SES=false; skipping sendMail");
    return { skipped: true } as const;
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });

  const info = await transporter.sendMail({
    from,
    to: payload.to,
    subject: payload.subject,
    text: payload.text,
    html: payload.html,
  });
  return { messageId: info.messageId };
}