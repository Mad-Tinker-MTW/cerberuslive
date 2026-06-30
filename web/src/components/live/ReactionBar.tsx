"use client";

import { useEffect, useRef, useState } from "react";

// Anonymous live reactions. Tapping an emoji posts it; a short poll pulls everyone's recent
// reactions and floats them up. No sign-in. Ephemeral (D1 rows purged after ~2 min).
const EMOJI: Record<string, string> = {
  heart: "❤️",
  fire: "🔥",
  laugh: "😂",
  clap: "👏",
  wow: "😮",
};

type Floater = { id: number; glyph: string; left: number };

export function ReactionBar({ slug }: { slug: string }) {
  const [floaters, setFloaters] = useState<Floater[]>([]);
  const nextId = useRef(1);
  const since = useRef<string>(new Date().toISOString());

  function spawn(glyph: string) {
    const id = nextId.current++;
    const left = 8 + Math.floor(Math.random() * 84);
    setFloaters((f) => [...f, { id, glyph, left }]);
    setTimeout(() => setFloaters((f) => f.filter((x) => x.id !== id)), 2200);
  }

  async function react(key: string) {
    spawn(EMOJI[key]); // optimistic, instant feedback for the tapper
    try {
      await fetch("/api/live/react", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, emoji: key }),
      });
    } catch {
      /* non-fatal */
    }
  }

  // Poll everyone's recent reactions.
  useEffect(() => {
    let alive = true;
    const tick = async () => {
      try {
        const res = await fetch(`/api/live/reactions?slug=${encodeURIComponent(slug)}&since=${encodeURIComponent(since.current)}`);
        if (!res.ok) return;
        const d = (await res.json()) as { reactions: { emoji: string }[]; now: string };
        if (!alive) return;
        since.current = d.now;
        d.reactions.forEach((r) => EMOJI[r.emoji] && spawn(EMOJI[r.emoji]));
      } catch {
        /* ignore */
      }
    };
    const iv = setInterval(tick, 1800);
    return () => {
      alive = false;
      clearInterval(iv);
    };
  }, [slug]);

  return (
    <div className="relative">
      <style>{`@keyframes cl-floatup{0%{opacity:0;transform:translateY(6px) scale(.7)}15%{opacity:1}100%{opacity:0;transform:translateY(-110px) scale(1.25)}}`}</style>
      <div className="pointer-events-none absolute inset-x-0 bottom-12 h-28 overflow-hidden">
        {floaters.map((f) => (
          <span
            key={f.id}
            className="absolute bottom-0 text-2xl"
            style={{ left: `${f.left}%`, animation: "cl-floatup 2.2s ease-out forwards" }}
          >
            {f.glyph}
          </span>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        {Object.entries(EMOJI).map(([key, glyph]) => (
          <button
            key={key}
            type="button"
            onClick={() => react(key)}
            aria-label={key}
            className="rounded-full border border-border bg-panel-soft px-3 py-1.5 text-lg transition hover:border-red"
          >
            {glyph}
          </button>
        ))}
      </div>
    </div>
  );
}
