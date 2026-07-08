import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  authFromContext,
} from "@/lib/auth";
import {
  getDb,
  parseJson,
  rolesList,
  type ArtistDossier,
  type Socials,
  type DossierProfile,
} from "@/lib/db";
import { SiteHeader } from "@/components/dossier/SiteHeader";
import { ProfileEditor, type EditorValues } from "@/components/account/ProfileEditor";
import { WEEK } from "@/components/account/availability";

export const dynamic = "force-dynamic";

const COLS =
  "slug, display_name, bio, city, genre_tags, photo_url, tier, subtitle, dossier_id, " +
  "artist_class, performance_type, set_length, travel_range, availability_status, " +
  "response_time, member_since, verified, booking_range, clearance, signal_status, " +
  "gate_status, sound_style, booking_email, label, roles, social_links, profile_json";

export default async function EditProfilePage() {
  const auth = authFromContext();
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const db = getDb();
  const p = await db
    .prepare(`SELECT ${COLS} FROM artist_profiles WHERE user_id = ? LIMIT 1`)
    .bind(session.user.id)
    .first<ArtistDossier>();
  if (!p) redirect("/account"); // claim a dossier first

  const socials = parseJson<Socials>(p.social_links, {});
  const profile = parseJson<DossierProfile>(p.profile_json, {});

  const initial: EditorValues = {
    photoUrl: p.photo_url ?? "",
    display_name: p.display_name ?? "",
    subtitle: p.subtitle ?? "",
    artist_class: p.artist_class ?? "",
    city: p.city ?? "",
    genre_tags: p.genre_tags ?? "",
    bio: p.bio ?? "",
    sound_style: p.sound_style ?? "",
    performance_type: p.performance_type ?? "",
    set_length: p.set_length ?? "",
    travel_range: p.travel_range ?? "",
    availability_status: p.availability_status ?? "",
    response_time: p.response_time ?? "",
    booking_range: p.booking_range ?? "",
    booking_email: p.booking_email ?? "",
    label: p.label ?? "",
    dossier_id: p.dossier_id ?? "",
    socials,
    bestFor: profile.bestFor ?? [],
    featuredTitle: profile.featuredTrack?.title ?? "",
    featuredDuration: profile.featuredTrack?.duration ?? "",
    ppCrowdFit: profile.performanceProfile?.crowdFit ?? "",
    ppCleanSet: profile.performanceProfile?.cleanSet ?? "",
    ppLanguages: profile.performanceProfile?.languages ?? "",
    ppEnergy: profile.performanceProfile?.energy ?? "",
    ppEquipment: profile.performanceProfile?.equipment ?? "",
    ppStagePresence: profile.performanceProfile?.stagePresence ?? 0,
    availability:
      profile.availability && profile.availability.length > 0
        ? profile.availability
        : WEEK.map((day) => ({ day, state: "available" as const })),
    traitRatings: Object.fromEntries(
      (profile.traits ?? []).map((t) => [t.name, t.rating])
    ),
    signatureSounds: profile.signatureSounds ?? [],
    influences: profile.influences ?? [],
    dna: { ...(profile.artistDna ?? {}) },
    roles: rolesList(p.roles),
  };

  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl px-6 py-12">
        <div className="mb-8 flex items-center justify-between gap-3">
          <h1 className="text-2xl font-bold tracking-tight">Edit dossier</h1>
          <Link href="/account" className="text-sm text-muted transition hover:text-foreground">
            &larr; Account
          </Link>
        </div>
        <p className="mb-6 text-sm text-muted">
          Verification, signal, and gate status are earned and set by Cerberus, so they
          are not editable here.
        </p>
        <ProfileEditor slug={p.slug} initial={initial} />
      </main>
    </>
  );
}
