import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { authFromContext } from "@/lib/auth";
import { isControlDeckRequest } from "@/lib/host";
import { getDb } from "@/lib/db";
import { SiteHeader } from "@/components/dossier/SiteHeader";
import { AdminLiveControls } from "@/components/admin/AdminLiveControls";

export const dynamic = "force-dynamic";

type LiveRow = {
  id: number;
  artist_slug: string;
  display_name: string | null;
  kind: string;
  title: string | null;
  started_at: string;
  viewer_cap: number | null;
};

export default async function AdminLivePage() {
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
  const live = (
    await db
      .prepare(
        `SELECT ls.id, ls.artist_slug, ap.display_name, ls.kind, ls.title, ls.started_at, ls.viewer_cap
         FROM live_sessions ls
         LEFT JOIN artist_profiles ap ON ap.slug = ls.artist_slug
         WHERE ls.status = 'live'
         ORDER BY ls.started_at DESC`
      )
      .all<LiveRow>()
  ).results ?? [];

  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-4xl px-6 py-12">
        <div className="mb-6 flex items-center justify-between gap-3">
          <h1 className="text-2xl font-bold tracking-tight">Live now</h1>
          <Link href="/admin" className="text-sm text-muted transition hover:text-foreground">
            &larr; Control deck
          </Link>
        </div>
        <p className="mb-6 text-sm text-muted">
          Active streams. Drop in to watch any of them, or force-end one for moderation.
        </p>

        {live.length === 0 ? (
          <div className="rounded-xl border border-border bg-panel p-10 text-center">
            <p className="text-sm text-muted">No one is live right now.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {live.map((s) => (
              <div
                key={s.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-panel p-4"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex h-2 w-2 animate-pulse rounded-full bg-red" />
                    <span className="font-semibold text-foreground">
                      {s.display_name ?? s.artist_slug}
                    </span>
                    <span className="rounded-full border border-border px-2 py-0.5 text-[10px] uppercase tracking-widest text-muted">
                      {s.kind}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-muted">
                    {s.title ? `${s.title} · ` : ""}started {new Date(s.started_at).toLocaleString()}
                    {s.viewer_cap ? ` · cap ${s.viewer_cap}` : ""}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Link
                    href={`/live/${s.artist_slug}`}
                    className="rounded-md border border-border px-3 py-1.5 text-xs text-muted transition hover:border-red hover:text-foreground"
                  >
                    Watch
                  </Link>
                  <AdminLiveControls id={s.id} />
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
