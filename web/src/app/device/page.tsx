import { headers } from "next/headers";
import { authFromContext } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { getGrantByUserCode } from "@/lib/device";
import { SiteHeader } from "@/components/dossier/SiteHeader";
import { DeviceApproval } from "@/components/device/DeviceApproval";
import { DeviceLoginPrompt } from "@/components/device/DeviceLoginPrompt";
import { DeviceOnboardingSteps } from "@/components/device/DeviceOnboardingSteps";

export const dynamic = "force-dynamic";

// Browser side of the desktop-agent device-authorization flow. Desktop shows a
// user_code and points the artist here. Signed out -> gate on magic-link. Signed in
// but missing dossier / streaming provisioning -> walk the artist through those steps
// inline. Everything green -> Approve / Deny buttons that flip the pending grant so
// the desktop's next poll returns keys.
export default async function DevicePage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string }>;
}) {
  const { code } = await searchParams;
  const initialCode = (code ?? "").trim().toUpperCase();

  const auth = authFromContext();
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return (
      <>
        <SiteHeader />
        <main className="mx-auto w-full max-w-md px-6 py-16">
          <DeviceLoginPrompt initialCode={initialCode} />
        </main>
      </>
    );
  }

  const db = getDb();
  const profile = await db
    .prepare(
      "SELECT slug, display_name, media_origin, tunnel_token, agent_key FROM artist_profiles WHERE user_id = ? LIMIT 1"
    )
    .bind(session.user.id)
    .first<{
      slug: string;
      display_name: string;
      media_origin: string | null;
      tunnel_token: string | null;
      agent_key: string | null;
    }>();

  const hasProfile = !!profile;
  const hasStreaming = !!(profile?.media_origin && profile?.tunnel_token);

  // If the caller landed here with a code query param and a pending grant matches
  // + prerequisites are satisfied, we render the Approve UI directly.
  let grantStatus: string | null = null;
  if (initialCode) {
    const grant = await getGrantByUserCode(initialCode);
    grantStatus = grant?.status ?? "unknown";
  }

  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-md px-6 py-16">
        <h1 className="mb-2 text-2xl font-bold tracking-tight">Connect a device</h1>
        <p className="mb-8 text-sm text-muted">
          Enter the code shown by your Cerberus Agent to link it to your account.
        </p>

        {!hasProfile || !hasStreaming ? (
          <DeviceOnboardingSteps
            hasProfile={hasProfile}
            hasStreaming={hasStreaming}
            initialCode={initialCode}
            defaultName={session.user.name ?? ""}
          />
        ) : (
          <DeviceApproval
            initialCode={initialCode}
            initialGrantStatus={grantStatus}
            displayName={profile!.display_name}
          />
        )}
      </main>
    </>
  );
}

