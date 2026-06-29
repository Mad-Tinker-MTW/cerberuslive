# Cerberus Media Gateway — Build Plan

**Decided 2026-06-29.** Replaces the per-artist public subdomain model. Outside-the-box
direction chosen by Franky: one gateway Worker + R2 read-through cache, per-artist tunnels
become hidden private origins.

## Why (root cause that killed the old plan)
The old host pattern `<slug>.media.cerberuslive.studio` is THREE levels deep. Cloudflare
Universal SSL covers only `cerberuslive.studio` + `*.cerberuslive.studio` (single-level
wildcard), so that host has no edge cert and TLS dies with handshake_failure (alert 40).
Verified live 2026-06-29 via openssl. The named tunnel + token-handoff path themselves work
(proven in the same PoC). See OPEN-LOOPS L-045.

## Architecture
- **Public face:** `media.cerberuslive.studio/<slug>/<filename>` (two-level, wildcard-covered,
  TLS works today, no ACM). A dedicated plain Worker `cerberus-media` owns it. Routes by PATH,
  not subdomain.
- **Hidden origin:** each artist's named tunnel terminates at `t-<slug>.cerberuslive.studio`
  (two-level, wildcard-covered, never advertised). The gateway fetches from it server-side.
- **R2 read-through cache:** first play pulls from the artist machine and tees into R2; later
  plays serve from R2 at the edge. Breaks the "artist PC must stay on" requirement for hot tracks.
- Named tunnel + `cloudflared tunnel run --token` mechanics unchanged from the PoC; only the
  termination host and the public URL change.

## Build sequence (commit per step)
1. **Gateway worker + migration 0008** (heart, locally testable, deployable on Windows):
   - `media/` new worker dir: wrangler.jsonc (D1 `DB` + R2 `MEDIA`), src/index.ts.
   - Logic: parse slug/filename -> R2 get (Range) -> hit serves 200/206; miss fetches full from
     `https://<media_origin>/<filename>`, puts to R2, serves slice. Origin offline + miss -> 502
     "not yet cached / artist offline".
   - migration 0008: artist_profiles += media_origin TEXT, tunnel_id TEXT, tunnel_token TEXT.
2. **Frontend cutover:** `trackUrl()` builds the gateway URL for source='self' (needs slug +
   MEDIA_BASE), keep tunnel_url column as the liveness signal only.
3. **/api/agent/provision** (session-authed, owner): CF API create tunnel -> configure ingress
   (host t-<slug> -> http://localhost:8787) -> proxied CNAME t-<slug> -> <id>.cfargotunnel.com ->
   store media_origin/tunnel_id/tunnel_token. /account "Set up streaming" button + token reveal.
4. **Agent token mode:** when config has tunnelToken, run `cloudflared tunnel run --token` instead
   of the quick tunnel (Bun engine src/agent.mjs + Tauri desktop). Still POSTs track list to
   /api/agent/register.

## Operator / cloud steps (flagged, not code)
- Create R2 bucket `cerberus-media` (+ local binding for dev).
- CF_API_TOKEN (tunnel + DNS edit scope), CF_ACCOUNT_ID, CF_ZONE_ID as web/media worker secrets/vars.
- DNS: proxied CNAME `media` -> the cerberus-media worker route (or workers.dev custom domain).
- Reuse PoC tunnel 6902efd6 OR delete + let provisioning recreate. The `mad-tinker.media` CNAME is
  dead (un-TLS-able) -> remove.
- No ACM needed (the whole point of the two-level design).
