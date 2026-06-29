import type {
  ArtistDossier,
  PerformanceProfile,
  MediaItem,
  ArtistTrait,
  ArtistDna,
} from "@/lib/db";
import { DNA_AXES } from "@/lib/db";
import { ArtistRadar } from "./ArtistRadar";

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

function ArtistDnaCard({ dna }: { dna: ArtistDna }) {
  return (
    <Card title="Artist DNA">
      <ArtistRadar dna={dna} />
    </Card>
  );
}

function ArtistTraitsCard({ traits }: { traits: ArtistTrait[] }) {
  return (
    <Card title="Artist Traits">
      <dl className="grid grid-cols-1 gap-y-2.5 text-sm">
        {traits.map((t) => (
          <div key={t.name} className="flex items-center justify-between gap-3">
            <dt className="text-muted">{t.name}</dt>
            <dd className="text-right">
              <Stars n={t.rating} />
            </dd>
          </div>
        ))}
      </dl>
    </Card>
  );
}

function SignatureSoundsCard({ sounds }: { sounds: string[] }) {
  return (
    <Card title="Signature Sounds">
      <ul className="flex flex-col gap-2 text-sm">
        {sounds.map((s) => (
          <li key={s} className="flex items-center gap-2 text-foreground/85">
            <span className="text-red" aria-hidden>
              ✓
            </span>
            {s}
          </li>
        ))}
      </ul>
    </Card>
  );
}

function InfluencesCard({ items }: { items: string[] }) {
  return (
    <Card title="Influences">
      <div className="flex flex-wrap gap-2">
        {items.map((i) => (
          <span
            key={i}
            className="rounded-full border border-border bg-panel-soft px-3 py-1.5 text-xs text-foreground/85"
          >
            {i}
          </span>
        ))}
      </div>
    </Card>
  );
}

export function OverviewPanel({
  artist,
  performanceProfile,
  bestFor,
  media,
  traits,
  signatureSounds,
  influences,
  artistDna,
}: {
  artist: ArtistDossier;
  performanceProfile?: PerformanceProfile;
  bestFor?: string[];
  media?: MediaItem[];
  traits?: ArtistTrait[];
  signatureSounds?: string[];
  influences?: string[];
  artistDna?: ArtistDna;
}) {
  const hasPerf =
    performanceProfile && Object.keys(performanceProfile).length > 0;
  const hasBestFor = bestFor && bestFor.length > 0;
  const hasMedia = media && media.length > 0;
  const cleanTraits = (traits ?? []).filter(
    (t) => t && t.name && t.rating > 0
  );
  const hasTraits = cleanTraits.length > 0;
  const hasSounds = signatureSounds && signatureSounds.length > 0;
  const hasInfluences = influences && influences.length > 0;
  const hasDna =
    artistDna &&
    DNA_AXES.some((a) => typeof artistDna[a.key] === "number" && artistDna[a.key]! > 0);

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      {artist.bio && <AboutArtistCard bio={artist.bio} />}
      {artist.sound_style && <SoundStyleCard text={artist.sound_style} />}
      {hasDna && (
        <div className="lg:col-span-2">
          <ArtistDnaCard dna={artistDna} />
        </div>
      )}
      {hasTraits && <ArtistTraitsCard traits={cleanTraits} />}
      {hasSounds && <SignatureSoundsCard sounds={signatureSounds} />}
      {hasInfluences && (
        // Pairs with Signature Sounds; spans full width when it would sit alone.
        <div className={hasSounds ? "lg:col-span-2" : ""}>
          <InfluencesCard items={influences} />
        </div>
      )}
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
