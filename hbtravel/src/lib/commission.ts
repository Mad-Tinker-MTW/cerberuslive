/**
 * Hosted-booking commission math (brief §9).
 *
 * Every hosted travel booking stores: booking value, supplier, category, host
 * agency, host plan, supplier commission rate, gross commission, host split,
 * Highways & Byways share, expected/actual payment dates and status. The split
 * comes from the ACTIVE host plan, so Nexion 80 -> 90 is an admin change.
 */
import {
  ACTIVE_HOST_PLAN,
  hostPlan,
  supplierCommissionRates,
  type HostPlanId,
} from "@/config/business";

export type CommissionStatus = "expected" | "invoiced" | "received" | "written-off";

export interface CommissionInput {
  bookingValue: number;
  category: keyof typeof supplierCommissionRates | string;
  /** Overrides the category default when a supplier contract differs. */
  supplierCommissionRate?: number;
  planId?: HostPlanId;
}

export interface CommissionResult {
  hostAgency: string;
  hostPlan: string;
  supplierCommissionRate: number;
  grossCommission: number;
  hostSplit: number;
  agencyShare: number;
}

const round = (n: number) => Math.round(n * 100) / 100;

export function commission(input: CommissionInput): CommissionResult {
  const plan = hostPlan(input.planId ?? ACTIVE_HOST_PLAN);
  const rate = input.supplierCommissionRate ?? supplierCommissionRates[input.category] ?? 0;
  const share = input.category === "air" ? plan.airCommissionShare : plan.nonAirCommissionShare;

  const gross = round(input.bookingValue * rate);
  const agencyShare = round(gross * share);

  return {
    hostAgency: plan.hostAgency,
    hostPlan: plan.label,
    supplierCommissionRate: rate,
    grossCommission: gross,
    hostSplit: round(gross - agencyShare),
    agencyShare,
  };
}
