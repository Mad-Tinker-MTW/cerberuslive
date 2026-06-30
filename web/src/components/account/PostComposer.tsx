"use client";

import { useState } from "react";
import type { Post } from "@/lib/db";

function fmt(iso: string): string {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "" : d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

// Artist-only feed manager in /account (L-048 Phase B): write a post (public or followers-only)
// and delete existing ones. The dossier renders these read-only via FeedPanel.
export function PostComposer({ initialPosts }: { initialPosts: Post[] }) {
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [body, setBody] = useState("");
  const [visibility, setVisibility] = useState<"public" | "followers">("public");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit() {
    const text = body.trim();
    if (!text) return;
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: text, visibility }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string; post?: Post };
      if (!res.ok || !data.ok || !data.post) {
        setError(data.error || "Could not post.");
        return;
      }
      setPosts((p) => [data.post as Post, ...p]);
      setBody("");
    } catch {
      setError("Network error.");
    } finally {
      setBusy(false);
    }
  }

  async function remove(id: number) {
    setPosts((p) => p.filter((x) => x.id !== id)); // optimistic
    try {
      await fetch("/api/posts", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
    } catch {
      /* best-effort; a reload would resync */
    }
  }

  return (
    <div className="rounded-xl border border-border bg-panel p-5">
      <h2 className="mb-3 text-xs uppercase tracking-widest text-muted">Feed</h2>
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        rows={3}
        maxLength={2000}
        placeholder="Share an update with your followers..."
        className="w-full resize-y rounded-md border border-border bg-panel-soft px-3 py-2 text-sm outline-none focus:border-red"
      />
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <select
          value={visibility}
          onChange={(e) => setVisibility(e.target.value as "public" | "followers")}
          className="h-9 rounded-md border border-border bg-panel-soft px-2 text-sm outline-none focus:border-red"
        >
          <option value="public">Public</option>
          <option value="followers">Followers only</option>
        </select>
        <button
          type="button"
          onClick={submit}
          disabled={busy || !body.trim()}
          className="h-9 rounded-md bg-red px-4 text-sm font-semibold text-white transition hover:bg-red-dark disabled:opacity-50"
        >
          {busy ? "Posting..." : "Post"}
        </button>
        {error && <span className="text-xs text-red">{error}</span>}
      </div>

      {posts.length > 0 && (
        <ul className="mt-4 flex flex-col gap-2">
          {posts.map((p) => (
            <li key={p.id} className="rounded-lg border border-border bg-panel-soft p-3">
              <div className="mb-1 flex items-center gap-2 text-xs text-muted">
                <span>{fmt(p.created_at)}</span>
                {p.visibility === "followers" && (
                  <span className="rounded-full border border-border px-1.5 py-0.5 text-[10px] uppercase tracking-widest">
                    Followers
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => remove(p.id)}
                  className="ml-auto text-xs text-muted transition hover:text-red"
                >
                  Delete
                </button>
              </div>
              <p className="whitespace-pre-wrap text-sm text-foreground/90">{p.body}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
