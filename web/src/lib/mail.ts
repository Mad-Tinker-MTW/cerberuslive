// Shared transactional email sender (Resend). Mirrors the magic-link sender in
// auth.ts: logs in dev, no-ops gracefully when RESEND_KEY is absent so flows do
// not 500 when email is not configured (e.g. local dev).

export type MailEnv = { RESEND_KEY?: string };

const FROM = "Cerberus Live Studio <noreply@cerberuslive.studio>";

export type SendResult = { ok: boolean; dev?: boolean; status?: number };

/** Wrap body text in the Cerberus dark email shell. */
export function emailShell(heading: string, bodyHtml: string): string {
  return `
    <div style="font-family:system-ui,sans-serif;background:#050505;color:#f2f2f2;padding:32px;border-radius:12px">
      <h2 style="margin:0 0 12px">${heading}</h2>
      <div style="color:#d8d8d8;line-height:1.6">${bodyHtml}</div>
      <p style="color:#555;font-size:12px;margin:24px 0 0">Cerberus Live Studio</p>
    </div>`;
}

export async function sendEmail(
  env: MailEnv,
  to: string,
  subject: string,
  html: string
): Promise<SendResult> {
  if (process.env.NODE_ENV !== "production") {
    console.log(`[mail] to=${to} subject="${subject}"`);
  }
  if (!env.RESEND_KEY) return { ok: false, dev: true };

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.RESEND_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from: FROM, to, subject, html }),
  });
  if (!res.ok) {
    console.error("[mail] Resend failed", res.status, await res.text());
  }
  return { ok: res.ok, status: res.status };
}
