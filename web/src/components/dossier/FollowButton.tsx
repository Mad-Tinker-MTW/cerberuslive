"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function FollowButton({
  slug,
  initialFollowing,
  initialCount,
  signedIn,
}: {
  slug: string;
  initialFollowing: boolean;
  initialCount: number;
  signedIn: boolean;
}) {
  const router = useRouter();
  const [following, setFollowing] = useState(initialFollowing);
  const [count, setCount] = useState(initialCount);
  const [busy, setBusy] = useState(false);

  async function toggle() {
    if (!signedIn) {
      router.push("/login");
      return;
    }
    setBusy(true);
    const res = await fetch("/api/follow", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug }),
    });
    if (res.ok) {
      const d = (await res.json()) as { following: boolean; count: number };
      setFollowing(d.following);
      setCount(d.count);
    }
    setBusy(false);
  }

  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={toggle}
        disabled={busy}
        className={`rounded-md px-4 py-2 text-sm font-semibold transition disabled:opacity-50 ${
          following
            ? "border border-border bg-panel text-foreground hover:border-red"
            : "bg-red text-white hover:bg-red-dark"
        }`}
      >
        {following ? "Following" : "Follow"}
      </button>
      <span className="text-sm text-muted">
        {count} {count === 1 ? "follower" : "followers"}
      </span>
    </div>
  );
}
