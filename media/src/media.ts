// Pure media helpers for the gateway worker — no binding dependencies, so they unit-test
// under `bun test` (workerd/wrangler dev is unusable on this Windows box). The binding-bound
// paths (D1 lookup, R2 read-through) live in index.ts and are verified at deploy.

const MIME: Record<string, string> = {
  mp3: "audio/mpeg", wav: "audio/wav", flac: "audio/flac",
  m4a: "audio/mp4", ogg: "audio/ogg", aac: "audio/aac",
};

export function guessType(name: string): string {
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  return MIME[ext] ?? "application/octet-stream";
}

export function baseHeaders(contentType: string | undefined): Headers {
  const h = new Headers();
  h.set("Content-Type", contentType || "application/octet-stream");
  h.set("Accept-Ranges", "bytes");
  h.set("Access-Control-Allow-Origin", "*");
  h.set("Cache-Control", "public, max-age=3600");
  return h;
}

export type ByteRange = { start: number; end?: number };

export function parseRange(header: string | null): ByteRange | null {
  if (!header) return null;
  const m = /^bytes=(\d+)-(\d*)$/.exec(header.trim());
  if (!m) return null;
  return { start: parseInt(m[1], 10), end: m[2] ? parseInt(m[2], 10) : undefined };
}

// Build the response from an already-fetched full buffer (used right after a cache fill).
export function serveBuffer(
  buf: ArrayBuffer,
  contentType: string,
  range: ByteRange | null,
  isHead: boolean,
): Response {
  const total = buf.byteLength;
  if (range) {
    const end = range.end !== undefined ? Math.min(range.end, total - 1) : total - 1;
    const slice = buf.slice(range.start, end + 1);
    const headers = baseHeaders(contentType);
    headers.set("Content-Range", `bytes ${range.start}-${end}/${total}`);
    headers.set("Content-Length", String(end - range.start + 1));
    return new Response(isHead ? null : slice, { status: 206, headers });
  }
  const headers = baseHeaders(contentType);
  headers.set("Content-Length", String(total));
  return new Response(isHead ? null : buf, { status: 200, headers });
}
