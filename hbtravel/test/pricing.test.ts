import { describe, expect, test } from "bun:test";
import { quote } from "../src/lib/pricing";
import { commission } from "../src/lib/commission";

describe("airport lanes are priced per travel party", () => {
  test("one party of 4 to OKC pays the single party fare", () => {
    const q = quote({ service: "airport", laneId: "altus-okc", parties: 1, passengers: 4 });
    expect(q.subtotal).toBe(189);
  });

  test("three unrelated parties sharing one van each pay their own fare", () => {
    const q = quote({ service: "airport", laneId: "altus-okc", parties: 3, passengers: 9 });
    expect(q.subtotal).toBe(189 * 3);
  });

  test("passenger count alone never sets the price", () => {
    const onePartyOfFive = quote({ service: "airport", laneId: "altus-dfw", parties: 1, passengers: 5 });
    const twoPartiesOfFive = quote({ service: "airport", laneId: "altus-dfw", parties: 2, passengers: 5 });
    expect(onePartyOfFive.subtotal).toBe(289);
    expect(twoPartiesOfFive.subtotal).toBe(578);
  });

  test("round trip doubles the party fare", () => {
    const q = quote({ service: "airport", laneId: "altus-dfw", parties: 1, passengers: 2, roundTrip: true });
    expect(q.subtotal).toBe(578);
  });

  test("passengers past the included count add a per-head charge", () => {
    const q = quote({ service: "airport", laneId: "altus-okc", parties: 1, passengers: 7 });
    expect(q.subtotal).toBe(189 + 2 * 45);
  });

  test("oversized groups escalate to an advisor quote", () => {
    const q = quote({ service: "airport", laneId: "altus-okc", parties: 1, passengers: 12 });
    expect(q.requiresQuote).toBe(true);
  });
});

describe("other transportation products", () => {
  test("nightlife adds $50 per passenger past five", () => {
    const q = quote({ service: "nightlife", passengers: 8 });
    expect(q.subtotal).toBe(599 + 3 * 50);
  });

  test("adventure seats are per passenger", () => {
    const q = quote({ service: "adventure", passengers: 4 });
    expect(q.subtotal).toBe(4 * 79);
  });

  test("charter is always advisor-quoted", () => {
    const q = quote({ service: "charter", passengers: 20, hours: 6 });
    expect(q.requiresQuote).toBe(true);
    expect(q.subtotal).toBe(0);
  });

  test("planning fee is an opt-in line item", () => {
    const q = quote({ service: "adventure", passengers: 1, planningFee: true });
    expect(q.subtotal).toBe(79 + 149);
  });
});

describe("host-plan commission split is configuration, not code", () => {
  test("Nexion 80 keeps 80% of gross commission", () => {
    const c = commission({ bookingValue: 10_000, category: "cruise", planId: "nexion-80" });
    expect(c.grossCommission).toBe(1600);
    expect(c.agencyShare).toBe(1280);
    expect(c.hostSplit).toBe(320);
  });

  test("moving to Nexion 90 changes only the split", () => {
    const c = commission({ bookingValue: 10_000, category: "cruise", planId: "nexion-90" });
    expect(c.grossCommission).toBe(1600);
    expect(c.agencyShare).toBe(1440);
  });

  test("a supplier contract rate overrides the category default", () => {
    const c = commission({ bookingValue: 5_000, category: "hotel", supplierCommissionRate: 0.2, planId: "nexion-80" });
    expect(c.grossCommission).toBe(1000);
    expect(c.agencyShare).toBe(800);
  });
});
