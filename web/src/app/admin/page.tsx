import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { authFromContext } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { SiteHeader } from "@/components/dossier/SiteHeader";
import { AdminConsole } from "@/components/admin/AdminConsole";
import type {
  PendingReview,
  AdminArtist,
  AdminBooking,
  AdminUser,
  AdminStats,
  WaitlistRow,
} from "@/components/admin/AdminConsole";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const auth = authFromContext();
  const session = await auth.api.getSession({ headers: await headers() });
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (!session) redirect("/login");
  if (role !== "admin") {
    return (
      <>
        <SiteHeader />
        <main className="mx-auto w-full max-w-2xl px-6 py-16 text-center">
          <h1 className="text-2xl font-bold">Admin</h1>
          <p className="mt-2 text-muted">This area is for Cerberus admins.</p>
        </main>
      </>
    );
  }

  const db = getDb();
  const reviews = (
    await db
      .prepare(
        "SELECT id, artist_slug, reviewer_name, rating, body, sentiment, created_at FROM reviews WHERE status = 'pending' ORDER BY created_at"
      )
      .all<PendingReview>()
  ).results ?? [];
  const artists = (
    await db
      .prepare(
        "SELECT a.slug, a.display_name, a.tier, a.verified, a.gate_status, a.tunnel_url, a.suspended, a.featured, (SELECT COUNT(*) FROM reviews r WHERE r.artist_slug = a.slug AND r.status = 'approved' AND r.sentiment = 'negative') AS neg FROM artist_profiles a ORDER BY a.featured DESC, a.display_name"
      )
      .all<AdminArtist>()
  ).results ?? [];
  const bookings = (
    await db
      .prepare(
        "SELECT artist_slug, requester_name, kind, status, routed_to, created_at FROM bookings ORDER BY id DESC LIMIT 20"
      )
      .all<AdminBooking>()
  ).results ?? [];
  const users = (
    await db
      .prepare(
        "SELECT u.id, u.email, u.username, u.role, u.emailVerified, u.createdAt, (SELECT a.slug FROM artist_profiles a WHERE a.user_id = u.id LIMIT 1) AS dossier FROM user u ORDER BY u.createdAt DESC"
      )
      .all<AdminUser>()
  ).results ?? [];
  // The waitlist table is owned by the root waitlist worker; it may be absent in some envs
  // (e.g. a fresh local D1). Degrade gracefully rather than 500 the whole dashboard.
  let waitlist: WaitlistRow[] = [];
  try {
    waitlist = (
      await db.prepare("SELECT email, role, created_at FROM waitlist ORDER BY created_at DESC").all<WaitlistRow>()
    ).results ?? [];
  } catch {
    waitlist = [];
  }

  const stat = async (sql: string) =>
    (await db.prepare(sql).first<{ n: number }>())?.n ?? 0;
  const stats: AdminStats = {
    users: await stat("SELECT COUNT(*) AS n FROM user"),
    artists: await stat("SELECT COUNT(*) AS n FROM artist_profiles"),
    tracks: await stat("SELECT COUNT(*) AS n FROM tracks"),
    plays: await stat("SELECT COALESCE(SUM(play_count), 0) AS n FROM tracks"),
    bookings: await stat("SELECT COUNT(*) AS n FROM bookings"),
    waitlist: waitlist.length,
  };

  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-4xl px-6 py-12">
        <h1 className="mb-8 text-2xl font-bold tracking-tight">Cerberus Admin</h1>
        <AdminConsole
          reviews={reviews}
          artists={artists}
          bookings={bookings}
          users={users}
          waitlist={waitlist}
          stats={stats}
        />
      </main>
    </>
  );
}
