import { headers } from "next/headers";
import { authFromContext } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { nextDossierId } from "@/lib/dossierId";

export const dynamic = "force-dynamic";

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

export async function POST(req: Request) {
  const json = (code: number, body: unknown) =>
    new Response(JSON.stringify(body), {
      status: code,
      headers: { "Content-Type": "application/json" },
    });

  const auth = authFromContext();
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return json(401, { error: "Not signed in" });

  let displayName = "";
  try {
    const body = (await req.json()) as { displayName?: string };
    displayName = (body.displayName ?? "").trim();
  } catch {
    return json(400, { error: "Invalid request body" });
  }
  if (!displayName) return json(400, { error: "Display name is required" });

  const db = getDb();
  const userId = session.user.id;

  // One profile per user (v1).
  const existing = await db
    .prepare("SELECT slug FROM artist_profiles WHERE user_id = ? LIMIT 1")
    .bind(userId)
    .first<{ slug: string }>();
  if (existing) return json(409, { error: "Profile already exists" });

  // Unique slug: base, then -2, -3, ... on collision.
  const base = slugify(displayName) || "artist";
  let slug = base;
  for (let i = 2; i < 50; i++) {
    const hit = await db
      .prepare("SELECT 1 FROM artist_profiles WHERE slug = ? LIMIT 1")
      .bind(slug)
      .first();
    if (!hit) break;
    slug = `${base}-${i}`;
  }

  const now = new Date().toISOString();
  // Auto-assign the next free-tier dossier ID (CLS-FR0A-001, ...); admin can override later.
  const dossierId = await nextDossierId(db, "free");
  await db
    .prepare(
      "INSERT INTO artist_profiles (user_id, slug, display_name, tier, dossier_id, created_at) VALUES (?, ?, ?, 'free', ?, ?)"
    )
    .bind(userId, slug, displayName, dossierId, now)
    .run();

  // Promote a fan to the artist role, but never downgrade an elevated role
  // (admin/venue) just because they claimed a dossier.
  await db
    .prepare("UPDATE user SET role = 'artist', updatedAt = ? WHERE id = ? AND (role IS NULL OR role = 'fan')")
    .bind(now, userId)
    .run();

  return json(200, { ok: true, slug });
}
