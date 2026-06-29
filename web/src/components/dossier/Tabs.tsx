"use client";

import { useState } from "react";

const TABS = [
  "Overview",
  "Media",
  "Live Sets",
  "Booking & Availability",
  "Press Kit",
  "Reviews",
] as const;

type Tab = (typeof TABS)[number];

function ComingSoon({ label }: { label: string }) {
  return (
    <div className="rounded-xl border border-border bg-panel p-10 text-center">
      <p className="text-sm text-muted">{label} is coming in a later phase.</p>
    </div>
  );
}

/**
 * Tab bar for the dossier. v1 wires Overview to real content (passed in from the
 * server component, preserving SSR); the rest are UI-only placeholders. Booking
 * lives in its own always-visible section below the tabs.
 */
export function ProfileTabs({
  overview,
  media,
  reviews,
}: {
  overview: React.ReactNode;
  media?: React.ReactNode;
  reviews?: React.ReactNode;
}) {
  const [active, setActive] = useState<Tab>("Overview");

  return (
    <div>
      <div className="-mx-1 flex gap-1 overflow-x-auto border-b border-border pb-px">
        {TABS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setActive(t)}
            className={`whitespace-nowrap border-b-2 px-3 py-2.5 text-sm transition ${
              active === t
                ? "border-red text-foreground"
                : "border-transparent text-muted hover:text-foreground"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="mt-5">
        {active === "Overview"
          ? overview
          : active === "Media" && media
            ? media
            : active === "Reviews" && reviews
              ? reviews
              : <ComingSoon label={active} />}
      </div>
    </div>
  );
}
