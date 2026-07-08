import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { authFromContext } from "@/lib/auth";
import { isControlDeckRequest } from "@/lib/host";
import { getDb, ADMIN_ARTIST_SELECT, FLAGGED_NEG_THRESHOLD } from "@/lib/db";
import { SiteHeader } from "@/components/dossier/SiteHeader";
import { AdminConsole } from "@/components/admin/AdminConsole";
import type {
  PendingReview,
  AdminArtist,
  AdminFan,
  AdminVenue,
  AdminMetrics,
  SupportMessage,
} from "@/components/admin/AdminConsole";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  // The control deck only exists on its own host; on the public origin it 404s.
  if (!(await isControlDeckRequest())) notFound();

  const auth = authFromContext();
  const session = await auth.api.getSession({ headers: await headers() });
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (!session) redirect("/admin/login");
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

  // The per-tier artist tables now page + search server-side (api/admin/artists), so the
  // dashboard no longer loads every artist. The Overview still needs the (small) flagged
  // set — artists carrying >= FLAGGED_NEG_THRESHOLD approved negative reviews — so read
  // only those here, with the shared metric SELECT.
  const flagged = (
    await db
      .prepare(
        `SELECT ${ADMIN_ARTIST_SELECT}
         FROM artist_profiles a
         WHERE (SELECT COUNT(*) FROM reviews r WHERE r.artist_slug = a.slug AND r.status = 'approved' AND r.sentiment = 'negative') >= ${FLAGGED_NEG_THRESHOLD}
         ORDER BY a.display_name`
      )
      .all<AdminArtist>()
  ).results ?? [];

  // Fans: role 'fan' only. Reviews/bookings link by email; follows by user id.
  const fans = (
    await db
      .prepare(
        `SELECT u.id, u.email, u.username, u.createdAt,
           (SELECT COUNT(*) FROM follows f WHERE f.fan_user_id = u.id) AS follows,
           (SELECT COUNT(*) FROM reviews r WHERE r.reviewer_email = u.email) AS reviews,
           (SELECT COUNT(*) FROM bookings b WHERE b.requester_email = u.email) AS bookings,
           (SELECT MAX(s.updatedAt) FROM session s WHERE s.userId = u.id) AS last_active
         FROM user u
         WHERE u.role = 'fan'
         ORDER BY u.createdAt DESC`
      )
      .all<AdminFan>()
  ).results ?? [];

  const venues = (
    await db
      .prepare("SELECT id, email, username, createdAt FROM user WHERE role = 'venue' ORDER BY createdAt DESC")
      .all<AdminVenue>()
  ).results ?? [];

  // Support messages (control deck Inbox). Table may be absent in a fresh env;
  // degrade gracefully rather than 500 the whole dashboard.
  let support: SupportMessage[] = [];
  try {
    support = (
      await db
        .prepare(
          "SELECT id, user_id, name, email, subject, body, status, created_at FROM support_messages ORDER BY (status = 'open') DESC, created_at DESC"
        )
        .all<SupportMessage>()
    ).results ?? [];
  } catch {
    support = [];
  }

  const stat = async (sql: string) =>
    (await db.prepare(sql).first<{ n: number }>())?.n ?? 0;
  const cutoff30 = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const bookings30d =
    (await db
      .prepare("SELECT COUNT(*) AS n FROM bookings WHERE kind = 'booking' AND created_at >= ?")
      .bind(cutoff30)
      .first<{ n: number }>())?.n ?? 0;
  const metrics: AdminMetrics = {
    // People counts exclude the owner/admin (role 'admin').
    managed: await stat("SELECT COUNT(*) AS n FROM artist_profiles WHERE tier = 'managed'"),
    plus: await stat("SELECT COUNT(*) AS n FROM artist_profiles WHERE tier = 'plus'"),
    free: await stat("SELECT COUNT(*) AS n FROM artist_profiles WHERE tier = 'free'"),
    fans: await stat("SELECT COUNT(*) AS n FROM user WHERE role = 'fan'"),
    venues: await stat("SELECT COUNT(*) AS n FROM user WHERE role = 'venue'"),
    reviewsPending: reviews.length,
    openBookings: await stat("SELECT COUNT(*) AS n FROM bookings WHERE status = 'pending'"),
    flaggedArtists: flagged.length,
    problemReports: support.filter((m) => m.status === "open").length,
    bookingsTotal: await stat("SELECT COUNT(*) AS n FROM bookings WHERE kind = 'booking'"),
    bookedArtists: await stat("SELECT COUNT(DISTINCT artist_slug) AS n FROM bookings WHERE kind = 'booking'"),
    bookings30d,
  };

  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-5xl px-6 py-12">
        <div className="mb-8 flex items-center justify-between gap-3">
          <h1 className="text-2xl font-bold tracking-tight">Cerberus Control Deck</h1>
          <div className="flex items-center gap-4">
            <Link href="/admin/live" className="text-sm text-muted transition hover:text-foreground">
              Live now
            </Link>
            <Link href="/admin/security" className="text-sm text-muted transition hover:text-foreground">
              Security
            </Link>
          </div>
        </div>
        <AdminConsole
          reviews={reviews}
          flagged={flagged}
          fans={fans}
          venues={venues}
          support={support}
          metrics={metrics}
        />
      </main>
    </>
  );
}
