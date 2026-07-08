import type { D1Database } from "@cloudflare/workers-types";

// One unique handle per user, stored on the Better Auth user as `username` (lowercased key, unique)
// + `displayUsername` (as typed). Human names only: we never auto-append numbers — a taken handle
// asks the user to pick another, with tasteful non-numbered suggestions.

const RESERVED = new Set([
  "admin", "administrator", "cerberus", "cerberuslive", "official", "support", "staff", "help",
  "account", "login", "signup", "api", "www", "device", "controldeck", "moderator", "mod",
]);

/** The unique key for a handle: trimmed + lowercased. */
export function normalizeHandle(raw: string): string {
  return raw.trim().toLowerCase();
}

/** Validate a handle. Returns a human error, or null when it's a valid shape. */
export function validateHandle(raw: string): string | null {
  const h = raw.trim();
  if (h.length < 3) return "Handle must be at least 3 characters.";
  if (h.length > 30) return "Handle must be 30 characters or fewer.";
  if (!/^[a-zA-Z][a-zA-Z0-9._]*$/.test(h)) return "Use letters, numbers, . or _ — starting with a letter.";
  if (/[._]{2,}/.test(h)) return "No two . or _ in a row.";
  if (h.endsWith(".") || h.endsWith("_")) return "Can't end with . or _.";
  if (RESERVED.has(h.toLowerCase())) return "That handle is reserved.";
  return null;
}

/** Whether a handle is free (case-insensitive), ignoring the user's own current handle. */
export async function isHandleFree(db: D1Database, raw: string, exceptUserId?: string): Promise<boolean> {
  const row = await db
    .prepare("SELECT id FROM user WHERE username = ? LIMIT 1")
    .bind(normalizeHandle(raw))
    .first<{ id: string }>();
  return !row || row.id === exceptUserId;
}

/** Tasteful, non-numbered alternatives for a taken handle, filtered to available + valid ones. */
export async function handleSuggestions(db: D1Database, base: string): Promise<string[]> {
  const clean = normalizeHandle(base).replace(/[^a-z0-9]/g, "");
  if (!clean) return [];
  const candidates = [`the${clean}`, `${clean}music`, `${clean}live`, `${clean}sound`, `real${clean}`, `${clean}official`];
  const out: string[] = [];
  for (const c of candidates) {
    if (validateHandle(c) !== null) continue; // skip invalid (e.g. too long)
    if (await isHandleFree(db, c)) out.push(c);
    if (out.length >= 3) break;
  }
  return out;
}
