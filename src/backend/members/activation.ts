import { nextMemberNumber } from "@/backend/db/numbers";
import type { Db } from "@/backend/db/types";
import { clientConfig } from "@/shared/client-config";
import type { MembershipPlan } from "@/shared/plans";
import { computeExpiry } from "./rules";

export async function activationFields(
  db: Db,
  plan: MembershipPlan,
  now: Date
) {
  const { term, firstMemberNumber } = clientConfig.membership;
  return {
    status: "active" as const,
    memberNumber: await nextMemberNumber(
      db,
      plan.numberCode,
      now,
      firstMemberNumber
    ),
    startsAt: now,
    expiresAt: computeExpiry(plan, now, term),
  };
}
