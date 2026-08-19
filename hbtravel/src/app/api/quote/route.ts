import { NextResponse } from "next/server";
import { quote, type QuoteRequest, type ServiceId } from "@/lib/pricing";

const SERVICES: ServiceId[] = ["airport", "nightlife", "adventure", "charter"];

/** Server-side pricing so published fares are never set by the browser. */
export async function POST(request: Request) {
  let body: Partial<QuoteRequest>;
  try {
    body = (await request.json()) as Partial<QuoteRequest>;
  } catch {
    return NextResponse.json({ error: "Malformed request." }, { status: 400 });
  }

  if (!body.service || !SERVICES.includes(body.service)) {
    return NextResponse.json({ error: "Unknown service." }, { status: 400 });
  }

  const clamp = (n: unknown, max: number) =>
    Math.min(max, Math.max(1, Math.floor(Number(n) || 1)));

  const result = quote({
    service: body.service,
    laneId: typeof body.laneId === "string" ? body.laneId : undefined,
    parties: clamp(body.parties, 20),
    passengers: clamp(body.passengers, 60),
    roundTrip: Boolean(body.roundTrip),
    hours: body.hours ? clamp(body.hours, 24) : undefined,
    planningFee: Boolean(body.planningFee),
  });

  return NextResponse.json(result);
}
