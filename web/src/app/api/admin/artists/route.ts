import { headers } from "next/headers";
import { authFromContext } from "@/lib/auth";
import { getDb, ADMIN_ARTIST_SELECT, ADMIN_ARTIST_SORT, ADMIN_ARTIST_PAGE_SIZE } from "@/lib/db";
import type { AdminArtist } from "@/components/admin/AdminConsole";

export const dynamic = "force-dynamic";

// Admin-only: a page of artists scoped to one tier, with server-side name/slug search,
// whitelisted sort, and LIMIT/OFFSET pagination. Replaces the old load-everything read so
// the control deck scales past a couple thousand artists.

const TIERS = new Set(["managed", "plus", "free"]);

/** Wrap a search term for LIKE, escaping the wildcards so a literal % or _ matches itself
 *  (paired with `ESCAPE '\'` in the SQL). */
function likeParam(q: string): string {
  return "%" + q.replace(/[\\%_]/g, (c) => "\\" + c) + "%";
}

export async function GET(req: Request) {
  const json = (code: number, b: unknown) =>
    new Response(JSON.stringify(b), { status: code, headers: { "Content-Type": "application/json" } });

  const auth = authFromContext();
  const session = await auth.api.getSession({ headers: await headers() });
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (!session || role !== "admin") return json(403, { error: "Admin only" });

  const params = new URL(req.url).searchParams;
  const tier = (params.get("tier") ?? "").trim();
  if (!TIERS.has(tier)) return json(400, { error: "Invalid tier" });

  const q = (params.get("q") ?? "").trim();
  const sortExpr = ADMIN_ARTIST_SORT[params.get("sort") ?? ""] ?? ADMIN_ARTIST_SORT.display_name;
  const dir = params.get("dir") === "desc" ? "DESC" : "ASC";
  const page = Math.max(0, Number.parseInt(params.get("page") ?? "0", 10) || 0);
  const offset = page * ADMIN_ARTIST_PAGE_SIZE;

  // Tier scope + optional name/slug search.
  const where = ["a.tier = ?"];
  const binds: (string | number)[] = [tier];
  if (q) {
    where.push("(a.display_name LIKE ? ESCAPE '\\' OR a.slug LIKE ? ESCAPE '\\')");
    const like = likeParam(q);
    binds.push(like, like);
  }
  const whereSql = where.join(" AND ");

  const db = getDb();

  const totalRow = await db
    .prepare(`SELECT COUNT(*) AS n FROM artist_profiles a WHERE ${whereSql}`)
    .bind(...binds)
    .first<{ n: number }>();
  const total = totalRow?.n ?? 0;

  // Secondary sort by slug keeps paging stable when the primary key ties (e.g. two artists
  // with equal play counts would otherwise shuffle between pages).
  const { results } = await db
    .prepare(
      `SELECT ${ADMIN_ARTIST_SELECT} FROM artist_profiles a WHERE ${whereSql}
         ORDER BY ${sortExpr} ${dir}, a.slug ASC
         LIMIT ? OFFSET ?`
    )
    .bind(...binds, ADMIN_ARTIST_PAGE_SIZE, offset)
    .all<AdminArtist>();

  return json(200, { rows: results ?? [], total, page, pageSize: ADMIN_ARTIST_PAGE_SIZE });
}
