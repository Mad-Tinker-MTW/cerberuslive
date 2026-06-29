# Cerberus Live Studio — Deploy Runbook

Take the platform from the committed (unpushed) batch to live on staging, then flip
the domain when ready. Every step here is operator-run (production). Stop after any
step; nothing later depends on doing them in one sitting.

## 0. Pre-flight
- `cd Q:\MTW\cerberuslive && git status` — clean tree, on `main`.
- Confirm CI secret `CLOUDFLARE_API_TOKEN` is set on the GitHub repo (it is — last deploy used it).

## 1. Deploy code to staging
```powershell
cd Q:\MTW\cerberuslive
git push origin main
```
Watch the "Deploy cerberuslive-web" GitHub Action go green (~2-4 min). Deploys to
the staging worker `cerberuslive-web.frankydlp.workers.dev`.

## 2. Apply migrations to PROD D1 (additive; 0002/0003 already applied earlier)
```powershell
cd Q:\MTW\cerberuslive\web
bunx wrangler d1 execute cerberus-waitlist --remote --file=db/0004_media_and_bookings.sql
bunx wrangler d1 execute cerberus-waitlist --remote --file=db/0005_follows.sql
bunx wrangler d1 execute cerberus-waitlist --remote --file=db/0006_reviews.sql
bunx wrangler d1 execute cerberus-waitlist --remote --file=db/0007_play_count.sql
```

## 3. Set yourself up (on the live staging site)
- Sign in at `/login` (your email), claim your dossier, build it in `/account` -> Edit dossier.
- Generate your agent key in `/account` -> Self-host agent.
- Then make yourself admin + managed:
```powershell
cd Q:\MTW\cerberuslive\web
bunx wrangler d1 execute cerberus-waitlist --remote --command "UPDATE user SET role='admin' WHERE email='YOUR_EMAIL'"
bunx wrangler d1 execute cerberus-waitlist --remote --command "UPDATE artist_profiles SET tier='managed' WHERE slug='YOUR_SLUG'"
```
- `/admin` is now reachable.

## 4. Run the agent (put your media live)
```powershell
cd Q:\MTW\CerberusAgent\desktop && bun run tauri dev    # or the built app
```
Paste your agent key, pick X:\Music (or your folder), Go live. Your tracks appear on
your dossier.

## 5. Deliverability + hygiene (recommended before public)
- Add a DMARC record so magic-link mail leaves junk:
  `_dmarc.cerberuslive.studio  TXT  "v=DMARC1; p=none; rua=mailto:admin@cerberuslive.studio"`
- Send a test to `admin@cerberuslive.studio` and confirm it lands in Outlook (managed
  booking notifications route there).
- Optional clean roster: `bunx wrangler d1 execute cerberus-waitlist --remote --file=db/cleanup-seeds.sql`

## 6. Domain cutover (only when happy — this is the public flip)
Reassign the `cerberuslive.studio` Worker Custom Domain from `cerberuslive` (waitlist)
to `cerberuslive-web` (platform) in the Cloudflare dashboard (Workers & Pages ->
cerberuslive-web -> Settings -> Domains), or via API. Reversible. Decide the waitlist
story first (the platform home has no signup form).

## Rollback
- Code: redeploy a prior commit (CI) or revert the domain custom-hostname back to `cerberuslive`.
- Data: D1 Time Travel (`wrangler d1 time-travel`) restores the prod DB to a timestamp.
