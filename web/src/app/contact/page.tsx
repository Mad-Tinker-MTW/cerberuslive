import { headers } from "next/headers";
import type { Metadata } from "next";
import { authFromContext } from "@/lib/auth";
import { SiteHeader } from "@/components/dossier/SiteHeader";
import { ContactForm } from "@/components/ContactForm";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Contact — Cerberus Live Studio",
  description: "Get in touch with Cerberus Live Studio.",
};

export default async function ContactPage() {
  // Prefill from the session when signed in, but the form is open to anyone.
  const session = await authFromContext().api.getSession({ headers: await headers() });

  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-xl px-6 py-12">
        <h1 className="mb-2 text-2xl font-bold tracking-tight">Contact</h1>
        <p className="mb-6 text-sm text-muted">
          Questions, a problem with your account, or a booking issue? Send us a message.
        </p>
        <ContactForm
          defaultName={session?.user.name ?? ""}
          defaultEmail={session?.user.email ?? ""}
        />
      </main>
    </>
  );
}
