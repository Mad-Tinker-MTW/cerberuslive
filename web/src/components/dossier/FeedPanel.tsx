import type { Post } from "@/lib/db";

function fmt(iso: string): string {
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? ""
    : d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

/**
 * Read-only profile feed on the dossier. Public posts show to everyone; followers-only posts are
 * passed in only when the viewer is a follower or the artist (the page decides). Artists create and
 * manage their posts from /account.
 */
export function FeedPanel({ posts }: { posts: Post[] }) {
  if (posts.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-panel p-10 text-center">
        <p className="text-sm text-muted">No posts yet.</p>
      </div>
    );
  }
  return (
    <ul className="flex flex-col gap-3">
      {posts.map((p) => (
        <li key={p.id} className="rounded-xl border border-border bg-panel p-4">
          <div className="mb-1.5 flex items-center gap-2 text-xs text-muted">
            <span>{fmt(p.created_at)}</span>
            {p.visibility === "followers" && (
              <span className="rounded-full border border-border px-1.5 py-0.5 text-[10px] uppercase tracking-widest">
                Followers
              </span>
            )}
          </div>
          <p className="whitespace-pre-wrap text-sm text-foreground/90">{p.body}</p>
        </li>
      ))}
    </ul>
  );
}
