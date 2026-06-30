"use client";

// Browser WebRTC client for the free live "window" (Cloudflare Realtime / Calls SFU).
// All SFU calls go through /api/live/rtc so the app token never reaches the browser.
//
// NOTE: this is implemented against the documented Calls REST flow but is OPERATOR-GATED
// and NOT yet verified end-to-end — it needs CF_REALTIME_APP_ID/TOKEN set and two real
// devices (a camera publisher + a viewer). Tracked as live-verification target state.

type SfuAnswer = {
  sessionDescription?: { type: string; sdp: string };
  requiresImmediateRenegotiation?: boolean;
};

const ICE = { iceServers: [{ urls: "stun:stun.cloudflare.com:3478" }], bundlePolicy: "max-bundle" as RTCBundlePolicy };

async function rtc(slug: string, op: string, sessionId?: string, payload?: unknown): Promise<SfuAnswer & { sessionId?: string }> {
  const r = await fetch("/api/live/rtc", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ slug, op, sessionId, payload }),
  });
  if (!r.ok) throw new Error(`rtc ${op} failed: ${r.status}`);
  return r.json();
}

function iceComplete(pc: RTCPeerConnection): Promise<void> {
  return new Promise((resolve) => {
    if (pc.iceGatheringState === "complete") return resolve();
    const check = () => {
      if (pc.iceGatheringState === "complete") {
        pc.removeEventListener("icegatheringstatechange", check);
        resolve();
      }
    };
    pc.addEventListener("icegatheringstatechange", check);
    setTimeout(resolve, 3000); // fall back to whatever candidates we have
  });
}

/** Publish a local camera/mic stream into the artist's window session. Tracks are named by
 *  kind ('video'/'audio') so viewers can pull them. Returns the peer connection. */
export async function publishWindow(
  slug: string,
  sessionId: string,
  stream: MediaStream,
  maxBitrateKbps?: number
): Promise<RTCPeerConnection> {
  const pc = new RTCPeerConnection(ICE);
  stream.getTracks().forEach((t) => pc.addTrack(t, stream));
  await pc.setLocalDescription(await pc.createOffer());
  await iceComplete(pc);
  const senders = pc.getTransceivers().filter((tr) => tr.sender.track);
  const tracks = senders.map((tr) => ({ location: "local", mid: tr.mid, trackName: tr.sender.track!.kind }));
  const ans = await rtc(slug, "tracks", sessionId, {
    sessionDescription: { type: "offer", sdp: pc.localDescription!.sdp },
    tracks,
  });
  if (ans.sessionDescription) await pc.setRemoteDescription(ans.sessionDescription as RTCSessionDescriptionInit);
  // Cap the outbound video bitrate to the tier ceiling (best-effort; applied post-negotiation).
  if (maxBitrateKbps) {
    const vSender = pc.getSenders().find((s) => s.track?.kind === "video");
    if (vSender) {
      const params = vSender.getParameters();
      if (!params.encodings || params.encodings.length === 0) params.encodings = [{}];
      params.encodings[0].maxBitrate = maxBitrateKbps * 1000;
      try {
        await vSender.setParameters(params);
      } catch {
        /* some browsers reject mid-call; non-fatal */
      }
    }
  }
  return pc;
}

/** Subscribe to an artist's live window. Returns a MediaStream to attach to a <video>. */
export async function watchWindow(slug: string, publisherSessionId: string): Promise<{ pc: RTCPeerConnection; stream: MediaStream }> {
  const made = await rtc(slug, "session");
  const sessionId = made.sessionId!;
  const pc = new RTCPeerConnection(ICE);
  const stream = new MediaStream();
  pc.addEventListener("track", (e) => stream.addTrack(e.track));
  const pull = await rtc(slug, "tracks", sessionId, {
    tracks: [
      { location: "remote", sessionId: publisherSessionId, trackName: "video" },
      { location: "remote", sessionId: publisherSessionId, trackName: "audio" },
    ],
  });
  if (pull.requiresImmediateRenegotiation && pull.sessionDescription) {
    await pc.setRemoteDescription(pull.sessionDescription as RTCSessionDescriptionInit);
    await pc.setLocalDescription(await pc.createAnswer());
    await iceComplete(pc);
    await rtc(slug, "renegotiate", sessionId, {
      sessionDescription: { type: "answer", sdp: pc.localDescription!.sdp },
    });
  }
  return { pc, stream };
}
