import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { authFromContext } from "@/lib/auth";
import { getDb, getActiveLive, liveCaps, getWeeklyLiveMinutes, getPosts, performanceMode } from "@/lib/db";
import { SiteHeader } from "@/components/dossier/SiteHeader";
import { AccountActions } from "@/components/account/AccountActions";
import { AgentConnect } from "@/components/account/AgentConnect";
import { AgentInstall } from "@/components/account/AgentInstall";
import { LiveControl } from "@/components/account/LiveControl";
import { PostComposer } from "@/components/account/PostComposer";
import { BillingCard } from "@/components/account/BillingCard";
import { billingConfigured } from "@/lib/billing";

export const dynamic = "force-dynamic";

type ProfileRow = {
  slug: string;
  display_name: string;
  tunnel_url: string | null;
  media_origin: string | null;
  tier: string;
  roles: string | null;
  subscription_status: string | null;
  stripe_customer_id: string | null;
};

export default async function AccountPage() {
  const auth = authFromContext();
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const { user } = session;
  const db = getDb();
  const profile = await db
    .prepare(
      "SELECT slug, display_name, tunnel_url, media_origin, tier, roles, subscription_status, stripe_customer_id FROM artist_profiles WHERE user_id = ? LIMIT 1"
    )
    .bind(user.id)
    .first<ProfileRow>();
  const live = profile ? await getActiveLive(profile.slug) : null;
  const caps = profile ? liveCaps(profile.tier) : null;
  const usedLiveMinutes = profile && caps?.weeklyMinutes != null ? await getWeeklyLiveMinutes(profile.slug) : 0;
  // Owner sees all their own posts (public + followers-only) for management.
  const ownPosts = profile ? await getPosts(profile.slug, true) : [];

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
              <div className="flex gap-2">
                <Link
                  href="/account/discography"
                  className="rounded-md border border-border px-3 py-1.5 text-xs text-muted transition hover:border-red hover:text-foreground"
                >
                  Discography
                </Link>
                <Link
                  href="/account/edit"
                  className="rounded-md border border-border px-3 py-1.5 text-xs text-muted transition hover:border-red hover:text-foreground"
                >
                  Edit dossier
                </Link>
              </div>
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

        {profile && (
          <div className="mt-6">
            <AgentInstall />
          </div>
        )}

        {profile && (
          <div className="mt-6">
            <LiveControl
              slug={profile.slug}
              tier={profile.tier}
              initialKind={live ? (live.kind as "window" | "event") : null}
              weeklyMinutes={caps?.weeklyMinutes ?? null}
              usedMinutes={Math.round(usedLiveMinutes)}
              viewerCap={caps?.viewerCap ?? 0}
              sessionMaxMinutes={caps?.sessionMaxMinutes ?? 0}
              mode={performanceMode(profile.roles)}
            />
          </div>
        )}

        {profile && (
          <div className="mt-6">
            <BillingCard
              tier={profile.tier}
              status={profile.subscription_status}
              configured={billingConfigured()}
              hasCustomer={!!profile.stripe_customer_id}
            />
          </div>
        )}

        {profile && (
          <div className="mt-6">
            <PostComposer initialPosts={ownPosts} />
          </div>
        )}

        <AccountActions hasProfile={!!profile} defaultName={user.name ?? ""} />
      </main>
    </>
  );
}
