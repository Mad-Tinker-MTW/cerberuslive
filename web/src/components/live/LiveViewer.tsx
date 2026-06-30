"use client";

import { useEffect, useRef, useState } from "react";
import { watchWindow } from "@/lib/realtime-client";

type ViewState = "connecting" | "live" | "ended" | "error";

// Viewer for a free WebRTC window. Watching needs no sign-in (going on camera does).
// Shows a "connecting" state until the first frame, and "stream ended" when the publisher
// stops, instead of a broken-image flash or a frozen last frame.
export function LiveViewer({ slug, publisherSessionId }: { slug: string; publisherSessionId: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const [state, setState] = useState<ViewState>("connecting");
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
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
      {state === "error" && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 px-4 text-center">
          <span className="text-sm text-red">Could not connect to the live stream: {error}</span>
        </div>
      )}
    </div>
  );
}
