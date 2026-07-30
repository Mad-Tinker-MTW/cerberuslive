import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Privacy Policy for Cerberus Live Studio: what we collect, how we use it, and the choices you have.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-16">
      <a
        href="/"
        className="text-xs uppercase tracking-[0.2em] text-muted transition hover:text-foreground"
      >
        &larr; Cerberus Live Studio
      </a>
      <h1 className="mt-8 text-4xl font-bold tracking-tight">Privacy Policy</h1>
      <p className="mt-2 text-xs uppercase tracking-[0.2em] text-muted">
        Effective July 30, 2026
      </p>

      <div className="mt-10 space-y-8 text-sm leading-relaxed text-foreground/80">
        <p>
          Cerberus Live Studio, a division of Atlantis Prime Holdings LLC (&quot;we,&quot;
          &quot;us&quot;), operates the creator platform at cerberuslive.studio. This policy explains
          what information we collect, how we use it, and the choices you have.
        </p>

        <section>
          <h2 className="mb-2 text-lg font-semibold text-foreground">Information We Collect</h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              <strong>Account information</strong> you provide when you sign up or build a profile:
              email, username, display name, and dossier content such as bio, genre, links, photos,
              and media you upload.
            </li>
            <li>
              <strong>Activity on the platform</strong>: bookings, reviews, follows, posts, and
              live-session participation.
            </li>
            <li>
              <strong>Payment information</strong>: if you subscribe, payments are processed by
              Stripe. We do not store your card details; we receive only your subscription status.
            </li>
            <li>
              <strong>Technical and analytics data</strong>: IP address, device, and browser
              information used to operate and secure the service, plus privacy-first, cookieless
              Cloudflare Web Analytics.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold text-foreground">Cookies</h2>
          <p>
            We use only <strong>essential cookies</strong> required to keep you signed in and secure
            your session. These are strictly necessary for the service to work and are exempt from
            consent requirements. We do <strong>not</strong> use advertising or cross-site tracking
            cookies, and our analytics is cookieless.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold text-foreground">How We Use Information</h2>
          <p>
            To provide and secure the platform, authenticate you, deliver media and bookings,
            process subscriptions, respond to inquiries, and understand and improve how the service
            is used. We do not sell your personal information or build advertising profiles.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold text-foreground">How Information Is Shared</h2>
          <p>
            We share data only with service providers who process it on our behalf:{" "}
            <a
              href="https://stripe.com/privacy"
              rel="noopener"
              target="_blank"
              className="underline transition hover:text-red-bright"
            >
              Stripe
            </a>{" "}
            (payments),{" "}
            <a
              href="https://resend.com/legal/privacy-policy"
              rel="noopener"
              target="_blank"
              className="underline transition hover:text-red-bright"
            >
              Resend
            </a>{" "}
            (transactional email), and{" "}
            <a
              href="https://www.cloudflare.com/privacypolicy/"
              rel="noopener"
              target="_blank"
              className="underline transition hover:text-red-bright"
            >
              Cloudflare
            </a>{" "}
            (hosting, media delivery, analytics). Content you choose to make public on your profile
            is visible to others. We may disclose information if required by law.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold text-foreground">Data Retention</h2>
          <p>
            We keep your account information for as long as your account is active. You can delete
            your account, after which we remove or anonymize your personal data except where we must
            retain it for legal or security reasons.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold text-foreground">Your Choices and Rights</h2>
          <p>
            You can review and edit your profile in your account, manage your subscription through
            the Stripe billing portal, and request access to or deletion of your personal data.
            Depending on where you live, you may have additional rights. Contact us using the
            details below.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold text-foreground">Children&apos;s Privacy</h2>
          <p>
            The platform is not directed to children under 13, and we do not knowingly collect their
            personal information.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold text-foreground">Changes to This Policy</h2>
          <p>
            We may update this policy from time to time. When we do, we will revise the effective
            date above.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold text-foreground">Contact</h2>
          <p>
            Cerberus Live Studio, a division of Atlantis Prime Holdings LLC
            <br />
            <a
              href="mailto:hello@cerberuslive.studio"
              className="underline transition hover:text-red-bright"
            >
              hello@cerberuslive.studio
            </a>
          </p>
        </section>
      </div>
    </main>
  );
}
