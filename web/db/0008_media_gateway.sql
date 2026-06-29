-- Cerberus Live Studio — media gateway origins (per-artist named tunnels)
-- Additive. Applied to the shared cerberus-waitlist D1.
--
-- The gateway Worker (cerberus-media) serves media.cerberuslive.studio/<slug>/<file>,
-- resolving each artist's hidden tunnel origin from media_origin and R2-caching the bytes.
-- tunnel_id / tunnel_token are what /api/agent/provision stores after creating the named
-- tunnel via the Cloudflare API; the agent runs `cloudflared tunnel run --token <tunnel_token>`.

ALTER TABLE artist_profiles ADD COLUMN media_origin TEXT;  -- hidden origin host, e.g. t-<slug>.cerberuslive.studio
ALTER TABLE artist_profiles ADD COLUMN tunnel_id    TEXT;  -- Cloudflare named-tunnel UUID
ALTER TABLE artist_profiles ADD COLUMN tunnel_token TEXT;  -- cloudflared run token handed to the agent
