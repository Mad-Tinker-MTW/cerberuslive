"use client";

import { useState } from "react";

const TABS = [
  "Overview",
  "Feed",
  "Discography",
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
 * Tab bar for the dossier. v1 wires Overview + Discography to real content (passed in
 * from the server component, preserving SSR); the rest are UI-only placeholders. The
 * Discography tab only appears when the artist has a catalog. Booking lives in its own
 * always-visible section below the tabs.
 */
export function ProfileTabs({
  overview,
  feed,
  discography,
  media,
  liveSets,
  reviews,
}: {
  overview: React.ReactNode;
  feed?: React.ReactNode;
  discography?: React.ReactNode;
  media?: React.ReactNode;
  liveSets?: React.ReactNode;
  reviews?: React.ReactNode;
}) {
  const [active, setActive] = useState<Tab>("Overview");
  // Hide the Feed / Discography / Live Sets tabs entirely when there is no content for them.
  const visibleTabs = TABS.filter(
    (t) =>
      (t !== "Feed" || Boolean(feed)) &&
      (t !== "Discography" || Boolean(discography)) &&
      (t !== "Live Sets" || Boolean(liveSets))
  );

  return (
    <div>
      <div className="-mx-1 flex gap-1 overflow-x-auto border-b border-border pb-px">
        {visibleTabs.map((t) => (
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
          : active === "Feed" && feed
            ? feed
            : active === "Discography" && discography
            ? discography
            : active === "Media" && media
              ? media
              : active === "Live Sets" && liveSets
                ? liveSets
                : active === "Reviews" && reviews
                  ? reviews
                  : <ComingSoon label={active} />}
      </div>
    </div>
  );
}
