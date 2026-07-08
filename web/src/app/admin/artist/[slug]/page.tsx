import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { authFromContext } from "@/lib/auth";
import { isControlDeckRequest } from "@/lib/host";
import { getDb, getTracks } from "@/lib/db";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { ArtistAdminControls, type ArtistAdminState } from "@/components/admin/ArtistAdminControls";
import { ReviewModerator, type ModReview } from "@/components/admin/ReviewModerator";
import { ContactUser } from "@/components/admin/ContactUser";
import { ChangeUserEmail } from "@/components/admin/ChangeUserEmail";
import { CopyLink } from "@/components/admin/CopyLink";

export const dynamic = "force-dynamic";

type Row = ArtistAdminState & {
  user_id: string | null;
  contact_email: string | null;
  tunnel_url: string | null;
  media_origin: string | null;
  login_email: string | null;
};
type BookingRow = {
  id: number;
  requester_name: string;
  requester_email: string;
  kind: string;
  status: string;
  event_date: string | null;
  created_at: string;
};
type ReviewRow = ModReview & { status: string; sentiment: string | null };

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

export default async function AdminArtistDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!(await isControlDeckRequest())) notFound();
  const auth = authFromContext();
  const session = await auth.api.getSession({ headers: await headers() });
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (!session) redirect("/admin/login");
  if (role !== "admin") {
    return (
      <>
        <AdminHeader />
        <main className="mx-auto w-full max-w-2xl px-6 py-16 text-center">
          <h1 className="text-2xl font-bold">Admin</h1>
          <p className="mt-2 text-muted">This area is for Cerberus admins.</p>
        </main>
      </>
    );
  }

  const db = getDb();
  const a = await db
    .prepare(
      "SELECT slug, display_name, tier, verified, gate_status, suspended, featured, user_id, contact_email, tunnel_url, media_origin, (SELECT email FROM user WHERE user.id = artist_profiles.user_id) AS login_email FROM artist_profiles WHERE slug = ?"
    )
    .bind(slug)
    .first<Row>();
  if (!a) notFound();

  const tracks = await getTracks(slug);
  const bookings = (
    await db
      .prepare(
        "SELECT id, requester_name, requester_email, kind, status, event_date, created_at FROM bookings WHERE artist_slug = ? ORDER BY id DESC"
      )
      .bind(slug)
      .all<BookingRow>()
  ).results ?? [];
  const reviews = (
    await db
      .prepare(
        "SELECT id, reviewer_name, rating, body, status, sentiment, created_at FROM reviews WHERE artist_slug = ? ORDER BY created_at DESC"
      )
      .bind(slug)
      .all<ReviewRow>()
  ).results ?? [];
  const followers = (await db.prepare("SELECT COUNT(*) AS n FROM follows WHERE artist_slug = ?").bind(slug).first<{ n: number }>())?.n ?? 0;

  const pending = reviews.filter((r) => r.status === "pending");
  const approved = reviews.filter((r) => r.status === "approved");
  const hasMedia = Boolean(a.tunnel_url || a.media_origin);

  return (
    <>
      <AdminHeader />
      <main className="mx-auto w-full max-w-3xl px-6 py-12">
        <Link href="/admin" className="text-sm text-muted transition hover:text-foreground">&larr; Control deck</Link>

        <div className="mb-8 mt-4 flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-bold tracking-tight">{a.display_name}</h1>
          <span className="rounded-full border border-border px-2 py-0.5 text-xs text-muted">
            {a.tier === "managed" ? "Managed" : "Free"}
          </span>
          {a.verified === 1 && <span className="text-green" title="verified">✓</span>}
          {a.featured === 1 && <span className="text-red" title="featured">★</span>}
          {a.suspended === 1 && <span className="rounded-full border border-red/40 bg-red/10 px-2 py-0.5 text-[10px] text-red">suspended</span>}
          <div className="ml-auto flex items-center gap-3">
            <CopyLink url={`https://cerberuslive.studio/artist/${a.slug}`} />
            <Link href={`/admin/artist/${a.slug}/preview`} className="text-sm text-red hover:underline">View public dossier &rarr;</Link>
          </div>
        </div>

        <Card title="Controls">
          <div className="rounded-xl border border-border bg-panel p-5">
            <ArtistAdminControls a={a} />
            <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-border pt-4 text-xs text-muted">
              <span>{followers} follower{followers === 1 ? "" : "s"}</span>
              <span className="flex items-center gap-1.5">
                <span className={`inline-block h-1.5 w-1.5 rounded-full ${hasMedia ? "bg-green" : "bg-muted/40"}`} />
                {hasMedia ? "streaming connected" : "no agent connected"}
              </span>
              {a.contact_email && <span>contact: {a.contact_email}</span>}
            </div>
            {a.user_id && (
              <div className="mt-4 border-t border-border pt-4">
                <ContactUser userId={a.user_id} label={a.display_name} />
              </div>
            )}
            {a.user_id && (
              <div className="mt-4 border-t border-border pt-4">
                <ChangeUserEmail userId={a.user_id} currentEmail={a.login_email} />
              </div>
            )}
          </div>
        </Card>

        <Card title="Tracks" count={tracks.length}>
          {tracks.length === 0 ? (
            <p className="text-sm text-muted">No tracks.</p>
          ) : (
            <div className="flex flex-col gap-1.5">
              {tracks.map((t) => (
                <div key={t.id} className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-md border border-border bg-panel px-3 py-2 text-sm">
                  {t.is_featured === 1 && <span className="text-red" title="featured">★</span>}
                  <span className="font-medium">{t.title}</span>
                  {t.duration && <span className="text-xs text-muted">{t.duration}</span>}
                  <span className="ml-auto text-xs text-muted">{t.play_count.toLocaleString()} plays</span>
                  <span className="text-[10px] uppercase tracking-widest text-muted/60">{t.source}</span>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card title="Reviews to moderate" count={pending.length}>
          <ReviewModerator reviews={pending} />
        </Card>

        {approved.length > 0 && (
          <Card title="Approved reviews" count={approved.length}>
            <div className="flex flex-col gap-2">
              {approved.map((r) => (
                <div key={r.id} className="rounded-md border border-border bg-panel px-3 py-2 text-sm">
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-medium">{r.reviewer_name}</span>
                    <span className="text-red">{"★".repeat(r.rating)}<span className="text-foreground/20">{"★".repeat(5 - r.rating)}</span></span>
                  </div>
                  {r.body && <p className="mt-1 text-xs text-foreground/80">{r.body}</p>}
                </div>
              ))}
            </div>
          </Card>
        )}

        <Card title="Bookings" count={bookings.length}>
          {bookings.length === 0 ? (
            <p className="text-sm text-muted">No bookings.</p>
          ) : (
            <div className="flex flex-col gap-1.5">
              {bookings.map((b) => (
                <div key={b.id} className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-md border border-border bg-panel px-3 py-2 text-xs">
                  <span className="font-mono text-muted">{b.created_at.slice(0, 10)}</span>
                  <span className="font-medium">{b.requester_name}</span>
                  <span className="text-muted">{b.kind}</span>
                  {b.event_date && <span className="text-muted">for {b.event_date}</span>}
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
