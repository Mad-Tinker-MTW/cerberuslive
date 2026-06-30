import { test, expect } from "bun:test";
import { guessType, baseHeaders, parseRange, serveBuffer } from "../src/media";

function makeBuf(n: number): ArrayBuffer {
  const a = new Uint8Array(n);
  for (let i = 0; i < n; i++) a[i] = i % 256;
  return a.buffer;
}

test("guessType maps audio extensions, falls back to octet-stream", () => {
  expect(guessType("Chaos Dancer.mp3")).toBe("audio/mpeg");
  expect(guessType("set.FLAC")).toBe("audio/flac");
  expect(guessType("a.m4a")).toBe("audio/mp4");
  expect(guessType("weird.xyz")).toBe("application/octet-stream");
  expect(guessType("noext")).toBe("application/octet-stream");
});

test("baseHeaders sets streaming + CORS defaults", () => {
  const h = baseHeaders("audio/mpeg");
  expect(h.get("Content-Type")).toBe("audio/mpeg");
  expect(h.get("Accept-Ranges")).toBe("bytes");
  expect(h.get("Access-Control-Allow-Origin")).toBe("*");
  expect(baseHeaders(undefined).get("Content-Type")).toBe("application/octet-stream");
});

test("parseRange handles closed, open, missing, and malformed", () => {
  expect(parseRange(null)).toBeNull();
  expect(parseRange("bytes=0-99")).toEqual({ start: 0, end: 99 });
  expect(parseRange("bytes=100-")).toEqual({ start: 100, end: undefined });
  expect(parseRange("bytes=abc-def")).toBeNull();
  expect(parseRange("kilobytes=0-1")).toBeNull();
});

test("serveBuffer full GET -> 200 with full length and exact bytes", async () => {
  const buf = makeBuf(1000);
  const res = serveBuffer(buf, "audio/mpeg", null, false);
  expect(res.status).toBe(200);
  expect(res.headers.get("Content-Length")).toBe("1000");
  expect(res.headers.get("Content-Range")).toBeNull();
  expect(new Uint8Array(await res.arrayBuffer()).length).toBe(1000);
});

test("serveBuffer closed range -> 206 with correct slice + headers", async () => {
  const buf = makeBuf(1000);
  const res = serveBuffer(buf, "audio/mpeg", { start: 10, end: 19 }, false);
  expect(res.status).toBe(206);
  expect(res.headers.get("Content-Range")).toBe("bytes 10-19/1000");
  expect(res.headers.get("Content-Length")).toBe("10");
  const bytes = new Uint8Array(await res.arrayBuffer());
  expect(bytes.length).toBe(10);
  expect(Array.from(bytes)).toEqual([10, 11, 12, 13, 14, 15, 16, 17, 18, 19]);
});

test("serveBuffer open-ended range -> 206 to end of object", async () => {
  const buf = makeBuf(1000);
  const res = serveBuffer(buf, "audio/mpeg", { start: 990, end: undefined }, false);
  expect(res.status).toBe(206);
  expect(res.headers.get("Content-Range")).toBe("bytes 990-999/1000");
  expect(res.headers.get("Content-Length")).toBe("10");
});

test("serveBuffer clamps an over-long range end to the last byte", async () => {
  const buf = makeBuf(1000);
  const res = serveBuffer(buf, "audio/mpeg", { start: 0, end: 99999 }, false);
  expect(res.status).toBe(206);
  expect(res.headers.get("Content-Range")).toBe("bytes 0-999/1000");
  expect(res.headers.get("Content-Length")).toBe("1000");
});

test("serveBuffer HEAD -> headers without a body", async () => {
  const buf = makeBuf(1000);
  const res = serveBuffer(buf, "audio/mpeg", { start: 0, end: 99 }, true);
  expect(res.status).toBe(206);
  expect(res.headers.get("Content-Length")).toBe("100");
  expect(new Uint8Array(await res.arrayBuffer()).length).toBe(0);
});

test("guessType maps video extensions (L-048 video lane)", () => {
  expect(guessType("set.mp4")).toBe("video/mp4");
  expect(guessType("clip.WEBM")).toBe("video/webm");
  expect(guessType("a.mov")).toBe("video/quicktime");
});
