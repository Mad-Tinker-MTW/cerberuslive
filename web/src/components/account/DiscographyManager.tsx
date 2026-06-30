"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

// Full discography CRUD for the artist's own catalog. Three flat managed lists
// (personas, releases, tracks) with assignment dropdowns; the public dossier
// renders the nested view from the same data. All writes go to /api/discography.

export type PersonaInput = {
  id: number;
  name: string;
  kind: "solo" | "group";
  members: { name: string; role?: string }[];
  bio: string | null;
  dedication: string | null;
  sort: number;
};
export type ReleaseInput = {
  id: number;
  persona_id: number | null;
  title: string;
  kind: "album" | "ep" | "single";
  year: string | null;
  cover_url: string | null;
  dedication: string | null;
  sort: number;
};
export type TrackInput = {
  id: number;
  release_id: number | null;
  persona_id: number | null;
  title: string;
  filename: string;
  duration: string | null;
  version_label: string | null;
  performer: string | null;
  composer: string | null;
  track_no: number | null;
  is_featured: number;
  sort: number;
  media_kind: string;
};

type Op =
  | "persona.save"
  | "persona.delete"
  | "release.save"
  | "release.delete"
  | "track.save"
  | "track.delete";

// --- small shared field UI (mirrors ProfileEditor styling) --------------------
function TextField({
  label,
  value,
  onChange,
  placeholder,
  textarea,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  textarea?: boolean;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs uppercase tracking-widest text-muted">{label}</span>
      {textarea ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={2}
          className="rounded-md border border-border bg-panel-soft px-3 py-2 text-sm outline-none focus:border-red"
        />
      ) : (
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="h-10 rounded-md border border-border bg-panel-soft px-3 text-sm outline-none focus:border-red"
        />
      )}
    </label>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs uppercase tracking-widest text-muted">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-10 rounded-md border border-border bg-panel-soft px-3 text-sm outline-none focus:border-red"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function Collapsible({
  title,
  subtitle,
  children,
  startOpen,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  startOpen?: boolean;
}) {
  const [open, setOpen] = useState(Boolean(startOpen));
  return (
    <div className="rounded-lg border border-border bg-panel-soft">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
      >
        <span className="min-w-0">
          <span className="text-sm font-semibold text-foreground">{title}</span>
          {subtitle && <span className="ml-2 text-xs text-muted">{subtitle}</span>}
        </span>
        <span className="shrink-0 text-muted">{open ? "−" : "+"}</span>
      </button>
      {open && <div className="border-t border-border px-4 py-4">{children}</div>}
    </div>
  );
}

function SaveDelete({
  onSave,
  onDelete,
  busy,
}: {
  onSave: () => void;
  onDelete?: () => void;
  busy: boolean;
}) {
  return (
    <div className="mt-4 flex gap-2">
      <button
        type="button"
        onClick={onSave}
        disabled={busy}
        className="h-10 rounded-md bg-red px-5 text-sm font-semibold text-white transition hover:bg-red-dark disabled:opacity-50"
      >
        {busy ? "Saving..." : "Save"}
      </button>
      {onDelete && (
        <button
          type="button"
          onClick={onDelete}
          disabled={busy}
          className="h-10 rounded-md border border-border px-4 text-sm text-muted transition hover:border-red hover:text-red disabled:opacity-50"
        >
          Delete
        </button>
      )}
    </div>
  );
}

// --- forms --------------------------------------------------------------------
function PersonaForm({
  initial,
  post,
  busy,
}: {
  initial?: PersonaInput;
  post: (op: Op, data: Record<string, unknown>, onDone?: () => void) => void;
  busy: boolean;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [kind, setKind] = useState<"solo" | "group">(initial?.kind ?? "solo");
  const [bio, setBio] = useState(initial?.bio ?? "");
  const [dedication, setDedication] = useState(initial?.dedication ?? "");
  const [members, setMembers] = useState<{ name: string; role: string }[]>(
    (initial?.members ?? []).map((m) => ({ name: m.name, role: m.role ?? "" }))
  );

  const save = () =>
    post("persona.save", {
      id: initial?.id,
      name,
      kind,
      bio,
      dedication,
      members: kind === "group" ? members.filter((m) => m.name.trim()) : [],
    });

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <TextField label="Name" value={name} onChange={setName} placeholder="Bianca Raveena" />
        <SelectField
          label="Kind"
          value={kind}
          onChange={(v) => setKind(v === "group" ? "group" : "solo")}
          options={[
            { value: "solo", label: "Solo" },
            { value: "group", label: "Group" },
          ]}
        />
      </div>
      <TextField label="Persona bio" value={bio} onChange={setBio} textarea placeholder="A one-line description of this persona." />
      <TextField label="Dedication / story" value={dedication} onChange={setDedication} textarea placeholder="Who this is for, why it exists." />
      {kind === "group" && (
        <div className="flex flex-col gap-2">
          <span className="text-xs uppercase tracking-widest text-muted">Members</span>
          {members.map((m, i) => (
            <div key={i} className="flex gap-2">
              <input
                value={m.name}
                onChange={(e) => setMembers((ms) => ms.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)))}
                placeholder="Member name"
                className="h-10 flex-1 rounded-md border border-border bg-panel px-3 text-sm outline-none focus:border-red"
              />
              <input
                value={m.role}
                onChange={(e) => setMembers((ms) => ms.map((x, j) => (j === i ? { ...x, role: e.target.value } : x)))}
                placeholder="Role (optional)"
                className="h-10 w-40 rounded-md border border-border bg-panel px-3 text-sm outline-none focus:border-red"
              />
              <button
                type="button"
                onClick={() => setMembers((ms) => ms.filter((_, j) => j !== i))}
                className="h-10 rounded-md border border-border px-3 text-sm text-muted hover:border-red hover:text-red"
              >
                ✕
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => setMembers((ms) => [...ms, { name: "", role: "" }])}
            className="w-fit rounded-md border border-border px-3 py-1.5 text-xs text-muted hover:border-red hover:text-foreground"
          >
            + Add member
          </button>
        </div>
      )}
      <SaveDelete
        busy={busy}
        onSave={save}
        onDelete={initial ? () => post("persona.delete", { id: initial.id }) : undefined}
      />
    </div>
  );
}

function ReleaseForm({
  initial,
  personas,
  post,
  busy,
}: {
  initial?: ReleaseInput;
  personas: PersonaInput[];
  post: (op: Op, data: Record<string, unknown>, onDone?: () => void) => void;
  busy: boolean;
}) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [kind, setKind] = useState<"album" | "ep" | "single">(initial?.kind ?? "single");
  const [year, setYear] = useState(initial?.year ?? "");
  const [coverUrl, setCoverUrl] = useState(initial?.cover_url ?? "");
  const [dedication, setDedication] = useState(initial?.dedication ?? "");
  const [personaId, setPersonaId] = useState(String(initial?.persona_id ?? ""));

  const save = () =>
    post("release.save", {
      id: initial?.id,
      title,
      kind,
      year,
      cover_url: coverUrl,
      dedication,
      persona_id: personaId ? Number(personaId) : null,
    });

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <TextField label="Title" value={title} onChange={setTitle} placeholder="A Warrior's Lullaby" />
        <SelectField
          label="Persona"
          value={personaId}
          onChange={setPersonaId}
          options={[{ value: "", label: "Direct (no persona)" }, ...personas.map((p) => ({ value: String(p.id), label: p.name }))]}
        />
        <SelectField
          label="Kind"
          value={kind}
          onChange={(v) => setKind((["album", "ep", "single"].includes(v) ? v : "single") as "album" | "ep" | "single")}
          options={[
            { value: "album", label: "Album" },
            { value: "ep", label: "EP" },
            { value: "single", label: "Single" },
          ]}
        />
        <TextField label="Year" value={year} onChange={setYear} placeholder="2026" />
        <TextField label="Cover image URL" value={coverUrl} onChange={setCoverUrl} placeholder="https://..." />
      </div>
      <TextField label="Dedication / story" value={dedication} onChange={setDedication} textarea placeholder="What this release means." />
      <SaveDelete
        busy={busy}
        onSave={save}
        onDelete={initial ? () => post("release.delete", { id: initial.id }) : undefined}
      />
    </div>
  );
}

function TrackForm({
  initial,
  releases,
  post,
  busy,
}: {
  initial?: TrackInput;
  releases: ReleaseInput[];
  post: (op: Op, data: Record<string, unknown>, onDone?: () => void) => void;
  busy: boolean;
}) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [filename, setFilename] = useState(initial?.filename ?? "");
  const [duration, setDuration] = useState(initial?.duration ?? "");
  const [releaseId, setReleaseId] = useState(String(initial?.release_id ?? ""));
  const [versionLabel, setVersionLabel] = useState(initial?.version_label ?? "");
  const [performer, setPerformer] = useState(initial?.performer ?? "");
  const [composer, setComposer] = useState(initial?.composer ?? "");
  const [trackNo, setTrackNo] = useState(initial?.track_no != null ? String(initial.track_no) : "");
  const [featured, setFeatured] = useState(Boolean(initial?.is_featured));
  const [mediaKind, setMediaKind] = useState(initial?.media_kind === "video" ? "video" : "audio");

  const save = () =>
    post("track.save", {
      id: initial?.id,
      title,
      filename,
      duration,
      release_id: releaseId ? Number(releaseId) : null,
      version_label: versionLabel,
      performer,
      composer,
      track_no: trackNo,
      is_featured: featured,
      media_kind: mediaKind,
    });

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <TextField label="Title" value={title} onChange={setTitle} placeholder="Quiet Hours" />
        <SelectField
          label="Release"
          value={releaseId}
          onChange={setReleaseId}
          options={[{ value: "", label: "Direct single (no release)" }, ...releases.map((r) => ({ value: String(r.id), label: r.title }))]}
        />
        <SelectField
          label="Media kind"
          value={mediaKind}
          onChange={setMediaKind}
          options={[
            { value: "audio", label: "Audio" },
            { value: "video", label: "Video" },
          ]}
        />
        <TextField label="Filename (under media root)" value={filename} onChange={setFilename} placeholder="bianca/01.mp3" />
        <TextField label="Duration" value={duration} onChange={setDuration} placeholder="3:42" />
        <TextField label="Track #" value={trackNo} onChange={setTrackNo} placeholder="1" />
        <TextField label="Version label" value={versionLabel} onChange={setVersionLabel} placeholder="Trap Version" />
        <TextField label="Performer (group credit)" value={performer} onChange={setPerformer} placeholder="Vex" />
        <TextField label="Composer (human creator)" value={composer} onChange={setComposer} placeholder="F. De La Paz" />
      </div>
      <label className="flex items-center gap-2 text-sm text-foreground/85">
        <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} className="accent-red" />
        Featured track (shows in the dossier hero)
      </label>
      <SaveDelete
        busy={busy}
        onSave={save}
        onDelete={initial ? () => post("track.delete", { id: initial.id }) : undefined}
      />
    </div>
  );
}

function AddBlock({ label, children }: { label: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-fit rounded-md border border-border px-4 py-2 text-sm text-muted transition hover:border-red hover:text-foreground"
      >
        + {label}
      </button>
    );
  }
  return <div className="rounded-lg border border-dashed border-red/40 bg-panel-soft p-4">{children}</div>;
}

export function DiscographyManager({
  slug,
  personas,
  releases,
  tracks,
}: {
  slug: string;
  personas: PersonaInput[];
  releases: ReleaseInput[];
  tracks: TrackInput[];
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  function post(op: Op, data: Record<string, unknown>) {
    setBusy(true);
    setError("");
    fetch("/api/discography", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ op, ...data }),
    })
      .then(async (res) => {
        if (res.ok) {
          router.refresh();
        } else {
          const d = (await res.json().catch(() => ({}))) as { error?: string };
          setError(d.error || "Could not save.");
        }
      })
      .catch(() => setError("Network error."))
      .finally(() => setBusy(false));
  }

  const releaseTitle = (id: number | null) =>
    id == null ? "Direct single" : releases.find((r) => r.id === id)?.title ?? "—";
  const personaName = (id: number | null) =>
    id == null ? "Direct" : personas.find((p) => p.id === id)?.name ?? "—";

  return (
    <div className="flex flex-col gap-8">
      {error && <p className="text-sm text-red">{error}</p>}

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-bold uppercase tracking-widest text-muted">Personas</h2>
        {personas.length === 0 && <p className="text-sm text-muted">No personas yet. A solo artist can skip these and use direct releases.</p>}
        {personas.map((p) => (
          <Collapsible key={p.id} title={p.name} subtitle={p.kind === "group" ? "Group" : "Solo"}>
            <PersonaForm initial={p} post={post} busy={busy} />
          </Collapsible>
        ))}
        <AddBlock label="Add persona">
          <PersonaForm post={post} busy={busy} />
        </AddBlock>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-bold uppercase tracking-widest text-muted">Releases</h2>
        {releases.length === 0 && <p className="text-sm text-muted">No releases yet.</p>}
        {releases.map((r) => (
          <Collapsible key={r.id} title={r.title} subtitle={`${r.kind} · ${personaName(r.persona_id)}`}>
            <ReleaseForm initial={r} personas={personas} post={post} busy={busy} />
          </Collapsible>
        ))}
        <AddBlock label="Add release">
          <ReleaseForm personas={personas} post={post} busy={busy} />
        </AddBlock>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-bold uppercase tracking-widest text-muted">Tracks</h2>
        {tracks.length === 0 && <p className="text-sm text-muted">No tracks yet.</p>}
        {tracks.map((t) => (
          <Collapsible
            key={t.id}
            title={t.title}
            subtitle={`${releaseTitle(t.release_id)}${t.version_label ? " · " + t.version_label : ""}`}
          >
            <TrackForm initial={t} releases={releases} post={post} busy={busy} />
          </Collapsible>
        ))}
        <AddBlock label="Add track">
          <TrackForm releases={releases} post={post} busy={busy} />
        </AddBlock>
      </section>

      <div>
        <a
          href={`/artist/${slug}`}
          className="flex h-11 w-fit items-center rounded-md border border-border px-6 text-sm text-muted transition hover:border-red hover:text-foreground"
        >
          View dossier
        </a>
      </div>
    </div>
  );
}
