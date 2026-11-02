import { and, desc, eq, inArray } from "drizzle-orm";
import { eventRegistrations, memberships, payments } from "@/backend/db/schema";
import type { Db } from "@/backend/db/types";
import { displayStatus } from "./rules";

export type Membership = typeof memberships.$inferSelect;

export async function findLiveMembership(
  db: Db,
  userId: string
): Promise<Membership | null> {
  const [membership] = await db
    .select()
    .from(memberships)
    .where(
      and(
        eq(memberships.userId, userId),
        inArray(memberships.status, ["pending_approval", "active"])
      )
    )
    .limit(1);
  return membership ?? null;
}

export async function hasActiveMembership(
  db: Db,
  userId: string,
  now: Date
): Promise<boolean> {
  const live = await findLiveMembership(db, userId);
  return live !== null && displayStatus(live, now) === "active";
}

export async function findMembership(
  db: Db,
  membershipId: string
): Promise<Membership | null> {
  const [membership] = await db
    .select()
    .from(memberships)
    .where(eq(memberships.id, membershipId))
    .limit(1);
  return membership ?? null;
}

export async function findLatestMembership(
  db: Db,
  userId: string
): Promise<Membership | null> {
  const [membership] = await db
    .select()
    .from(memberships)
    .where(eq(memberships.userId, userId))
    .orderBy(desc(memberships.createdAt))
    .limit(1);
  return membership ?? null;
}

export async function findPaymentForMembership(db: Db, membershipId: string) {
  const [payment] = await db
    .select()
    .from(payments)
    .where(eq(payments.membershipId, membershipId))
    .limit(1);
  return payment ?? null;
}

export async function listMemberRegistrations(db: Db, userId: string) {
  return db
    .select({
      id: eventRegistrations.id,
      eventId: eventRegistrations.eventId,
      optionId: eventRegistrations.optionId,
      registrationNumber: eventRegistrations.registrationNumber,
      paymentId: payments.id,
    })
    .from(eventRegistrations)
    .innerJoin(payments, eq(payments.eventRegistrationId, eventRegistrations.id))
    .where(
      and(
        eq(eventRegistrations.userId, userId),
        eq(eventRegistrations.status, "confirmed"),
        eq(payments.status, "paid")
      )
    )
    .orderBy(desc(eventRegistrations.confirmedAt));
}
