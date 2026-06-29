// Cerberus Media Gateway — cerberus-media worker.
//
// Public face of all artist media: GET media.cerberuslive.studio/<slug>/<filename>.
// Resolves the artist's hidden tunnel origin (media_origin in D1), R2-reads-through so hot
// tracks survive an offline artist, and streams Range requests so audio scrubs.
//
// Why a separate plain Worker (not a Next route): media is a hot, low-level Range/stream path,
// and a plain Worker builds + deploys on Windows (the OpenNext Next worker cannot). Matches the
// repo's "multiple workers, one D1" shape. See docs/MEDIA-GATEWAY-PLAN.md and OPEN-LOOPS L-045.

import { guessType, baseHeaders, parseRange, serveBuffer, type ByteRange } from "./media";

export interface Env {
  DB: D1Database;
  MEDIA: R2Bucket;
}

// Above this, don't buffer the whole object into the Worker to cache it — proxy the Range
// straight through from origin instead (covers long DJ/live sets). Music tracks fall well under.
const CACHE_MAX_BYTES = 100 * 1024 * 1024;

// Serve from the R2 cache if the object is present. Returns null on a cache miss.
async function serveFromR2(
  env: Env,
  key: string,
  range: ByteRange | null,
  isHead: boolean,
): Promise<Response | null> {
  if (range) {
    const length = range.end !== undefined ? range.end - range.start + 1 : undefined;
    const obj = await env.MEDIA.get(key, { range: { offset: range.start, length } });
    if (!obj) return null;
    const total = obj.size; // full object size, regardless of the requested range
    const end = range.end !== undefined ? range.end : total - 1;
    const headers = baseHeaders(obj.httpMetadata?.contentType);
    headers.set("Content-Range", `bytes ${range.start}-${end}/${total}`);
    headers.set("Content-Length", String(end - range.start + 1));
    return new Response(isHead ? null : obj.body, { status: 206, headers });
  }
  const obj = await env.MEDIA.get(key);
  if (!obj) return null;
  const headers = baseHeaders(obj.httpMetadata?.contentType);
  headers.set("Content-Length", String(obj.size));
  return new Response(isHead ? null : obj.body, { status: 200, headers });
}

export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    const isHead = req.method === "HEAD";
    if (req.method !== "GET" && !isHead) return new Response("method not allowed", { status: 405 });

    const url = new URL(req.url);
    const segs = url.pathname.replace(/^\/+/, "").split("/");
    if (segs.length < 2) return new Response("not found", { status: 404 });
    const slug = decodeURIComponent(segs[0]);
    const filename = decodeURIComponent(segs.slice(1).join("/"));
    if (!slug || !filename || filename.includes("..")) return new Response("bad request", { status: 400 });

    const row = await env.DB
      .prepare("SELECT media_origin, gate_status FROM artist_profiles WHERE slug = ? LIMIT 1")
      .bind(slug)
      .first<{ media_origin: string | null; gate_status: string | null }>();
    if (!row) return new Response("unknown artist", { status: 404 });
    if (row.gate_status === "gated") return new Response("artist gated", { status: 403 });

    const key = `${slug}/${filename}`;
    const range = parseRange(req.headers.get("range"));

    // 1) R2 cache.
    const cached = await serveFromR2(env, key, range, isHead);
    if (cached) return cached;

    // 2) Cache miss -> origin. No origin host means the artist has never provisioned / is offline.
    const origin = row.media_origin;
    if (!origin) return new Response("media not yet cached and artist offline", { status: 502 });
    const originUrl = `https://${origin}/${encodeURIComponent(filename)}`;

    // Size gate: large objects (live sets) stream through with Range pass-through, uncached.
    let size = 0;
    try {
      const head = await fetch(originUrl, { method: "HEAD" });
      if (!head.ok) return new Response("origin error", { status: 502 });
      size = parseInt(head.headers.get("content-length") || "0", 10);
    } catch {
      return new Response("artist offline and not cached", { status: 502 });
    }

    if (size > CACHE_MAX_BYTES) {
      const passHeaders = new Headers();
      const rangeHeader = req.headers.get("range");
      if (rangeHeader) passHeaders.set("Range", rangeHeader);
      const r = await fetch(originUrl, { method: req.method, headers: passHeaders });
      const headers = baseHeaders(r.headers.get("content-type") || guessType(filename));
      for (const h of ["Content-Range", "Content-Length"]) {
        const v = r.headers.get(h);
        if (v) headers.set(h, v);
      }
      return new Response(isHead ? null : r.body, { status: r.status, headers });
    }

    // Small object: fetch full, fill R2, serve the requested range from the buffer.
    let originRes: Response;
    try {
      originRes = await fetch(originUrl);
    } catch {
      return new Response("artist offline and not cached", { status: 502 });
    }
    if (!originRes.ok || !originRes.body) return new Response("origin error", { status: 502 });
    const buf = await originRes.arrayBuffer();
    const contentType = originRes.headers.get("content-type") || guessType(filename);
    await env.MEDIA.put(key, buf, { httpMetadata: { contentType } });
    return serveBuffer(buf, contentType, range, isHead);
  },
};
