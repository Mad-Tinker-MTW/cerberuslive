"use client";

import { useEffect, useRef, useState } from "react";

// Plays first-party audio streamed through the artist's self-host tunnel (or the
// admin-hosted tier). No off-platform links — the file streams through Cerberus.

function fmt(s: number): string {
  if (!isFinite(s) || s < 0) return "0:00";
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

const BARS = Array.from({ length: 64 }, (_, i) =>
  Math.min(100, 20 + Math.abs(Math.sin(i * 0.7) * 60) + ((i * 13) % 20))
);

export function AudioPlayer({
  src,
  title,
  artist,
  duration,
}: {
  src: string;
  title: string;
  artist?: string;
  duration?: string;
}) {
  const ref = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [cur, setCur] = useState(0);
  const [dur, setDur] = useState(0);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const a = ref.current;
    if (!a) return;
    const onTime = () => setCur(a.currentTime);
    const onMeta = () => setDur(a.duration);
    const onEnd = () => setPlaying(false);
    const onError = () => { setFailed(true); setPlaying(false); }; // source offline/404
    a.addEventListener("timeupdate", onTime);
    a.addEventListener("loadedmetadata", onMeta);
    a.addEventListener("ended", onEnd);
    a.addEventListener("error", onError);
    return () => {
      a.removeEventListener("timeupdate", onTime);
      a.removeEventListener("loadedmetadata", onMeta);
      a.removeEventListener("ended", onEnd);
      a.removeEventListener("error", onError);
    };
  }, []);

  function toggle() {
    const a = ref.current;
    if (!a) return;
    if (a.paused) {
      // play() rejects (NotSupportedError, autoplay block) — must be caught so a
      // dead source degrades instead of throwing.
      a.play().then(() => setPlaying(true)).catch(() => { setFailed(true); setPlaying(false); });
    } else {
      a.pause();
      setPlaying(false);
    }
  }

  function seek(e: React.MouseEvent<HTMLDivElement>) {
    const a = ref.current;
    if (!a || !dur) return;
    const rect = e.currentTarget.getBoundingClientRect();
    a.currentTime = ((e.clientX - rect.left) / rect.width) * dur;
  }

  const pct = dur ? (cur / dur) * 100 : 0;

  if (failed) {
    return (
      <div className="flex items-center gap-4">
        <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg border border-border bg-panel-soft text-2xl text-foreground/30">
          ▶
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold text-foreground">{title}</p>
          {artist && <p className="truncate text-sm text-muted">{artist}</p>}
          <p className="mt-2 text-xs text-muted">
            Audio is offline right now (the artist&apos;s agent is not connected).
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4">
      {/* preload none: don't fetch the source until the user presses play, so an
          offline tunnel never errors on render. */}
      <audio ref={ref} src={src} preload="none" />
      <button
        type="button"
        onClick={toggle}
        aria-label={playing ? "Pause" : "Play"}
        className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg border border-border bg-panel-soft text-2xl text-red transition hover:scale-105"
      >
        {playing ? "❚❚" : "▶"}
      </button>
      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold text-foreground">{title}</p>
        {artist && <p className="truncate text-sm text-muted">{artist}</p>}
        <div onClick={seek} className="mt-2 flex h-12 cursor-pointer items-center gap-0.5">
          {BARS.map((h, i) => {
            const on = (i / BARS.length) * 100 <= pct;
            return (
              <span
                key={i}
                className={`w-1 rounded-full ${on ? "bg-red" : "bg-foreground/20"}`}
                style={{ height: `${h}%` }}
              />
            );
          })}
        </div>
        <div className="mt-1 flex justify-between text-xs text-muted">
          <span>{fmt(cur)}</span>
          <span>{dur ? fmt(dur) : duration ?? "0:00"}</span>
        </div>
      </div>
    </div>
  );
}
