import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { authFromContext } from "@/lib/auth";
import { isControlDeckRequest } from "@/lib/host";
import { getDb } from "@/lib/db";
import { SiteHeader } from "@/components/dossier/SiteHeader";
import { FanAdminControls } from "@/components/admin/FanAdminControls";
import { ContactUser } from "@/components/admin/ContactUser";

export const dynamic = "force-dynamic";

type FanRow = {
  id: string;
  email: string;
  username: string | null;
  role: string | null;
  emailVerified: number;
  createdAt: string;
};
type FollowRow = { artist_slug: string; display_name: string | null; created_at: string };
type WrittenReview = { id: number; artist_slug: string; rating: number; body: string | null; status: string; created_at: string };
type MadeBooking = { id: number; artist_slug: string; kind: string; status: string; created_at: string };

function Card({ title, count, children }: { title: string; count?: number; children: React.ReactNode }) {
  return (
    <section className="mb-8">
      <div className="mb-3 flex items-center gap-3">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-muted">{title}</h2>
        {count !== undefined && <span className="text-xs text-muted/60">{count}</span>}
        <div className="h-px flex-1 bg-border" />
      </div>
      {children}
    </section>
  );
}

export default async function AdminFanDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
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
  const u = await db
    .prepare("SELECT id, email, username, role, emailVerified, createdAt FROM user WHERE id = ?")
    .bind(id)
    .first<FanRow>();
  if (!u) notFound();

  const follows = (
    await db
      .prepare(
        "SELECT f.artist_slug, a.display_name, f.created_at FROM follows f LEFT JOIN artist_profiles a ON a.slug = f.artist_slug WHERE f.fan_user_id = ? ORDER BY f.created_at DESC"
      )
      .bind(id)
      .all<FollowRow>()
  ).results ?? [];
  const reviews = (
    await db
      .prepare("SELECT id, artist_slug, rating, body, status, created_at FROM reviews WHERE reviewer_email = ? ORDER BY created_at DESC")
      .bind(u.email)
      .all<WrittenReview>()
  ).results ?? [];
  const bookings = (
    await db
      .prepare("SELECT id, artist_slug, kind, status, created_at FROM bookings WHERE requester_email = ? ORDER BY id DESC")
      .bind(u.email)
      .all<MadeBooking>()
  ).results ?? [];

  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl px-6 py-12">
        <Link href="/admin" className="text-sm text-muted transition hover:text-foreground">&larr; Control deck</Link>

        <div className="mb-8 mt-4 flex flex-wrap items-center gap-3">
          <h1 className="break-all text-2xl font-bold tracking-tight">{u.username || u.email}</h1>
          <span className="rounded-full border border-border px-2 py-0.5 text-xs text-muted">{u.role ?? "fan"}</span>
          {u.emailVerified === 1 && <span className="text-xs text-green">verified</span>}
        </div>

        <Card title="Account">
          <div className="rounded-xl border border-border bg-panel p-5">
            <FanAdminControls userId={u.id} role={u.role ?? "fan"} />
            <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-border pt-4 text-xs text-muted">
              <span className="break-all">{u.email}</span>
              <span>joined {u.createdAt.slice(0, 10)}</span>
            </div>
            <div className="mt-4 border-t border-border pt-4">
              <ContactUser userId={u.id} label={u.username || u.email} />
            </div>
          </div>
        </Card>

        <Card title="Follows" count={follows.length}>
          {follows.length === 0 ? (
            <p className="text-sm text-muted">Not following anyone.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {follows.map((f) => (
                <Link key={f.artist_slug} href={`/admin/artist/${f.artist_slug}`} className="rounded-full border border-border bg-panel px-3 py-1.5 text-xs text-foreground/85 transition hover:border-red">
                  {f.display_name ?? f.artist_slug}
                </Link>
              ))}
            </div>
          )}
        </Card>

        <Card title="Reviews written" count={reviews.length}>
          {reviews.length === 0 ? (
            <p className="text-sm text-muted">No reviews written.</p>
          ) : (
            <div className="flex flex-col gap-1.5">
              {reviews.map((r) => (
                <div key={r.id} className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-md border border-border bg-panel px-3 py-2 text-xs">
                  <span className="font-mono text-muted">{r.created_at.slice(0, 10)}</span>
                  <Link href={`/admin/artist/${r.artist_slug}`} className="font-medium hover:underline">{r.artist_slug}</Link>
                  <span className="text-red">{"★".repeat(r.rating)}</span>
                  <span className="ml-auto text-muted">{r.status}</span>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card title="Bookings made" count={bookings.length}>
          {bookings.length === 0 ? (
            <p className="text-sm text-muted">No bookings made.</p>
          ) : (
            <div className="flex flex-col gap-1.5">
              {bookings.map((b) => (
                <div key={b.id} className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-md border border-border bg-panel px-3 py-2 text-xs">
                  <span className="font-mono text-muted">{b.created_at.slice(0, 10)}</span>
                  <Link href={`/admin/artist/${b.artist_slug}`} className="font-medium hover:underline">{b.artist_slug}</Link>
                  <span className="text-muted">{b.kind}</span>
                  <span className={`ml-auto ${b.status === "pending" ? "text-red" : "text-muted"}`}>{b.status}</span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </main>
    </>
  );
}
