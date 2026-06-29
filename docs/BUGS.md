# Cerberus Live Studio — Known Issues

---

## Open

**Test waitlist row in production D1**
The live waitlist D1 holds a test row (`mad.tinker@outlook.com`) from end-to-end verification. Clear it before public launch so the first real signup count is clean.

**Resend confirmation emails not wired**
`emailConfirmations` is false in `features.config.ts`. Waitlist signups land in D1 but no confirmation email goes out. Needs Resend account setup and a Worker send step on `POST /api/waitlist`.

**Deployment enum mismatch**
The registry tags deployment as `cloudflare-pages`, but the real target is Cloudflare Workers serving static assets via OpenNext. The deployment enum lacks a Workers value. Tracked as a registry-schema gap, not a code bug.

**`wrangler dev` / workerd unusable on this Windows box**
Local `wrangler dev` accepts the TCP connection but never returns a response (even a hello-world worker hangs; connections sit in CLOSE_WAIT). Same class of limitation as OpenNext not building on Windows. The media gateway's binding-bound paths (D1, R2) therefore verify at deploy, not locally; pure logic is covered by bun tests. Environmental, not a code bug.

---

## Closed

- RSC origin-host leak (media gateway): the hidden tunnel origin (`media_origin`/`tunnel_url`) serialized into the public dossier's client RSC payload via `ProfileTabs` props. Resolved 2026-06-29: `MediaCtx` reduced to slug + `hasMedia` boolean, and the dossier page scrubs both fields before render. Verified absent in SSR output.
- Media host had no edge cert: `<slug>.media.cerberuslive.studio` (three-level) is not covered by Universal SSL (`cerberuslive.studio` + `*.cerberuslive.studio` only), so media TLS failed with handshake_failure. Resolved 2026-06-29 by moving hidden origins to two-level `t-<slug>.cerberuslive.studio` and fronting media with the gateway worker (OPEN-LOOPS L-045).
- Turnstile incident on the live waitlist: a two-character sitekey transposition (`dS` instead of `Ds`) plus an unset `TURNSTILE_SECRET`, which 403'd every signup. Resolved 2026-06-28, sitekey corrected and secret set, verified end to end.
- Cloudflare account drift and stale resources: resolved 2026-06-28 by auditing, backing up (backup at `Q:\MTW\CloudflareBackup\2026-06-28`), and wiping to a clean slate, then rebuilding the waitlist IaC-style.
- D1 `cerberus-waitlist` schema not applied after wipe: resolved 2026-06-28, schema reapplied and a new Turnstile widget secret wired to the worker.
- features.config.ts typo `territoryClaimsn`: resolved 2026-06-28, renamed to `territoryClaims` (no other references; verified by grep).
- Auth provider decision: resolved 2026-06-28, **Better Auth** chosen (over Clerk / NextAuth). Self-hosted in the OpenNext Worker, links to `artist_profiles.user_id`, magic-link via Resend. Docs reconciled (SPEC, ULTRAPLAN, WBS 1.2.2, Schedule).
- GitHub repo: resolved 2026-06-28 (audit), repo `Mad-Tinker-MTW/cerberuslive` exists and origin/main is pushed; the "not yet created" note was stale.
