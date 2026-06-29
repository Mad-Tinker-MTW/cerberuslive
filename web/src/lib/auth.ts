import { betterAuth, type BetterAuthOptions } from "better-auth";
import { magicLink } from "better-auth/plugins/magic-link";
import { username } from "better-auth/plugins";
import { twoFactor } from "better-auth/plugins/two-factor";
import { nextCookies } from "better-auth/next-js";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import type { D1Database } from "@cloudflare/workers-types";

// Auth runs on the cerberuslive-web Worker. The D1 binding and secrets are only
// available per-request via getCloudflareContext, so the Better Auth instance is
// built per-request through getAuth(env) / authFromContext() rather than at module load.

export type AuthEnv = {
  DB: D1Database;
  BETTER_AUTH_SECRET: string;
  RESEND_KEY?: string;
  BETTER_AUTH_URL?: string;
};

const FROM = "Cerberus Live Studio <noreply@cerberuslive.studio>";

async function sendMagicLinkEmail(env: AuthEnv, email: string, url: string) {
  // In dev, log the link so the flow can be completed without email delivery.
  if (process.env.NODE_ENV !== "production") {
    console.log(`[magic-link] ${email} -> ${url}`);
  }
  if (!env.RESEND_KEY) return;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.RESEND_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: FROM,
      to: email,
      subject: "Your Cerberus Live sign-in link",
      html: `
        <div style="font-family:system-ui,sans-serif;background:#050505;color:#f2f2f2;padding:32px;border-radius:12px">
          <h2 style="margin:0 0 8px">Cerberus Live Studio</h2>
          <p style="color:#8f8f8f;margin:0 0 20px">Click to sign in. This link expires in 5 minutes.</p>
          <a href="${url}" style="display:inline-block;background:#d71920;color:#fff;text-decoration:none;padding:12px 22px;border-radius:8px;font-weight:600">Sign in</a>
          <p style="color:#555;font-size:12px;margin:20px 0 0">If you did not request this, ignore this email.</p>
        </div>`,
    }),
  });
  if (!res.ok) {
    console.error("[magic-link] Resend failed", res.status, await res.text());
  }
}

export function getAuth(env: AuthEnv) {
  return betterAuth({
    // D1 is detected by the kysely adapter (batch/exec/prepare) and wired to its
    // own D1SqliteDialect; sqlite mode stores dates as ISO text, booleans as 0/1.
    database: env.DB as unknown as BetterAuthOptions["database"],
    secret: env.BETTER_AUTH_SECRET,
    baseURL: env.BETTER_AUTH_URL, // undefined => inferred from the request origin
    // Magic-link is the default path; email+password is enabled so the seeded owner account
    // (username mad.tinker) can sign in with a password. Open signup matches the magic-link model.
    emailAndPassword: { enabled: true },
    user: {
      additionalFields: {
        role: {
          type: "string",
          required: false,
          defaultValue: "fan",
          input: false, // set server-side, not from the client
        },
      },
    },
    plugins: [
      username(), // owner/admin sign-in by username + password
      twoFactor({ issuer: "Cerberus Control Deck" }), // authenticator TOTP for the owner
      magicLink({
        sendMagicLink: async ({ email, url }) => {
          await sendMagicLinkEmail(env, email, url);
        },
      }),
      nextCookies(), // keep last: writes auth cookies on Next responses
    ],
  });
}

/** Build the per-request Better Auth instance from the Cloudflare context. */
export function authFromContext() {
  const { env } = getCloudflareContext();
  return getAuth(env as unknown as AuthEnv);
}
