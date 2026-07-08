import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { authFromContext } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { SiteHeader } from "@/components/dossier/SiteHeader";
import { Onboarding } from "@/components/onboarding/Onboarding";

export const dynamic = "force-dynamic";

// First-run onboarding after magic-link sign-in: pick a handle, then a role. Once the user has a
// handle they're considered onboarded and sent on to their account.
export default async function WelcomePage() {
  const session = await authFromContext().api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const db = getDb();
  const row = await db
    .prepare("SELECT username FROM user WHERE id = ? LIMIT 1")
    .bind(session.user.id)
    .first<{ username: string | null }>();
  if (row?.username) redirect("/account");

  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-md px-6 py-16">
        <Onboarding hasHandle={false} currentHandle={null} />
      </main>
    </>
  );
}
