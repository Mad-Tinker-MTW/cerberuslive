import type { ArtistDossier, Socials } from "@/lib/db";
import { genreList } from "@/lib/db";

const SOCIAL_LABELS: Record<keyof Socials, string> = {
  instagram: "IG",
  youtube: "YT",
  tiktok: "TT",
  spotify: "SP",
  soundcloud: "SC",
  website: "WEB",
};

/** A deterministic fake barcode derived from the dossier id (static UI). */
function Barcode({ seed }: { seed: string }) {
  const bars = Array.from({ length: 48 }, (_, i) => {
    const code = seed.charCodeAt(i % seed.length) + i;
    return (code % 3) + 1; // width 1-3
  });
  return (
    <div className="flex h-10 items-end gap-px overflow-hidden">
      {bars.map((w, i) => (
        <span
          key={i}
          className="bg-foreground"
          style={{ width: `${w}px`, height: i % 4 === 0 ? "100%" : "82%" }}
        />
      ))}
    </div>
  );
}

function QuickInfoCard({ artist }: { artist: ArtistDossier }) {
  const rows: [string, string | null][] = [
    ["Location", artist.city],
    ["Genres", genreList(artist.genre_tags).join(", ") || null],
    ["Performance Type", artist.performance_type],
    ["Set Length", artist.set_length],
    ["Travel Range", artist.travel_range],
    ["Status", artist.availability_status],
    ["Response Time", artist.response_time],
  ];
  const present = rows.filter((r): r is [string, string] => Boolean(r[1]));
  if (present.length === 0) return null;

  return (
    <div className="rounded-xl border border-border bg-panel p-5">
      <h3 className="mb-3 text-xs uppercase tracking-widest text-muted">
        Quick Info
      </h3>
      <dl className="space-y-2.5 text-sm">
        {present.map(([label, value]) => (
          <div key={label} className="flex justify-between gap-3">
            <dt className="text-muted">{label}</dt>
            <dd
              className={`text-right ${
                label === "Status" ? "text-green" : "text-foreground"
              }`}
            >
              {value}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

function DossierIdCard({ id }: { id: string }) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-border bg-panel-soft p-5">
      <span className="pointer-events-none absolute -right-3 -top-2 select-none text-6xl font-black text-foreground/[0.03]">
        CERBERUS
      </span>
      <h3 className="mb-1 text-xs uppercase tracking-widest text-muted">
        Dossier ID
      </h3>
      <p className="font-mono text-lg tracking-wider text-foreground">{id}</p>
      <div className="mt-3">
        <Barcode seed={id} />
      </div>
    </div>
  );
}

function SocialRow({ links }: { links: Socials }) {
  const entries = (Object.keys(SOCIAL_LABELS) as (keyof Socials)[])
    .filter((k) => links[k])
    .map((k) => [k, links[k] as string] as const);
  if (entries.length === 0) return null;

  return (
    <div className="rounded-xl border border-border bg-panel p-5">
      <h3 className="mb-3 text-xs uppercase tracking-widest text-muted">Follow</h3>
      <div className="flex flex-wrap gap-2">
      {entries.map(([k, url]) => (
        <a
          key={k}
          href={url}
          target="_blank"
          rel="noreferrer noopener"
          className="flex h-9 w-9 items-center justify-center rounded-md border border-border bg-panel text-xs font-semibold text-muted transition hover:border-red hover:text-foreground"
          aria-label={k}
        >
          {SOCIAL_LABELS[k]}
        </a>
      ))}
      </div>
    </div>
  );
}

export function ArtistSidebar({
  artist,
  socials,
}: {
  artist: ArtistDossier;
  socials: Socials;
}) {
  const initials = artist.display_name
    .split(/\s+/)
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <aside className="flex flex-col gap-4">
      {/* Vertical headshot */}
      <div className="relative aspect-[3/4] overflow-hidden rounded-xl border border-border bg-panel-soft">
        {artist.photo_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={artist.photo_url}
            alt={artist.display_name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-6xl font-black text-foreground/10">
            {initials}
          </div>
        )}
        {artist.verified === 1 && (
          <span className="absolute bottom-3 left-3 rounded-md border border-green/40 bg-green/15 px-2 py-1 text-xs font-medium text-green">
            ✓ Verified Artist
          </span>
        )}
      </div>

      {/* Primary actions */}
      <div className="flex flex-col gap-2">
        <a
          href="#booking"
          className="rounded-md bg-red px-4 py-2.5 text-center text-sm font-semibold text-white transition hover:bg-red-dark"
        >
          Book Artist
        </a>
        <a
          href="#booking"
          className="rounded-md border border-border bg-panel px-4 py-2.5 text-center text-sm font-medium text-foreground transition hover:border-red"
        >
          Message
        </a>
      </div>

      <QuickInfoCard artist={artist} />
      <SocialRow links={socials} />
      {artist.dossier_id && <DossierIdCard id={artist.dossier_id} />}
    </aside>
  );
}
