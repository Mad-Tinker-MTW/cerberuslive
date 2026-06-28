import type {
  ArtistDossier,
  PerformanceProfile,
  MediaItem,
} from "@/lib/db";

function Card({
  title,
  children,
  className = "",
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`rounded-xl border border-border bg-panel p-5 ${className}`}>
      <h3 className="mb-3 text-xs uppercase tracking-widest text-muted">
        {title}
      </h3>
      {children}
    </div>
  );
}

function AboutArtistCard({ bio }: { bio: string }) {
  return (
    <Card title="About">
      <p className="leading-relaxed text-foreground/85">{bio}</p>
    </Card>
  );
}

function SoundStyleCard({ text }: { text: string }) {
  return (
    <Card title="Sound & Style">
      <p className="leading-relaxed text-foreground/85">{text}</p>
    </Card>
  );
}

const BEST_FOR_ICONS: Record<string, string> = {
  "Club Shows": "🎧",
  "Open Mics": "🎤",
  Colleges: "🎓",
  Festivals: "🎪",
  "Community Events": "🤝",
};

function BestForCard({ items }: { items: string[] }) {
  return (
    <Card title="Best For">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {items.map((item) => (
          <div
            key={item}
            className="flex flex-col items-center gap-1.5 rounded-lg border border-border bg-panel-soft px-3 py-4 text-center"
          >
            <span className="text-xl" aria-hidden>
              {BEST_FOR_ICONS[item] ?? "★"}
            </span>
            <span className="text-xs text-foreground/85">{item}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}

function Stars({ n }: { n: number }) {
  return (
    <span className="text-foreground" aria-label={`${n} of 5`}>
      {"★".repeat(Math.max(0, Math.min(5, n)))}
      <span className="text-foreground/20">
        {"★".repeat(Math.max(0, 5 - n))}
      </span>
    </span>
  );
}

function PerformanceProfileCard({ p }: { p: PerformanceProfile }) {
  const rows: { label: string; node: React.ReactNode }[] = [];
  const add = (label: string, value: string | undefined) => {
    if (value) rows.push({ label, node: value });
  };
  add("Set Length", p.setLength);
  add("Type", p.type);
  add("Crowd Fit", p.crowdFit);
  add("Clean Set", p.cleanSet);
  add("Languages", p.languages);
  if (typeof p.stagePresence === "number") {
    rows.push({ label: "Stage Presence", node: <Stars n={p.stagePresence} /> });
  }
  add("Energy", p.energy);
  add("Equipment", p.equipment);
  add("Travel", p.travel);
  if (rows.length === 0) return null;

  return (
    <Card title="Performance Profile">
      <dl className="grid grid-cols-1 gap-y-2.5 text-sm sm:grid-cols-2 sm:gap-x-6">
        {rows.map((r) => (
          <div key={r.label} className="flex justify-between gap-3">
            <dt className="text-muted">{r.label}</dt>
            <dd className="text-right text-foreground">{r.node}</dd>
          </div>
        ))}
      </dl>
    </Card>
  );
}

function MediaHighlightsCard({ media }: { media: MediaItem[] }) {
  return (
    <Card title="Media Highlights">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {media.slice(0, 4).map((m, i) => (
          <div
            key={i}
            className="group relative flex aspect-video items-center justify-center overflow-hidden rounded-lg border border-border bg-panel-soft"
          >
            <span className="text-2xl text-foreground/20 transition group-hover:text-red">
              ▶
            </span>
            <span className="absolute inset-x-0 bottom-0 truncate bg-background/70 px-2 py-1 text-[11px] text-foreground/85">
              {m.title}
            </span>
          </div>
        ))}
      </div>
      <button
        type="button"
        className="mt-4 w-full rounded-md border border-border bg-panel-soft px-4 py-2 text-sm text-muted transition hover:border-red hover:text-foreground"
      >
        View All Media
      </button>
    </Card>
  );
}

export function OverviewPanel({
  artist,
  performanceProfile,
  bestFor,
  media,
}: {
  artist: ArtistDossier;
  performanceProfile?: PerformanceProfile;
  bestFor?: string[];
  media?: MediaItem[];
}) {
  const hasPerf =
    performanceProfile && Object.keys(performanceProfile).length > 0;
  const hasBestFor = bestFor && bestFor.length > 0;
  const hasMedia = media && media.length > 0;

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      {artist.bio && <AboutArtistCard bio={artist.bio} />}
      {artist.sound_style && <SoundStyleCard text={artist.sound_style} />}
      {hasBestFor && <BestForCard items={bestFor} />}
      {hasPerf && <PerformanceProfileCard p={performanceProfile} />}
      {hasMedia && (
        <div className="lg:col-span-2">
          <MediaHighlightsCard media={media} />
        </div>
      )}
    </div>
  );
}
