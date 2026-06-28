# Cerberus Live Studio — Known Issues

---

## Open

**Test waitlist row in production D1**
The live waitlist D1 holds a test row (`mad.tinker@outlook.com`) from end-to-end verification. Clear it before public launch so the first real signup count is clean.

**GitHub repo not yet created**
The project is homed locally at `Q:\MTW\cerberuslive` and registered in TinkerOps as `Mad-Tinker-MTW/cerberuslive`, but the remote repo does not exist yet and nothing has been pushed. Create the repo and push the IaC relaunch commit.

**Resend confirmation emails not wired**
`emailConfirmations` is false in `features.config.ts`. Waitlist signups land in D1 but no confirmation email goes out. Needs Resend account setup and a Worker send step on `POST /api/waitlist`.

**Auth provider not chosen**
The platform stack lists "Clerk or NextAuth" for auth. The choice is unresolved and gates the entire Phase 1 sign-up, log-in, and verify flow. Decide before scaffolding the Next.js app.

**features.config.ts typo: territoryClaimsn**
The Phase 3 flag is misspelled `territoryClaimsn` (trailing n). Rename to `territoryClaims` before any code gates on it, or the gate will reference a key that does not match the documented feature name.

**Deployment enum mismatch**
The registry tags deployment as `cloudflare-pages`, but the real target is Cloudflare Workers serving static assets via OpenNext. The deployment enum lacks a Workers value. Tracked as a registry-schema gap, not a code bug.

---

## Closed

- Turnstile incident on the live waitlist: a two-character sitekey transposition (`dS` instead of `Ds`) plus an unset `TURNSTILE_SECRET`, which 403'd every signup. Resolved 2026-06-28, sitekey corrected and secret set, verified end to end.
- Cloudflare account drift and stale resources: resolved 2026-06-28 by auditing, backing up (backup at `Q:\MTW\CloudflareBackup\2026-06-28`), and wiping to a clean slate, then rebuilding the waitlist IaC-style.
- D1 `cerberus-waitlist` schema not applied after wipe: resolved 2026-06-28, schema reapplied and a new Turnstile widget secret wired to the worker.
