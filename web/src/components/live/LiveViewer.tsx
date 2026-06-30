"use client";

import { useEffect, useRef, useState } from "react";
import { watchWindow } from "@/lib/realtime-client";

type ViewState = "connecting" | "live" | "ended" | "error" | "full";

const BEAT_MS = 10_000;

// Viewer for a free WebRTC window. Watching needs no sign-in (going on camera does).
// Shows a "connecting" state until the first frame, and "stream ended" when the publisher
// stops, instead of a broken-image flash or a frozen last frame. Holds a concurrent-viewer
// slot via /api/live/viewer (A.6): joins before connecting (showing "full" if the tier cap is
// reached), heartbeats it, and releases it on unmount so a closed tab frees the slot.
export function LiveViewer({ slug, publisherSessionId }: { slug: string; publisherSessionId: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const [state, setState] = useState<ViewState>("connecting");
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    const token =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    let beat: ReturnType<typeof setInterval> | undefined;

    const ping = (op: "join" | "beat" | "leave", keepalive = false) =>
      fetch("/api/live/viewer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, token, op }),
        keepalive,
      });

    (async () => {
      // Claim a viewer slot first. A 403 means the tier's concurrent-viewer cap is reached —
      // show "full" instead of connecting. Any other join hiccup is non-fatal (cap is best-effort).
      try {
        const res = await ping("join");
        if (cancelled) return;
        if (res.status === 403) {
          setState("full");
          return;
        }
      } catch {
        /* network blip on the slot check — fall through and try to watch anyway */
      }
      if (cancelled) return;
      beat = setInterval(() => void ping("beat").catch(() => {}), BEAT_MS);

      try {
        const { pc, stream } = await watchWindow(slug, publisherSessionId);
        if (cancelled) {
          pc.close();
          return;
        }
        pcRef.current = pc;
        if (videoRef.current) videoRef.current.srcObject = stream;
        // Stream end: the publisher stopping tears the connection down or ends the tracks.
        pc.addEventListener("connectionstatechange", () => {
          const s = pc.connectionState;
          if (s === "failed" || s === "disconnected" || s === "closed") {
            setState((prev) => (prev === "error" ? prev : "ended"));
          }
        });
        stream.getTracks().forEach((t) =>
          t.addEventListener("ended", () => setState((prev) => (prev === "error" ? prev : "ended")))
        );
      } catch (e) {
        if (!cancelled) {
          setError((e as Error).message);
          setState("error");
        }
      }
    })();
    return () => {
      cancelled = true;
      if (beat) clearInterval(beat);
      void ping("leave", true).catch(() => {});
      pcRef.current?.close();
      pcRef.current = null;
    };
  }, [slug, publisherSessionId]);

  return (
    <div className="relative overflow-hidden rounded-lg border border-border bg-black">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        controls
        onPlaying={() => setState((s) => (s === "connecting" ? "live" : s))}
        className="w-full"
      />
      {state === "connecting" && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/60">
          <span className="inline-flex items-center gap-2 text-sm text-foreground/80">
            <span className="h-2 w-2 animate-pulse rounded-full bg-red" /> Connecting...
          </span>
        </div>
      )}
      {state === "ended" && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80">
          <span className="text-sm text-foreground/80">Stream ended</span>
        </div>
      )}
      {state === "full" && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/85 px-4 text-center">
          <span className="text-sm text-foreground/80">
            This live window is full right now. Try again in a moment.
          </span>
        </div>
      )}
      {state === "error" && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 px-4 text-center">
          <span className="text-sm text-red">Could not connect to the live stream: {error}</span>
        </div>
      )}
    </div>
  );
}
