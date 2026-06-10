import "server-only";

type SendVerificationEmailInput = {
  email: string;
  name: string;
  verificationUrl: string;
};

type SendPasswordResetEmailInput = {
  email: string;
  name: string;
  resetUrl: string;
};

async function sendEmail(payload: {
  to: string;
  subject: string;
  html: string;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM ?? "MyBookmark <onboarding@resend.dev>";

  if (!apiKey) {
    throw new Error("RESEND_API_KEY is not configured.");
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [payload.to],
      subject: payload.subject,
      html: payload.html,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Email delivery failed: ${body}`);
  }
}

export async function sendVerificationEmail({
  email,
  name,
  verificationUrl,
}: SendVerificationEmailInput) {
  await sendEmail({
    to: email,
    subject: "Verify your MyBookmark email",
    html: `
        <div style="background:#f8fafc;padding:32px 16px;font-family:Arial,sans-serif;color:#0f172a">
          <div style="max-width:560px;margin:0 auto;background:#ffffff;border:1px solid #e2e8f0;border-radius:12px;padding:32px">
            <p style="margin:0;color:#4f46e5;font-weight:700">MyBookmark</p>
            <h1 style="font-size:26px;margin:18px 0 12px">Verify your email</h1>
            <p style="line-height:1.6;color:#475569">Hi ${escapeHtml(name)}, confirm your email address to activate your account and start publishing bookmarks.</p>
            <a href="${verificationUrl}" style="display:inline-block;margin-top:18px;background:#4f46e5;color:#ffffff;text-decoration:none;padding:12px 18px;border-radius:8px;font-weight:700">Verify email address</a>
            <p style="margin-top:24px;font-size:13px;line-height:1.6;color:#64748b">This link expires in 24 hours. If you did not create this account, you can ignore this email.</p>
          </div>
        </div>
      `,
  });
}

export async function sendPasswordResetEmail({
  email,
  name,
  resetUrl,
}: SendPasswordResetEmailInput) {
  await sendEmail({
    to: email,
    subject: "Reset your MyBookmark password",
    html: `
      <div style="background:#f8fafc;padding:32px 16px;font-family:Arial,sans-serif;color:#0f172a">
        <div style="max-width:560px;margin:0 auto;background:#ffffff;border:1px solid #e2e8f0;border-radius:12px;padding:32px">
          <p style="margin:0;color:#4f46e5;font-weight:700">MyBookmark</p>
          <h1 style="font-size:26px;margin:18px 0 12px">Reset your password</h1>
          <p style="line-height:1.6;color:#475569">Hi ${escapeHtml(name)}, use this secure link to set a new MyBookmark password.</p>
          <a href="${resetUrl}" style="display:inline-block;margin-top:18px;background:#4f46e5;color:#ffffff;text-decoration:none;padding:12px 18px;border-radius:8px;font-weight:700">Reset password</a>
          <p style="margin-top:24px;font-size:13px;line-height:1.6;color:#64748b">This link expires in 1 hour. If you did not request it, you can ignore this email.</p>
        </div>
      </div>
    `,
  });
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
