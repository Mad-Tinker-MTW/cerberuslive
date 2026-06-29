import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { authFromContext } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { SiteHeader } from "@/components/dossier/SiteHeader";
import { AccountActions } from "@/components/account/AccountActions";
import { AgentConnect } from "@/components/account/AgentConnect";

export const dynamic = "force-dynamic";

type ProfileRow = {
  slug: string;
  display_name: string;
  tunnel_url: string | null;
  media_origin: string | null;
};

export default async function AccountPage() {
  const auth = authFromContext();
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const { user } = session;
  const db = getDb();
  const profile = await db
    .prepare(
      "SELECT slug, display_name, tunnel_url, media_origin FROM artist_profiles WHERE user_id = ? LIMIT 1"
    )
    .bind(user.id)
    .first<ProfileRow>();

  // role is an additionalField on the Better Auth user
  const role = (user as { role?: string }).role ?? "fan";

  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-2xl px-6 py-12">
        <div className="mb-8 flex items-center gap-3">
          <h1 className="text-2xl font-bold tracking-tight">Account</h1>
          <span className="rounded-full border border-border px-2 py-0.5 text-xs text-muted">
            {role}
          </span>
          <Link
            href="/following"
            className="ml-auto text-sm text-muted transition hover:text-foreground"
          >
            Following
          </Link>
        </div>

        <div className="rounded-xl border border-border bg-panel p-5">
          <dl className="space-y-2.5 text-sm">
            <div className="flex justify-between gap-3">
              <dt className="text-muted">Email</dt>
              <dd>{user.email}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-muted">Verified</dt>
              <dd className={user.emailVerified ? "text-green" : "text-muted"}>
                {user.emailVerified ? "Yes" : "No"}
              </dd>
            </div>
          </dl>
        </div>

        <div className="mt-6 rounded-xl border border-border bg-panel p-5">
          <h2 className="mb-3 text-xs uppercase tracking-widest text-muted">
            Artist profile
          </h2>
          {profile ? (
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm">
                Your dossier:{" "}
                <Link
                  href={`/artist/${profile.slug}`}
                  className="text-red hover:underline"
                >
                  {profile.display_name}
                </Link>
              </p>
              <Link
                href="/account/edit"
                className="rounded-md border border-border px-3 py-1.5 text-xs text-muted transition hover:border-red hover:text-foreground"
              >
                Edit dossier
              </Link>
            </div>
          ) : (
            <p className="text-sm text-muted">
              You do not have an artist dossier yet. Claim one to appear in
              Discover Artists.
            </p>
          )}
        </div>

        {profile && (
          <div className="mt-6">
            <AgentConnect
              slug={profile.slug}
              tunnelUrl={profile.tunnel_url}
              mediaOrigin={profile.media_origin}
            />
          </div>
        )}

        <AccountActions hasProfile={!!profile} defaultName={user.name ?? ""} />
      </main>
    </>
  );
}
