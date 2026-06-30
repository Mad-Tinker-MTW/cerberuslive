import { getCloudflareContext } from "@opennextjs/cloudflare";

// Live providers (L-048, Phase 6). Two products by tier:
//   window -> Cloudflare Realtime (Calls SFU)  : free, capped, near-zero cost
//   event  -> Cloudflare Stream Live (RTMP/HLS): managed, metered, fee-covered
//
// Both need account resources + secrets the OPERATOR provisions (they cannot be created
// headless): CF_REALTIME_APP_ID / CF_REALTIME_APP_TOKEN for Realtime; CF_API_TOKEN (with
// Stream:Edit) + CF_ACCOUNT_ID for Stream. When unset, the live-status surface still works
// (go-live / end-live / LIVE badge); only the actual media path returns "not configured".

type LiveEnv = {
  CF_REALTIME_APP_ID?: string;
  CF_REALTIME_APP_TOKEN?: string;
  CF_API_TOKEN?: string;
  CF_ACCOUNT_ID?: string;
};

function liveEnv(): LiveEnv {
  return getCloudflareContext().env as unknown as LiveEnv;
}

export function realtimeConfigured(): boolean {
  const e = liveEnv();
  return Boolean(e.CF_REALTIME_APP_ID && e.CF_REALTIME_APP_TOKEN);
}

export function streamConfigured(): boolean {
  const e = liveEnv();
  return Boolean(e.CF_API_TOKEN && e.CF_ACCOUNT_ID);
}

/** Create a Cloudflare Realtime (Calls) SFU session. The app token stays server-side; the
 *  browser negotiates tracks through our /api/live/rtc proxy, never seeing the token. */
export async function createRealtimeSession(): Promise<string> {
  const e = liveEnv();
  const res = await fetch(`https://rtc.live.cloudflare.com/v1/apps/${e.CF_REALTIME_APP_ID}/sessions/new`, {
    method: "POST",
    headers: { Authorization: `Bearer ${e.CF_REALTIME_APP_TOKEN}` },
  });
  if (!res.ok) throw new Error(`Realtime session create failed: ${res.status}`);
  const data = (await res.json()) as { sessionId: string };
  return data.sessionId;
}

/** Proxy a Realtime tracks/new (publish or subscribe negotiation) to the SFU, keeping the
 *  app token server-side. `path` is the API suffix after the session id. */
export async function realtimeProxy(
  sessionId: string,
  path: string,
  body: unknown,
  method: "POST" | "PUT" = "POST"
): Promise<Response> {
  const e = liveEnv();
  const url = `https://rtc.live.cloudflare.com/v1/apps/${e.CF_REALTIME_APP_ID}/sessions/${sessionId}/${path}`;
  return fetch(url, {
    method,
    headers: { Authorization: `Bearer ${e.CF_REALTIME_APP_TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

/** Create a Stream Live input (managed event). Returns RTMP creds for the artist's encoder
 *  and the playback uid for the HLS viewer embed. */
export async function createStreamLiveInput(
  name: string
): Promise<{ uid: string; rtmpUrl: string; streamKey: string }> {
  const e = liveEnv();
  const res = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${e.CF_ACCOUNT_ID}/stream/live_inputs`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${e.CF_API_TOKEN}`, "Content-Type": "application/json" },
      body: JSON.stringify({ meta: { name }, recording: { mode: "automatic" } }),
    }
  );
  if (!res.ok) throw new Error(`Stream live input create failed: ${res.status}`);
  const data = (await res.json()) as {
    result: { uid: string; rtmps?: { url: string; streamKey: string } };
  };
  const r = data.result;
  return { uid: r.uid, rtmpUrl: r.rtmps?.url ?? "", streamKey: r.rtmps?.streamKey ?? "" };
}
