import { NextResponse } from "next/server";
import { inquiryReference, validateInquiry } from "@/lib/inquiry";

/**
 * Lead intake. Phase 1 validates, stamps a reference and hands the lead off;
 * the persistence target (Postgres/Prisma per the brief's MVP stack) and the
 * advisor notification drop in behind this same contract.
 */
export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Malformed request." }, { status: 400 });
  }

  const result = validateInquiry(payload);
  if (!result.ok || !result.value) {
    return NextResponse.json({ errors: result.errors }, { status: 422 });
  }

  const reference = inquiryReference();
  // Phase 2: persist to TravelInquiry + notify the assigned advisor.
  console.info("[inquiry]", reference, result.value.kind, result.value.source ?? "direct");

  return NextResponse.json({
    reference,
    received: true,
    message: "An advisor will reach out within one business day.",
  });
}
