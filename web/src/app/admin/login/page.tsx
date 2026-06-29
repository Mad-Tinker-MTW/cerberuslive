import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { authFromContext } from "@/lib/auth";
import { isControlDeckRequest } from "@/lib/host";
import { OwnerLoginForm } from "@/components/admin/OwnerLoginForm";

export const dynamic = "force-dynamic";

export default async function ControlDeckLoginPage() {
  // The admin login exists only on the control-deck host. On the public origin it
  // does not exist at all.
  if (!(await isControlDeckRequest())) notFound();

  const session = await authFromContext().api.getSession({ headers: await headers() });
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (session && role === "admin") redirect("/admin");

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-6">
      <Link href="/admin" className="mb-8 text-center text-lg font-bold tracking-tight">
        CERBERUS <span className="text-red">CONTROL DECK</span>
      </Link>
      <OwnerLoginForm />
    </main>
  );
}
