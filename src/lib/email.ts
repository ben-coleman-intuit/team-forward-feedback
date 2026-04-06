import nodemailer from "nodemailer";

function getTransport() {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 587;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: user && pass ? { user, pass } : undefined,
  });
}

export async function sendFeedbackConfirmation(params: {
  to: string;
  subjectDisplayName: string;
  submissionId: string;
}): Promise<{ sent: boolean; preview?: string }> {
  const from = process.env.SMTP_FROM || "noreply@localhost";
  const transport = getTransport();

  const textBody = [
    "Thank you — your year-end feedback was received.",
    "",
    `Feedback for: ${params.subjectDisplayName}`,
    `Reference ID: ${params.submissionId}`,
    "",
    "If you did not submit this form, contact your team admin.",
  ].join("\n");

  if (!transport) {
    if (process.env.NODE_ENV === "development") {
      console.info("[email] SMTP not configured; would send to", params.to);
      console.info(textBody);
    }
    return { sent: false, preview: textBody };
  }

  await transport.sendMail({
    from,
    to: params.to,
    subject: `Feedback received — ${params.subjectDisplayName}`,
    text: textBody,
  });

  return { sent: true };
}
