import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { authFromContext } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { SiteHeader } from "@/components/dossier/SiteHeader";
import { AdminConsole } from "@/components/admin/AdminConsole";
import type { PendingReview, AdminArtist, AdminBooking } from "@/components/admin/AdminConsole";

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
        "SELECT a.slug, a.display_name, a.tier, a.verified, a.gate_status, a.tunnel_url, (SELECT COUNT(*) FROM reviews r WHERE r.artist_slug = a.slug AND r.status = 'approved' AND r.sentiment = 'negative') AS neg FROM artist_profiles a ORDER BY a.display_name"
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

  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-4xl px-6 py-12">
        <h1 className="mb-8 text-2xl font-bold tracking-tight">Cerberus Admin</h1>
        <AdminConsole reviews={reviews} artists={artists} bookings={bookings} />
      </main>
    </>
  );
}
