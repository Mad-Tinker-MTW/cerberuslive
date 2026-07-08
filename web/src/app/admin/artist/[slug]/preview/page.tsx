import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { authFromContext } from "@/lib/auth";
import { isControlDeckRequest } from "@/lib/host";

export const dynamic = "force-dynamic";

// Admin-framed preview of an artist's PUBLIC dossier. The real page is shown in an
// iframe (so it renders byte-for-byte, no changes to the public route) under an admin
// back bar. Lets an admin see exactly what the public sees without losing their place
// in the control deck (no more browser-backspacing off to the live site).
export default async function ArtistDossierPreview({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!(await isControlDeckRequest())) notFound();
  const auth = authFromContext();
  const session = await auth.api.getSession({ headers: await headers() });
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (!session) redirect("/admin/login");
  if (role !== "admin") {
    return (
      <main className="mx-auto w-full max-w-2xl px-6 py-16 text-center">
        <h1 className="text-2xl font-bold">Admin</h1>
        <p className="mt-2 text-muted">This area is for Cerberus admins.</p>
      </main>
    );
  }

  return (
    <div className="flex h-[100dvh] flex-col">
      <div className="flex items-center gap-4 border-b border-border bg-panel px-4 py-2.5">
        <Link
          href={`/admin/artist/${slug}`}
          className="rounded-md border border-border px-3 py-1.5 text-sm text-muted transition hover:border-red hover:text-foreground"
        >
          &larr; Back to admin
        </Link>
        <span className="min-w-0 truncate text-sm text-muted">
          Public dossier preview <span className="text-foreground">/artist/{slug}</span>
        </span>
        <a
          href={`/artist/${slug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="ml-auto text-sm text-red hover:underline"
        >
          Open live page &#8599;
        </a>
      </div>
      <iframe
        src={`/artist/${slug}`}
        title={`Public dossier for ${slug}`}
        className="w-full flex-1 border-0 bg-background"
      />
    </div>
  );
}
