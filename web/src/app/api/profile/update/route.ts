import { headers } from "next/headers";
import { authFromContext } from "@/lib/auth";
import { getDb, parseJson, DNA_AXES, type Socials, type DossierProfile, type PerformanceProfile, type AvailabilityDay, type ArtistDna, type ArtistTrait } from "@/lib/db";

export const dynamic = "force-dynamic";

// Scalar columns an artist may edit on their own dossier. Excludes the
// admin-only / earned fields (verified, signal_status, gate_status, clearance, tier).
const SCALAR_FIELDS = [
  "display_name",
  "subtitle",
  "city",
  "genre_tags",
  "artist_class",
  "performance_type",
  "set_length",
  "travel_range",
  "availability_status",
  "response_time",
  "member_since",
  "booking_range",
  "booking_email",
  "sound_style",
  "dossier_id",
  "bio",
] as const;

type Body = Partial<Record<(typeof SCALAR_FIELDS)[number], string>> & {
  socials?: Socials;
  bestFor?: string[];
  featuredTrack?: { title?: string; duration?: string };
  performanceProfile?: PerformanceProfile;
  availability?: AvailabilityDay[];
  traits?: ArtistTrait[];
  signatureSounds?: string[];
  influences?: string[];
  artistDna?: Record<string, number>;
};

export async function POST(req: Request) {
  const json = (code: number, body: unknown) =>
    new Response(JSON.stringify(body), {
      status: code,
      headers: { "Content-Type": "application/json" },
    });

  const auth = authFromContext();
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return json(401, { error: "Not signed in" });

  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return json(400, { error: "Invalid request body" });
  }

  const db = getDb();
  const userId = session.user.id;
  const profile = await db
    .prepare("SELECT slug, profile_json FROM artist_profiles WHERE user_id = ? LIMIT 1")
    .bind(userId)
    .first<{ slug: string; profile_json: string | null }>();
  if (!profile) return json(404, { error: "No profile to edit" });

  // Build a scalar SET clause from whitelisted, present fields only.
  const sets: string[] = [];
  const vals: (string | null)[] = [];
  for (const f of SCALAR_FIELDS) {
    if (f in body) {
      sets.push(`${f} = ?`);
      const v = (body[f] ?? "").toString().trim();
      vals.push(v === "" ? null : v);
    }
  }

  // Socials -> social_links JSON (only when provided).
  if (body.socials && typeof body.socials === "object") {
    const cleaned: Socials = {};
    for (const [k, v] of Object.entries(body.socials)) {
      if (typeof v === "string" && v.trim()) cleaned[k as keyof Socials] = v.trim();
    }
    sets.push("social_links = ?");
    vals.push(Object.keys(cleaned).length ? JSON.stringify(cleaned) : null);
  }

  // Nested fields merge into the existing profile_json blob.
  if (
    body.bestFor ||
    body.featuredTrack ||
    body.performanceProfile ||
    body.availability ||
    body.traits ||
    body.signatureSounds ||
    body.influences ||
    body.artistDna
  ) {
    const profileJson = parseJson<DossierProfile>(profile.profile_json, {});
    if (Array.isArray(body.bestFor)) {
      profileJson.bestFor = body.bestFor.filter((x) => typeof x === "string" && x.trim());
    }
    if (body.featuredTrack && (body.featuredTrack.title ?? "").trim()) {
      profileJson.featuredTrack = {
        title: body.featuredTrack.title!.trim(),
        artist: (body.display_name ?? "").trim() || undefined,
        duration: (body.featuredTrack.duration ?? "").trim() || undefined,
      };
    }
    if (body.performanceProfile && typeof body.performanceProfile === "object") {
      // Keep only non-empty fields so the card hides blanks.
      const pp: PerformanceProfile = {};
      for (const [k, v] of Object.entries(body.performanceProfile)) {
        if (k === "stagePresence") {
          const n = Number(v);
          if (n >= 1 && n <= 5) pp.stagePresence = n;
        } else if (typeof v === "string" && v.trim()) {
          (pp as Record<string, unknown>)[k] = v.trim();
        }
      }
      profileJson.performanceProfile = pp;
    }
    if (Array.isArray(body.availability)) {
      profileJson.availability = body.availability
        .filter((d) => d && typeof d.day === "string")
        .map((d) => ({ day: d.day, state: d.state === "booked" ? "booked" : "available" }));
    }
    // L-046 dossier enrichment: traits (1-5 stars), signature sounds + influences
    // (checklists), and the Artist DNA radar values (0-100 per axis).
    if (Array.isArray(body.traits)) {
      profileJson.traits = body.traits
        .filter((t) => t && typeof t.name === "string" && t.name.trim())
        .map((t) => ({
          name: t.name.trim(),
          rating: Math.max(0, Math.min(5, Math.round(Number(t.rating) || 0))),
        }))
        .filter((t) => t.rating > 0);
    }
    if (Array.isArray(body.signatureSounds)) {
      profileJson.signatureSounds = body.signatureSounds.filter(
        (s) => typeof s === "string" && s.trim()
      );
    }
    if (Array.isArray(body.influences)) {
      profileJson.influences = body.influences.filter(
        (s) => typeof s === "string" && s.trim()
      );
    }
    if (body.artistDna && typeof body.artistDna === "object") {
      const dna: ArtistDna = {};
      for (const axis of DNA_AXES) {
        const n = Number(body.artistDna[axis.key]);
        if (Number.isFinite(n) && n > 0) {
          dna[axis.key] = Math.max(0, Math.min(100, Math.round(n)));
        }
      }
      profileJson.artistDna = dna;
    }
    sets.push("profile_json = ?");
    vals.push(JSON.stringify(profileJson));
  }

  if (sets.length === 0) return json(400, { error: "Nothing to update" });

  sets.push("updated_at = ?");
  vals.push(new Date().toISOString());

  await db
    .prepare(`UPDATE artist_profiles SET ${sets.join(", ")} WHERE user_id = ?`)
    .bind(...vals, userId)
    .run();

  return json(200, { ok: true, slug: profile.slug });
}
