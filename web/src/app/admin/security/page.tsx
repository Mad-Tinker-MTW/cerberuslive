import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { authFromContext } from "@/lib/auth";
import { isControlDeckRequest } from "@/lib/host";
import { getDb } from "@/lib/db";
import { SiteHeader } from "@/components/dossier/SiteHeader";
import { TwoFactorSetup } from "@/components/admin/TwoFactorSetup";
import { AdminManager, type AdminRow } from "@/components/admin/AdminManager";

export const dynamic = "force-dynamic";

export default async function AdminSecurityPage() {
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
  const row = await db
    .prepare("SELECT twoFactorEnabled FROM user WHERE id = ?")
    .bind(session.user.id)
    .first<{ twoFactorEnabled: number }>();
  const enabled = (row?.twoFactorEnabled ?? 0) === 1;

  const admins = (
    await db
      .prepare("SELECT id, email, username, name FROM user WHERE role = 'admin' ORDER BY createdAt")
      .all<AdminRow>()
  ).results ?? [];

  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-2xl px-6 py-12">
        <Link href="/admin" className="text-sm text-muted transition hover:text-foreground">&larr; Control deck</Link>
        <h1 className="mb-2 mt-4 text-2xl font-bold tracking-tight">Security</h1>
        <p className="mb-6 text-sm text-muted">
          Two-factor for the control deck. Cloudflare Access also gates this host at the edge.
        </p>
        <TwoFactorSetup enabled={enabled} />

        <div className="mt-8">
          <AdminManager admins={admins} />
        </div>
      </main>
    </>
  );
}
