import type { D1Database } from "@cloudflare/workers-types";

// Dossier IDs: CLS-<TIER><digit><letter>-<NNN>, a letters-forward per-tier sequence.
//   tier code: FR (free), PL (plus), MG (managed; usually admin-customized)
//   the counter rolls suffix (001-999) -> letter (A-Z) -> digit (0-9), so the first minted id is
//   CLS-FR0A-001 and the 4th char is always a letter (never all-zeros, reads clean).
// Capacity: 10 x 26 x 999 = 259,740 per tier before a char would need adding.

const TIER_CODE: Record<string, string> = { free: "FR", plus: "PL", managed: "MG" };

/** Two-letter tier code for a dossier ID; unknown tiers fall back to MG (admin-customized). */
export function dossierTierCode(tier: string): string {
  return TIER_CODE[tier] ?? "MG";
}

/** Encode a 1-based per-tier sequence number into its dossier ID (pure; the odometer). */
export function encodeDossierId(tier: string, n: number): string {
  const i = Math.max(1, Math.trunc(n)) - 1; // 0-based
  const suffix = (i % 999) + 1; // 001..999
  const block = Math.floor(i / 999);
  const letter = String.fromCharCode(65 + (block % 26)); // A..Z
  const digit = Math.floor(block / 26) % 10; // 0..9 (wraps at 9Z-999; 259,740 ids/tier)
  return `CLS-${dossierTierCode(tier)}${digit}${letter}-${String(suffix).padStart(3, "0")}`;
}

/** Mint the next dossier ID for a tier, advancing the per-tier counter atomically (RETURNING). */
export async function nextDossierId(db: D1Database, tier: string): Promise<string> {
  const row = await db
    .prepare(
      "INSERT INTO dossier_seq (tier, n) VALUES (?, 1) ON CONFLICT(tier) DO UPDATE SET n = n + 1 RETURNING n"
    )
    .bind(tier)
    .first<{ n: number }>();
  return encodeDossierId(tier, row?.n ?? 1);
}
