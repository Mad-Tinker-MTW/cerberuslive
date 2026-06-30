"use client";

import { useEffect, useRef, useState } from "react";
import { publishWindow } from "@/lib/realtime-client";

// Stage mode (music): stereo, voice DSP OFF so music isn't pumped/ducked. Mic mode (spoken):
// mono, light noise suppression OK. Resolution toggle: 480p (lighter) / 720p (the face is the show).
function buildConstraints(
  mode: "stage" | "mic",
  deviceId: string,
  resolution: "480" | "720"
): MediaStreamConstraints {
  const stage = mode === "stage";
  const height = resolution === "720" ? 720 : 480;
  return {
    audio: {
      ...(deviceId ? { deviceId: { exact: deviceId } } : {}),
      echoCancellation: !stage,
      noiseSuppression: !stage,
      autoGainControl: !stage,
      channelCount: stage ? 2 : 1,
    },
    video: { width: { ideal: Math.round((height * 16) / 9) }, height: { ideal: height } },
  };
}

// Artist go-live control (L-048, Phase 6). Free "window" = WebRTC camera broadcast (capped);
// managed "event" = Cloudflare Stream Live (returns RTMP creds for an encoder like OBS).
// The window media path needs operator Realtime creds; without them the LIVE status still
// works (presence/announcement) and the control says streaming isn't configured.

type StartResp = {
  ok?: boolean;
  error?: string;
  kind?: string;
  sessionId?: string | null;
  realtimeConfigured?: boolean;
  viewerCap?: number;
  minutesCap?: number;
  maxBitrateKbps?: number;
  rtmpUrl?: string;
  streamKey?: string;
  playbackId?: string;
};

export function LiveControl({
  slug,
  tier,
  initialKind,
  weeklyMinutes,
  usedMinutes,
  viewerCap,
  sessionMaxMinutes,
  mode,
}: {
  slug: string;
  tier: string;
  initialKind: "window" | "event" | null;
  weeklyMinutes: number | null;
  usedMinutes: number;
  viewerCap: number;
  sessionMaxMinutes: number;
  mode: "stage" | "mic";
}) {
  const remainingMinutes = weeklyMinutes != null ? Math.max(0, weeklyMinutes - usedMinutes) : null;
  const usedPct = weeklyMinutes ? Math.min(100, Math.round((usedMinutes / weeklyMinutes) * 100)) : 0;
  const [audioDevices, setAudioDevices] = useState<MediaDeviceInfo[]>([]);
  const [audioDeviceId, setAudioDeviceId] = useState("");
  const [resolution, setResolution] = useState<"480" | "720">(mode === "stage" ? "480" : "480");

  // Enumerate audio inputs so the artist can pick their mixer/interface, not a room mic. Labels are
  // only populated after a getUserMedia permission grant, so we also re-enumerate on going live.
  async function refreshDevices() {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      setAudioDevices(devices.filter((d) => d.kind === "audioinput"));
    } catch {
      /* ignore */
    }
  }
  useEffect(() => {
    void refreshDevices();
  }, []);
  const [status, setStatus] = useState<"off" | "window" | "event">(initialKind ?? "off");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [note, setNote] = useState("");
  const [rtmp, setRtmp] = useState<{ url: string; key: string } | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);

  function cleanupMedia() {
    pcRef.current?.close();
    pcRef.current = null;
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
  }
  useEffect(() => () => cleanupMedia(), []);

  async function start(kind: "window" | "event") {
    setBusy(true);
    setError("");
    setNote("");
    setRtmp(null);
    try {
      const res = await fetch("/api/live", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ op: "start", kind }),
      });
      const data = (await res.json()) as StartResp;
      if (!res.ok || !data.ok) {
        setError(data.error || "Could not go live.");
        return;
      }
      setStatus(kind);
      if (kind === "event") {
        setRtmp({ url: data.rtmpUrl || "", key: data.streamKey || "" });
        setNote("You're live. Point your encoder (OBS) at the RTMP URL + key below.");
        return;
      }
      // window
      setNote(
        `Live window open (cap ${data.viewerCap} viewers / ${data.minutesCap} min).` +
          (data.realtimeConfigured ? "" : " Video streaming is not configured yet, but your dossier shows you live.")
      );
      if (data.realtimeConfigured && data.sessionId) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia(
            buildConstraints(mode, audioDeviceId, resolution)
          );
          streamRef.current = stream;
          if (videoRef.current) videoRef.current.srcObject = stream;
          void refreshDevices(); // labels are available now that permission was granted
          pcRef.current = await publishWindow(slug, data.sessionId, stream, {
            maxBitrateKbps: data.maxBitrateKbps,
            maxAudioKbps: mode === "stage" ? 128 : 64,
            stereo: mode === "stage",
          });
        } catch (e) {
          setError("Camera/publish error: " + (e as Error).message);
        }
      }
    } catch {
      setError("Network error.");
    } finally {
      setBusy(false);
    }
  }

  async function stop() {
    setBusy(true);
    cleanupMedia();
    try {
      await fetch("/api/live", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ op: "stop" }),
      });
    } catch {
      /* ignore */
    }
    setStatus("off");
    setRtmp(null);
    setNote("");
    setBusy(false);
  }

  return (
    <div className="rounded-xl border border-border bg-panel p-5">
      <div className="mb-3 flex items-center gap-2">
        <h2 className="text-xs uppercase tracking-widest text-muted">Go live</h2>
        {status !== "off" && (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-red/50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-red">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-red" /> Live
          </span>
        )}
      </div>

      {/* Weekly live-minute budget (free / self-managed+). Managed is unmetered. */}
      <div className="mb-4 rounded-lg border border-border bg-panel-soft px-3 py-2.5 text-xs">
        {remainingMinutes != null ? (
          <>
            <div className="flex items-center justify-between text-muted">
              <span className="uppercase tracking-widest">Weekly live budget</span>
              <span>
                <span className="font-semibold text-foreground">{remainingMinutes}</span> of {weeklyMinutes} min left
              </span>
            </div>
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-border">
              <div
                className={`h-full rounded-full ${remainingMinutes === 0 ? "bg-red" : "bg-green"}`}
                style={{ width: `${100 - usedPct}%` }}
              />
            </div>
            <p className="mt-2 text-muted">
              Up to {viewerCap} viewers, sessions up to {sessionMaxMinutes} min. Resets on a rolling 7-day window.
              {remainingMinutes === 0 && " You're out of minutes for now; they refill as the week rolls forward."}
            </p>
          </>
        ) : (
          <p className="text-muted">
            <span className="uppercase tracking-widest">Live budget</span>
            {"  "}Unmetered windows on the managed tier (up to {viewerCap} viewers).
          </p>
        )}
      </div>

      {status === "off" && (
        <div className="mb-3 flex flex-wrap items-center gap-2 text-xs">
          <span className="rounded-full border border-border px-2 py-1 text-muted">
            {mode === "stage" ? "Stage mode (music)" : "Mic mode (spoken)"}
          </span>
          {audioDevices.length > 1 && (
            <select
              value={audioDeviceId}
              onChange={(e) => setAudioDeviceId(e.target.value)}
              className="h-8 max-w-[180px] rounded-md border border-border bg-panel-soft px-2 text-xs outline-none focus:border-red"
              title="Audio input (pick your mixer/interface)"
            >
              <option value="">Default mic</option>
              {audioDevices.map((d, i) => (
                <option key={d.deviceId} value={d.deviceId}>
                  {d.label || `Input ${i + 1}`}
                </option>
              ))}
            </select>
          )}
          <div className="inline-flex overflow-hidden rounded-md border border-border">
            {(["480", "720"] as const).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setResolution(r)}
                className={`px-2.5 py-1 transition ${
                  resolution === r ? "bg-red text-white" : "text-muted hover:text-foreground"
                }`}
              >
                {r}p
              </button>
            ))}
          </div>
        </div>
      )}

      {status === "off" ? (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => start("window")}
            disabled={busy}
            className="h-10 rounded-md bg-red px-5 text-sm font-semibold text-white transition hover:bg-red-dark disabled:opacity-50"
          >
            {busy ? "Starting..." : "Start window (free)"}
          </button>
          {tier === "managed" && (
            <button
              type="button"
              onClick={() => start("event")}
              disabled={busy}
              className="h-10 rounded-md border border-border px-5 text-sm text-foreground transition hover:border-red disabled:opacity-50"
            >
              Start event (Stream Live)
            </button>
          )}
        </div>
      ) : (
        <button
          type="button"
          onClick={stop}
          disabled={busy}
          className="h-10 rounded-md border border-red px-5 text-sm font-semibold text-red transition hover:bg-red/10 disabled:opacity-50"
        >
          {busy ? "Ending..." : "End live"}
        </button>
      )}

      {note && <p className="mt-3 text-xs text-muted">{note}</p>}
      {error && <p className="mt-3 text-xs text-red">{error}</p>}

      {status === "window" && (
        <video ref={videoRef} autoPlay muted playsInline className="mt-4 w-full max-w-sm rounded-md border border-border bg-black" />
      )}

      {rtmp && (
        <dl className="mt-4 space-y-2 text-xs">
          <div className="flex flex-col gap-1">
            <dt className="uppercase tracking-widest text-muted">RTMP URL</dt>
            <dd className="break-all rounded-md border border-border bg-panel-soft px-3 py-2 font-mono">{rtmp.url}</dd>
          </div>
          <div className="flex flex-col gap-1">
            <dt className="uppercase tracking-widest text-muted">Stream key</dt>
            <dd className="break-all rounded-md border border-border bg-panel-soft px-3 py-2 font-mono">{rtmp.key}</dd>
          </div>
        </dl>
      )}
    </div>
  );
}
