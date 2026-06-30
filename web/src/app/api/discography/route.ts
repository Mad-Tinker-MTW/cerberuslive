import { headers } from "next/headers";
import { authFromContext } from "@/lib/auth";
import { getDb } from "@/lib/db";
import type { D1Database } from "@cloudflare/workers-types";

export const dynamic = "force-dynamic";

// Session-authed CRUD for an artist's discography (personas / releases / tracks).
// Every op is scoped to the artist owned by the signed-in user; a row is only
// touched after confirming its artist_slug matches. Body: { op, ...fields }.
//   persona.save | persona.delete | release.save | release.delete | track.save | track.delete
// "save" creates when no id is present, updates when id belongs to the caller.
// Deletes never destroy child tracks: they reassign to the direct/self lane.

type Body = Record<string, unknown>;

function str(v: unknown): string | null {
  if (typeof v !== "string") return null;
  const t = v.trim();
  return t === "" ? null : t;
}
function intOrNull(v: unknown): number | null {
  if (v === null || v === undefined || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? Math.trunc(n) : null;
}
function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60) || "x";
}

/** Resolve a unique persona slug within the artist (name-derived, -2/-3 on collision). */
async function uniquePersonaSlug(
  db: D1Database,
  artistSlug: string,
  base: string,
  excludeId: number | null
): Promise<string> {
  let candidate = base;
  for (let i = 1; i < 50; i++) {
    const row = await db
      .prepare("SELECT id FROM personas WHERE artist_slug = ? AND slug = ? LIMIT 1")
      .bind(artistSlug, candidate)
      .first<{ id: number }>();
    if (!row || row.id === excludeId) return candidate;
    candidate = `${base}-${i + 1}`;
  }
  return `${base}-${Date.now()}`;
}

export async function POST(req: Request) {
  const json = (code: number, body: unknown) =>
    new Response(JSON.stringify(body), {
      status: code,
      headers: { "Content-Type": "application/json" },
    });

  const session = await authFromContext().api.getSession({ headers: await headers() });
  if (!session) return json(401, { error: "Not signed in" });

  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return json(400, { error: "Invalid request body" });
  }
  const op = str(body.op);
  if (!op) return json(400, { error: "Missing op" });

  const db = getDb();
  const owner = await db
    .prepare("SELECT slug FROM artist_profiles WHERE user_id = ? LIMIT 1")
    .bind(session.user.id)
    .first<{ slug: string }>();
  if (!owner) return json(404, { error: "No artist profile" });
  const artistSlug = owner.slug;
  const now = new Date().toISOString();

  // --- ownership guards -----------------------------------------------------
  const ownsPersona = async (id: number) =>
    !!(await db
      .prepare("SELECT id FROM personas WHERE id = ? AND artist_slug = ? LIMIT 1")
      .bind(id, artistSlug)
      .first());
  const ownsRelease = async (id: number) =>
    !!(await db
      .prepare("SELECT id FROM releases WHERE id = ? AND artist_slug = ? LIMIT 1")
      .bind(id, artistSlug)
      .first());
  const ownsTrack = async (id: number) =>
    !!(await db
      .prepare("SELECT id FROM tracks WHERE id = ? AND artist_slug = ? LIMIT 1")
      .bind(id, artistSlug)
      .first());

  switch (op) {
    case "persona.save": {
      const name = str(body.name);
      if (!name) return json(400, { error: "Persona name is required" });
      const kind = str(body.kind) === "group" ? "group" : "solo";
      const bio = str(body.bio);
      const dedication = str(body.dedication);
      const sort = intOrNull(body.sort) ?? 0;
      // members: array of {name, role?}, only for groups.
      let members: string | null = null;
      if (kind === "group" && Array.isArray(body.members)) {
        const cleaned = (body.members as unknown[])
          .map((m) => (m && typeof m === "object" ? (m as Record<string, unknown>) : {}))
          .map((m) => ({ name: str(m.name), role: str(m.role) }))
          .filter((m): m is { name: string; role: string | null } => !!m.name)
          .map((m) => (m.role ? { name: m.name, role: m.role } : { name: m.name }));
        members = cleaned.length ? JSON.stringify(cleaned) : null;
      }
      const id = intOrNull(body.id);
      if (id) {
        if (!(await ownsPersona(id))) return json(403, { error: "Not your persona" });
        const slug = await uniquePersonaSlug(db, artistSlug, slugify(name), id);
        await db
          .prepare(
            "UPDATE personas SET slug=?, name=?, kind=?, members=?, bio=?, dedication=?, sort=? WHERE id=? AND artist_slug=?"
          )
          .bind(slug, name, kind, members, bio, dedication, sort, id, artistSlug)
          .run();
        return json(200, { ok: true, id });
      }
      const slug = await uniquePersonaSlug(db, artistSlug, slugify(name), null);
      const res = await db
        .prepare(
          "INSERT INTO personas (artist_slug, slug, name, kind, members, bio, dedication, sort, created_at) VALUES (?,?,?,?,?,?,?,?,?)"
        )
        .bind(artistSlug, slug, name, kind, members, bio, dedication, sort, now)
        .run();
      return json(200, { ok: true, id: res.meta.last_row_id });
    }

    case "persona.delete": {
      const id = intOrNull(body.id);
      if (!id || !(await ownsPersona(id))) return json(403, { error: "Not your persona" });
      // Orphan children to the direct lane rather than destroying tracks.
      await db.prepare("UPDATE tracks SET persona_id=NULL, release_id=NULL WHERE persona_id=? AND artist_slug=?").bind(id, artistSlug).run();
      await db.prepare("DELETE FROM releases WHERE persona_id=? AND artist_slug=?").bind(id, artistSlug).run();
      await db.prepare("DELETE FROM personas WHERE id=? AND artist_slug=?").bind(id, artistSlug).run();
      return json(200, { ok: true });
    }

    case "release.save": {
      const title = str(body.title);
      if (!title) return json(400, { error: "Release title is required" });
      const kindRaw = str(body.kind);
      const kind = ["album", "ep", "single"].includes(kindRaw ?? "") ? kindRaw! : "single";
      const year = str(body.year);
      const cover_url = str(body.cover_url);
      const dedication = str(body.dedication);
      const sort = intOrNull(body.sort) ?? 0;
      let persona_id = intOrNull(body.persona_id);
      if (persona_id && !(await ownsPersona(persona_id))) persona_id = null;
      const id = intOrNull(body.id);
      if (id) {
        if (!(await ownsRelease(id))) return json(403, { error: "Not your release" });
        await db
          .prepare(
            "UPDATE releases SET persona_id=?, title=?, kind=?, year=?, cover_url=?, dedication=?, sort=? WHERE id=? AND artist_slug=?"
          )
          .bind(persona_id, title, kind, year, cover_url, dedication, sort, id, artistSlug)
          .run();
        return json(200, { ok: true, id });
      }
      const res = await db
        .prepare(
          "INSERT INTO releases (artist_slug, persona_id, title, kind, year, cover_url, dedication, sort, created_at) VALUES (?,?,?,?,?,?,?,?,?)"
        )
        .bind(artistSlug, persona_id, title, kind, year, cover_url, dedication, sort, now)
        .run();
      return json(200, { ok: true, id: res.meta.last_row_id });
    }

    case "release.delete": {
      const id = intOrNull(body.id);
      if (!id || !(await ownsRelease(id))) return json(403, { error: "Not your release" });
      await db.prepare("UPDATE tracks SET release_id=NULL, persona_id=NULL WHERE release_id=? AND artist_slug=?").bind(id, artistSlug).run();
      await db.prepare("DELETE FROM releases WHERE id=? AND artist_slug=?").bind(id, artistSlug).run();
      return json(200, { ok: true });
    }

    case "track.save": {
      const title = str(body.title);
      const filename = str(body.filename);
      if (!title) return json(400, { error: "Track title is required" });
      if (!filename) return json(400, { error: "Track filename is required" });
      const duration = str(body.duration);
      const version_label = str(body.version_label);
      const performer = str(body.performer);
      const composer = str(body.composer);
      const track_no = intOrNull(body.track_no);
      const sort = intOrNull(body.sort) ?? 0;
      const is_featured = body.is_featured ? 1 : 0;
      const media_kind = str(body.media_kind) === "video" ? "video" : "audio";
      let release_id = intOrNull(body.release_id);
      if (release_id && !(await ownsRelease(release_id))) release_id = null;
      let persona_id = intOrNull(body.persona_id);
      if (persona_id && !(await ownsPersona(persona_id))) persona_id = null;
      const id = intOrNull(body.id);
      if (id) {
        if (!(await ownsTrack(id))) return json(403, { error: "Not your track" });
        await db
          .prepare(
            "UPDATE tracks SET title=?, filename=?, duration=?, release_id=?, persona_id=?, version_label=?, performer=?, composer=?, track_no=?, sort=?, is_featured=?, media_kind=? WHERE id=? AND artist_slug=?"
          )
          .bind(title, filename, duration, release_id, persona_id, version_label, performer, composer, track_no, sort, is_featured, media_kind, id, artistSlug)
          .run();
        return json(200, { ok: true, id });
      }
      const res = await db
        .prepare(
          "INSERT INTO tracks (artist_slug, title, filename, duration, release_id, persona_id, version_label, performer, composer, track_no, is_featured, sort, media_kind, source, managed_by, created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?, 'self', 'web', ?)"
        )
        .bind(artistSlug, title, filename, duration, release_id, persona_id, version_label, performer, composer, track_no, is_featured, sort, media_kind, now)
        .run();
      return json(200, { ok: true, id: res.meta.last_row_id });
    }

    case "track.delete": {
      const id = intOrNull(body.id);
      if (!id || !(await ownsTrack(id))) return json(403, { error: "Not your track" });
      await db.prepare("DELETE FROM tracks WHERE id=? AND artist_slug=?").bind(id, artistSlug).run();
      return json(200, { ok: true });
    }

    default:
      return json(400, { error: `Unknown op: ${op}` });
  }
}
