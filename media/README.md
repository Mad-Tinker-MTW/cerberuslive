# cerberus-media — Media Gateway Worker

The public face of all artist media. One plain Cloudflare Worker, bound to the shared D1 and an
R2 cache bucket. Unlike the OpenNext Next worker, a plain Worker builds and deploys from Windows.

## What it does
`GET media.cerberuslive.studio/<slug>/<filename>`:
1. Resolves the artist's hidden tunnel origin (`artist_profiles.media_origin`) from D1; 404 if
   unknown, 403 if gated.
2. Serves from the R2 cache (`MEDIA`) if present, Range-aware (200 / 206), so audio scrubs.
3. On a cache miss, fetches from the origin (`https://<media_origin>/<filename>`), fills R2, and
   serves the requested range. Objects over 100 MB stream through with Range pass-through, uncached
   (covers long live sets). Origin offline + not cached → 502 (graceful: the player degrades).

The per-artist origin is a named cloudflared tunnel terminating at the two-level, wildcard-covered
host `t-<slug>.cerberuslive.studio` (never advertised). The public never hits it directly.

See `../docs/MEDIA-GATEWAY-PLAN.md` for the why (the third-level-subdomain TLS trap) and the full
architecture.

## Dev / test
```
bun install
bun test        # pure Range/header logic (workerd/wrangler dev does not run on this Windows box)
bun run typecheck
```

## Deploy (operator)
Prerequisites, one time:
- Create the R2 bucket: `bunx wrangler r2 bucket create cerberus-media`
- Deploy: `bunx wrangler deploy`
- Route the public host: add a proxied DNS record + a Worker custom domain/route for
  `media.cerberuslive.studio` → this worker.

The D1 binding already points at the shared `cerberus-waitlist` database (id in wrangler.jsonc).
