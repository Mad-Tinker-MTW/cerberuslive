"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Socials } from "@/lib/db";

export type EditorValues = {
  photoUrl: string;
  display_name: string;
  subtitle: string;
  artist_class: string;
  city: string;
  genre_tags: string;
  bio: string;
  sound_style: string;
  performance_type: string;
  set_length: string;
  travel_range: string;
  availability_status: string;
  response_time: string;
  booking_range: string;
  booking_email: string;
  dossier_id: string;
  socials: Socials;
  bestFor: string[];
  featuredTitle: string;
  featuredDuration: string;
  // Performance profile (nested) + availability week
  ppCrowdFit: string;
  ppCleanSet: string;
  ppLanguages: string;
  ppEnergy: string;
  ppEquipment: string;
  ppStagePresence: number;
  availability: { day: string; state: "available" | "booked" }[];
};

export const WEEK = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const BEST_FOR_OPTIONS = [
  "Club Shows",
  "Open Mics",
  "Colleges",
  "Festivals",
  "Community Events",
];

const SOCIAL_KEYS: (keyof Socials)[] = [
  "instagram",
  "youtube",
  "tiktok",
  "spotify",
  "soundcloud",
  "website",
];

function Field({
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
          rows={4}
          className="rounded-md border border-border bg-panel-soft px-3 py-2 text-sm outline-none focus:border-red"
        />
      ) : (
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="h-11 rounded-md border border-border bg-panel-soft px-3 text-sm outline-none focus:border-red"
        />
      )}
    </label>
  );
}

export function ProfileEditor({
  slug,
  initial,
}: {
  slug: string;
  initial: EditorValues;
}) {
  const router = useRouter();
  const [v, setV] = useState<EditorValues>(initial);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [photoUrl, setPhotoUrl] = useState(initial.photoUrl);
  const [photoBusy, setPhotoBusy] = useState(false);

  async function uploadPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoBusy(true);
    setError("");
    const fd = new FormData();
    fd.append("photo", file);
    const res = await fetch("/api/profile/photo", { method: "POST", body: fd });
    if (res.ok) {
      setPhotoUrl(((await res.json()) as { photoUrl: string }).photoUrl);
      router.refresh();
    } else {
      setError(((await res.json().catch(() => ({}))) as { error?: string }).error || "Could not upload photo.");
    }
    setPhotoBusy(false);
    e.target.value = "";
  }

  const set = (k: keyof EditorValues, val: string) =>
    setV((p) => ({ ...p, [k]: val }));
  const setSocial = (k: keyof Socials, val: string) =>
    setV((p) => ({ ...p, socials: { ...p.socials, [k]: val } }));
  const toggleBestFor = (item: string) =>
    setV((p) => ({
      ...p,
      bestFor: p.bestFor.includes(item)
        ? p.bestFor.filter((x) => x !== item)
        : [...p.bestFor, item],
    }));
  const toggleDay = (day: string) =>
    setV((p) => {
      const cur = p.availability.find((d) => d.day === day);
      const others = p.availability.filter((d) => d.day !== day);
      const next = { day, state: (cur?.state === "available" ? "booked" : "available") as "available" | "booked" };
      return { ...p, availability: [...others, next].sort((a, b) => WEEK.indexOf(a.day) - WEEK.indexOf(b.day)) };
    });
  const dayState = (day: string) => v.availability.find((d) => d.day === day)?.state ?? "available";

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!v.display_name.trim()) {
      setError("Display name is required.");
      return;
    }
    setBusy(true);
    setError("");
    const res = await fetch("/api/profile/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        display_name: v.display_name,
        subtitle: v.subtitle,
        artist_class: v.artist_class,
        city: v.city,
        genre_tags: v.genre_tags,
        bio: v.bio,
        sound_style: v.sound_style,
        performance_type: v.performance_type,
        set_length: v.set_length,
        travel_range: v.travel_range,
        availability_status: v.availability_status,
        response_time: v.response_time,
        booking_range: v.booking_range,
        booking_email: v.booking_email,
        dossier_id: v.dossier_id,
        socials: v.socials,
        bestFor: v.bestFor,
        featuredTrack: { title: v.featuredTitle, duration: v.featuredDuration },
        performanceProfile: {
          crowdFit: v.ppCrowdFit,
          cleanSet: v.ppCleanSet,
          languages: v.ppLanguages,
          energy: v.ppEnergy,
          equipment: v.ppEquipment,
          stagePresence: v.ppStagePresence,
        },
        availability: v.availability,
      }),
    });
    if (res.ok) {
      router.push(`/artist/${slug}`);
      router.refresh();
    } else {
      const d = (await res.json().catch(() => ({}))) as { error?: string };
      setError(d.error || "Could not save.");
      setBusy(false);
    }
  }

  return (
    <form onSubmit={save} className="flex flex-col gap-6">
      <section className="flex items-center gap-4">
        <div className="h-24 w-24 shrink-0 overflow-hidden rounded-xl border border-border bg-panel-soft">
          {photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={photoUrl} alt="Artist photo" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-2xl text-foreground/20">♪</div>
          )}
        </div>
        <div className="flex flex-col gap-1.5">
          <span className="text-xs uppercase tracking-widest text-muted">Artist photo</span>
          <label className="inline-flex w-fit cursor-pointer items-center rounded-md border border-border bg-panel-soft px-4 py-2 text-sm font-semibold text-foreground transition hover:border-red">
            {photoBusy ? "Uploading..." : photoUrl ? "Replace photo" : "Upload photo"}
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif"
              onChange={uploadPhoto}
              disabled={photoBusy}
              className="hidden"
            />
          </label>
          <span className="text-xs text-muted">PNG, JPEG, WebP, or GIF, up to 5 MB. Saves immediately.</span>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Display name" value={v.display_name} onChange={(x) => set("display_name", x)} />
        <Field label="Subtitle / meaning" value={v.subtitle} onChange={(x) => set("subtitle", x)} placeholder="e.g. Self Truth Sees Cypher" />
        <Field label="Class" value={v.artist_class} onChange={(x) => set("artist_class", x)} placeholder="Live Rapper / Vocalist, AI Artist..." />
        <Field label="Dossier ID" value={v.dossier_id} onChange={(x) => set("dossier_id", x)} placeholder="CLS-XXXX-001" />
        <Field label="Location" value={v.city} onChange={(x) => set("city", x)} placeholder="Oklahoma City, OK" />
        <Field label="Genres (comma-separated)" value={v.genre_tags} onChange={(x) => set("genre_tags", x)} placeholder="Hip-Hop, Conscious Rap" />
      </section>

      <Field label="Bio" value={v.bio} onChange={(x) => set("bio", x)} textarea />
      <Field label="Sound & Style" value={v.sound_style} onChange={(x) => set("sound_style", x)} textarea />

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Performance type" value={v.performance_type} onChange={(x) => set("performance_type", x)} />
        <Field label="Set length" value={v.set_length} onChange={(x) => set("set_length", x)} placeholder="30-45 min" />
        <Field label="Travel range" value={v.travel_range} onChange={(x) => set("travel_range", x)} placeholder="Regional (OK / TX / KS)" />
        <Field label="Status" value={v.availability_status} onChange={(x) => set("availability_status", x)} placeholder="Available for Booking" />
        <Field label="Response time" value={v.response_time} onChange={(x) => set("response_time", x)} placeholder="Within 24 hours" />
        <Field label="Booking range" value={v.booking_range} onChange={(x) => set("booking_range", x)} placeholder="$300 - $750" />
        <Field label="Booking email" value={v.booking_email} onChange={(x) => set("booking_email", x)} placeholder="booking@cerberuslive.studio" />
      </section>

      <section>
        <span className="text-xs uppercase tracking-widest text-muted">Best for</span>
        <div className="mt-2 flex flex-wrap gap-2">
          {BEST_FOR_OPTIONS.map((item) => (
            <button
              type="button"
              key={item}
              onClick={() => toggleBestFor(item)}
              className={`rounded-full border px-3 py-1.5 text-xs transition ${
                v.bestFor.includes(item)
                  ? "border-red bg-red/10 text-red"
                  : "border-border text-muted hover:border-red"
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      </section>

      <section>
        <span className="text-xs uppercase tracking-widest text-muted">Performance profile</span>
        <div className="mt-2 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Crowd fit" value={v.ppCrowdFit} onChange={(x) => set("ppCrowdFit", x)} placeholder="Clubs, Colleges, Festivals" />
          <Field label="Clean set" value={v.ppCleanSet} onChange={(x) => set("ppCleanSet", x)} placeholder="Available on request" />
          <Field label="Languages" value={v.ppLanguages} onChange={(x) => set("ppLanguages", x)} placeholder="English" />
          <Field label="Energy" value={v.ppEnergy} onChange={(x) => set("ppEnergy", x)} placeholder="High" />
          <Field label="Equipment" value={v.ppEquipment} onChange={(x) => set("ppEquipment", x)} placeholder="Brings own mic + IEMs" />
          <label className="flex flex-col gap-1.5">
            <span className="text-xs uppercase tracking-widest text-muted">Stage presence</span>
            <div className="flex h-11 items-center gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button key={n} type="button" onClick={() => setV((p) => ({ ...p, ppStagePresence: n === p.ppStagePresence ? 0 : n }))} aria-label={`${n} stars`} className={`text-xl ${n <= v.ppStagePresence ? "text-red" : "text-foreground/20"}`}>★</button>
              ))}
            </div>
          </label>
        </div>
      </section>

      <section>
        <span className="text-xs uppercase tracking-widest text-muted">Availability this week</span>
        <div className="mt-2 grid grid-cols-7 gap-2">
          {WEEK.map((day) => {
            const booked = dayState(day) === "booked";
            return (
              <button key={day} type="button" onClick={() => toggleDay(day)} className={`flex flex-col items-center gap-1 rounded-lg border px-1 py-2 text-center text-xs ${booked ? "border-red/30 bg-red/10 text-red" : "border-green/30 bg-green/10 text-green"}`}>
                <span className="text-muted">{day}</span>
                <span className="text-[10px] font-medium">{booked ? "Booked" : "Open"}</span>
              </button>
            );
          })}
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Featured track title" value={v.featuredTitle} onChange={(x) => set("featuredTitle", x)} placeholder="Rise Above" />
        <Field label="Featured track length" value={v.featuredDuration} onChange={(x) => set("featuredDuration", x)} placeholder="3:24" />
      </section>

      <section>
        <span className="text-xs uppercase tracking-widest text-muted">Links</span>
        <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {SOCIAL_KEYS.map((k) => (
            <Field
              key={k}
              label={k}
              value={v.socials[k] ?? ""}
              onChange={(x) => setSocial(k, x)}
              placeholder={`https://...`}
            />
          ))}
        </div>
      </section>

      {error && <p className="text-sm text-red">{error}</p>}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={busy}
          className="h-11 rounded-md bg-red px-6 text-sm font-semibold text-white transition hover:bg-red-dark disabled:opacity-50"
        >
          {busy ? "Saving..." : "Save dossier"}
        </button>
        <a
          href={`/artist/${slug}`}
          className="flex h-11 items-center rounded-md border border-border px-6 text-sm text-muted transition hover:border-red hover:text-foreground"
        >
          View dossier
        </a>
      </div>
    </form>
  );
}
