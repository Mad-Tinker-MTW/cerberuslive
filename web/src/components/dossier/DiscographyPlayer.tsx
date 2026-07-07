"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

// Single-source playback for the whole DiscographyPanel. Exactly ONE <audio> element
// exists on the page (rendered by NowPlayingBar); every play affordance in the panel
// routes through this controller. Starting any new track or queue replaces whatever was
// playing, so two sources can never overlap. First-party audio only, streamed through the
// artist's media gateway (see lib/db trackUrl); no off-platform links, no waveform.

/** A resolved, playable item for the single audio source. `src` is the gateway URL; the
 *  rest is display metadata for the now-playing bar. Built by the panel from a Track plus
 *  its release cover and persona. */
export type PlayerTrack = {
  /** Track id (drives the play-count ping and React keys). */
  id: number;
  /** Public gateway URL for the audio file. */
  src: string;
  title: string;
  /** Persona / artist line under the title, or null. */
  persona: string | null;
  /** Release cover URL for the thumb, or null (falls back to a monogram tile). */
  coverUrl: string | null;
  /** Monogram fallback letter when coverUrl is null. */
  coverInitial: string;
  /** "m:ss" duration hint, used before real metadata loads. */
  duration: string | null;
};

type PlayerState = {
  current: PlayerTrack | null;
  isPlaying: boolean;
  position: number;
  duration: number;
  volume: number;
  /** Length of the active queue (Play Album), for the queue-count affordance. */
  queueLength: number;
  play: (track: PlayerTrack) => void;
  playQueue: (tracks: PlayerTrack[], startIndex?: number) => void;
  toggle: () => void;
  next: () => void;
  prev: () => void;
  seek: (seconds: number) => void;
  setVolume: (v: number) => void;
  stop: () => void;
  hasNext: boolean;
  hasPrev: boolean;
};

const PlayerContext = createContext<PlayerState | null>(null);

/** Access the single discography player. Must be called under PlayerProvider. */
export function usePlayer(): PlayerState {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error("usePlayer must be used within a PlayerProvider");
  return ctx;
}

/** Provider that owns the one audio element and all playback state. Render NowPlayingBar
 *  somewhere inside it; the bar mounts the <audio> node and drives the transport. */
export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const pinged = useRef<Set<number>>(new Set());

  const [queue, setQueue] = useState<PlayerTrack[]>([]);
  const [index, setIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(1);

  const current = queue[index] ?? null;

  // Ping the play-count endpoint once per track, the same contract the old AudioPlayer used.
  const pingPlay = useCallback((id: number) => {
    if (pinged.current.has(id)) return;
    pinged.current.add(id);
    fetch("/api/tracks/play", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    }).catch(() => {});
  }, []);

  // Load + attempt playback whenever the active track changes. Keeping this in one effect
  // guarantees a single source: swapping the src stops the previous audio automatically.
  useEffect(() => {
    const a = audioRef.current;
    if (!a || !current) return;
    setPosition(0);
    setDuration(0);
    // a.play() rejects (autoplay block, dead source) — catch so an offline stream degrades.
    a.play()
      .then(() => {
        setIsPlaying(true);
        pingPlay(current.id);
      })
      .catch(() => setIsPlaying(false));
    // Re-run only when the active track identity changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current?.src]);

  const play = useCallback((track: PlayerTrack) => {
    setQueue([track]);
    setIndex(0);
  }, []);

  const playQueue = useCallback((tracks: PlayerTrack[], startIndex = 0) => {
    if (tracks.length === 0) return;
    const start = Math.min(Math.max(startIndex, 0), tracks.length - 1);
    setQueue(tracks);
    setIndex(start);
  }, []);

  const toggle = useCallback(() => {
    const a = audioRef.current;
    if (!a || !current) return;
    if (a.paused) {
      a.play()
        .then(() => {
          setIsPlaying(true);
          pingPlay(current.id);
        })
        .catch(() => setIsPlaying(false));
    } else {
      a.pause();
      setIsPlaying(false);
    }
  }, [current, pingPlay]);

  const next = useCallback(() => {
    setIndex((i) => (i < queue.length - 1 ? i + 1 : i));
  }, [queue.length]);

  const prev = useCallback(() => {
    setIndex((i) => (i > 0 ? i - 1 : i));
  }, []);

  const seek = useCallback((seconds: number) => {
    const a = audioRef.current;
    if (!a || !Number.isFinite(a.duration)) return;
    a.currentTime = Math.min(Math.max(seconds, 0), a.duration);
    setPosition(a.currentTime);
  }, []);

  const setVolume = useCallback((v: number) => {
    const clamped = Math.min(Math.max(v, 0), 1);
    setVolumeState(clamped);
    const a = audioRef.current;
    if (a) a.volume = clamped;
  }, []);

  const stop = useCallback(() => {
    const a = audioRef.current;
    if (a) a.pause();
    setQueue([]);
    setIndex(0);
    setIsPlaying(false);
    setPosition(0);
    setDuration(0);
  }, []);

  // Keep the audio element's volume in sync when it (re)mounts.
  useEffect(() => {
    const a = audioRef.current;
    if (a) a.volume = volume;
  }, [volume, current]);

  const value = useMemo<PlayerState>(
    () => ({
      current,
      isPlaying,
      position,
      duration,
      volume,
      queueLength: queue.length,
      play,
      playQueue,
      toggle,
      next,
      prev,
      seek,
      setVolume,
      stop,
      hasNext: index < queue.length - 1,
      hasPrev: index > 0,
    }),
    [
      current,
      isPlaying,
      position,
      duration,
      volume,
      queue.length,
      play,
      playQueue,
      toggle,
      next,
      prev,
      seek,
      setVolume,
      stop,
      index,
    ]
  );

  return (
    <PlayerContext.Provider value={value}>
      {children}
      {/* The one and only audio element. preload none so an offline stream never errors
          until the user presses play. It advances the queue on ended. */}
      <audio
        ref={audioRef}
        src={current?.src ?? undefined}
        preload="none"
        onTimeUpdate={(e) => setPosition(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
        onEnded={() => {
          if (index < queue.length - 1) setIndex((i) => i + 1);
          else setIsPlaying(false);
        }}
        onError={() => setIsPlaying(false)}
      />
    </PlayerContext.Provider>
  );
}

function fmt(s: number): string {
  if (!Number.isFinite(s) || s < 0) return "0:00";
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

/** Thumb for the now-playing bar: cover image, or a monogram tile when there is no cover. */
function Thumb({ track }: { track: PlayerTrack }) {
  if (track.coverUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={track.coverUrl}
        alt=""
        className="h-12 w-12 shrink-0 rounded-md border border-border object-cover"
      />
    );
  }
  return (
    <div
      className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md border border-border bg-gradient-to-br from-panel-soft to-panel text-foreground/30"
      aria-hidden
    >
      <span className="text-lg font-bold">{track.coverInitial}</span>
    </div>
  );
}

/**
 * The one player UI: a compact bottom bar matching the pinned mockup. Cover thumb, title +
 * persona, prev / play-pause / next transport, a thin progress scrubber (click or drag to
 * seek) with elapsed and total time, a volume control, and a queue button. No waveform.
 * Renders nothing when nothing is playing (idle) so the catalog reads clean.
 */
export function NowPlayingBar() {
  const p = usePlayer();
  const barRef = useRef<HTMLDivElement | null>(null);
  const [dragging, setDragging] = useState(false);

  const total = p.duration || 0;
  const pct = total ? Math.min(100, (p.position / total) * 100) : 0;

  const seekFromClientX = useCallback(
    (clientX: number) => {
      const el = barRef.current;
      if (!el || !total) return;
      const rect = el.getBoundingClientRect();
      const ratio = Math.min(Math.max((clientX - rect.left) / rect.width, 0), 1);
      p.seek(ratio * total);
    },
    [p, total]
  );

  // Drag-to-seek: track pointer moves at the window level while the thumb is held.
  useEffect(() => {
    if (!dragging) return;
    const onMove = (e: PointerEvent) => seekFromClientX(e.clientX);
    const onUp = () => setDragging(false);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, [dragging, seekFromClientX]);

  if (!p.current) return null;
  const t = p.current;

  return (
    <div className="sticky bottom-0 z-10 mt-2 rounded-xl border border-border bg-panel-soft p-3 shadow-lg">
      <div className="flex items-center gap-3">
        {/* Now-playing identity */}
        <Thumb track={t} />
        <div className="hidden min-w-0 sm:block sm:w-40 lg:w-56">
          <p className="truncate text-sm font-semibold text-foreground">{t.title}</p>
          {t.persona && <p className="truncate text-xs text-muted">{t.persona}</p>}
        </div>

        {/* Transport */}
        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={p.prev}
            disabled={!p.hasPrev}
            aria-label="Previous track"
            className="flex h-9 w-9 items-center justify-center rounded-md text-foreground transition enabled:hover:text-red disabled:opacity-30"
          >
            ⏮
          </button>
          <button
            type="button"
            onClick={p.toggle}
            aria-label={p.isPlaying ? "Pause" : "Play"}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-foreground text-lg text-panel transition hover:scale-105"
          >
            {p.isPlaying ? "❚❚" : "▶"}
          </button>
          <button
            type="button"
            onClick={p.next}
            disabled={!p.hasNext}
            aria-label="Next track"
            className="flex h-9 w-9 items-center justify-center rounded-md text-foreground transition enabled:hover:text-red disabled:opacity-30"
          >
            ⏭
          </button>
        </div>

        {/* Progress scrubber with elapsed / total time */}
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <span className="shrink-0 text-xs tabular-nums text-muted">{fmt(p.position)}</span>
          <div
            ref={barRef}
            role="slider"
            aria-label="Seek"
            aria-valuemin={0}
            aria-valuemax={Math.round(total)}
            aria-valuenow={Math.round(p.position)}
            tabIndex={0}
            onPointerDown={(e) => {
              e.preventDefault();
              setDragging(true);
              seekFromClientX(e.clientX);
            }}
            onKeyDown={(e) => {
              if (e.key === "ArrowRight") p.seek(p.position + 5);
              else if (e.key === "ArrowLeft") p.seek(p.position - 5);
            }}
            className="group relative h-1.5 flex-1 cursor-pointer rounded-full bg-foreground/15"
          >
            <div
              className="absolute inset-y-0 left-0 rounded-full bg-red"
              style={{ width: `${pct}%` }}
            />
            <div
              className="absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-red opacity-0 transition group-hover:opacity-100"
              style={{ left: `${pct}%` }}
            />
          </div>
          <span className="shrink-0 text-xs tabular-nums text-muted">
            {total ? fmt(total) : t.duration ?? "0:00"}
          </span>
        </div>

        {/* Volume */}
        <div className="hidden items-center gap-2 md:flex">
          <span aria-hidden className="text-muted">
            🔊
          </span>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={p.volume}
            onChange={(e) => p.setVolume(Number(e.target.value))}
            aria-label="Volume"
            className="h-1 w-20 cursor-pointer accent-red"
          />
        </div>

        {/* Queue count + close */}
        <button
          type="button"
          aria-label="Queue"
          title={`${p.queueLength} in queue`}
          className="hidden shrink-0 items-center gap-1.5 rounded-md border border-border px-2.5 py-1.5 text-xs text-muted transition hover:border-red hover:text-foreground lg:inline-flex"
        >
          ☰ Queue
          {p.queueLength > 1 && (
            <span className="rounded-full bg-panel px-1.5 text-[10px]">{p.queueLength}</span>
          )}
        </button>
        <button
          type="button"
          onClick={p.stop}
          aria-label="Close player"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-border text-muted transition hover:border-red hover:text-foreground"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
