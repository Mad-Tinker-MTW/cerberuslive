"use client";

import { useEffect, useRef, useState } from "react";
import { watchWindow } from "@/lib/realtime-client";

// Viewer for a free WebRTC window. Watching needs no sign-in (going on camera does).
// Gated on operator Realtime creds; flagged for live verification.
export function LiveViewer({ slug, publisherSessionId }: { slug: string; publisherSessionId: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
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
      } catch (e) {
        setError("Could not connect to the live stream: " + (e as Error).message);
      }
    })();
    return () => {
      cancelled = true;
      pcRef.current?.close();
      pcRef.current = null;
    };
  }, [slug, publisherSessionId]);

  return (
    <div>
      <video ref={videoRef} autoPlay playsInline controls className="w-full rounded-lg border border-border bg-black" />
      {error && <p className="mt-2 text-sm text-red">{error}</p>}
    </div>
  );
}
