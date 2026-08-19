/** Shape + validation for every lead the site captures (travel or transportation). */
export type InquiryKind = "cruise" | "vacation" | "flight-hotel" | "resort" | "experience" | "transportation" | "military" | "general";

export interface Inquiry {
  kind: InquiryKind;
  name: string;
  email: string;
  phone?: string;
  partySize?: number;
  travelWindow?: string;
  destination?: string;
  budget?: string;
  message?: string;
  /** Which page the lead came from — booking-source tracking (brief §10). */
  source?: string;
}

export interface ValidationResult {
  ok: boolean;
  errors: Record<string, string>;
  value?: Inquiry;
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const trim = (v: unknown, max = 2000) => (typeof v === "string" ? v.trim().slice(0, max) : "");

export function validateInquiry(input: unknown): ValidationResult {
  const raw = (input ?? {}) as Record<string, unknown>;
  const errors: Record<string, string> = {};

  const name = trim(raw.name, 120);
  const email = trim(raw.email, 160).toLowerCase();
  const phone = trim(raw.phone, 40);

  if (name.length < 2) errors.name = "Tell us who to address the itinerary to.";
  if (!EMAIL.test(email)) errors.email = "A working email address is required.";
  if (phone && phone.replace(/\D/g, "").length < 10) errors.phone = "Phone numbers need 10 digits.";

  const partySize = Number(raw.partySize);
  if (raw.partySize !== undefined && raw.partySize !== "" && (!Number.isFinite(partySize) || partySize < 1 || partySize > 200)) {
    errors.partySize = "Party size must be between 1 and 200.";
  }

  if (Object.keys(errors).length > 0) return { ok: false, errors };

  return {
    ok: true,
    errors: {},
    value: {
      kind: (trim(raw.kind, 30) || "general") as InquiryKind,
      name,
      email,
      phone: phone || undefined,
      partySize: Number.isFinite(partySize) && partySize > 0 ? Math.floor(partySize) : undefined,
      travelWindow: trim(raw.travelWindow, 120) || undefined,
      destination: trim(raw.destination, 160) || undefined,
      budget: trim(raw.budget, 60) || undefined,
      message: trim(raw.message, 4000) || undefined,
      source: trim(raw.source, 120) || undefined,
    },
  };
}

/** Human-readable reference an advisor can quote back on the phone. */
export function inquiryReference(seed: number = Date.now()): string {
  const base = seed.toString(36).toUpperCase().slice(-6);
  return `HB-${base}`;
}
