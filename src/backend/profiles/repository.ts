import { and, desc, eq, inArray, isNull, or, gt } from "drizzle-orm";
import { memberships, profiles } from "@/backend/db/schema";
import type { Db } from "@/backend/db/types";
import type { ProfileInput } from "@/shared/validation/profile";

export type Profile = typeof profiles.$inferSelect;

export async function findProfile(
  db: Db,
  userId: string
): Promise<Profile | null> {
  const [profile] = await db
    .select()
    .from(profiles)
    .where(eq(profiles.userId, userId))
    .limit(1);
  return profile ?? null;
}

export async function saveProfile(
  db: Db,
  userId: string,
  input: ProfileInput
): Promise<Profile> {
  const values = {
    ...input,
    institution: input.institution ?? null,
    country: input.country ?? null,
    education: input.education ?? null,
    experience: input.experience ?? null,
    publications: input.publications ?? null,
    website: input.website ?? null,
  };

  const [profile] = await db
    .insert(profiles)
    .values({ ...values, userId })
    .onConflictDoUpdate({
      target: profiles.userId,
      set: { ...values, updatedAt: new Date() },
    })
    .returning();
  return profile;
}

// Signing up again with a verified email must not overwrite an existing profile.
export async function createProfileIfMissing(
  db: Db,
  userId: string,
  input: Pick<Profile, "fullName" | "phone" | "designation">
) {
  await db
    .insert(profiles)
    .values({ ...input, userId })
    .onConflictDoNothing({ target: profiles.userId });
}

export async function savePhoto(db: Db, userId: string, photo: string | null) {
  await db
    .update(profiles)
    .set({ photo, updatedAt: new Date() })
    .where(eq(profiles.userId, userId));
}

export async function listDirectory(db: Db, now: Date) {
  return db
    .select({
      fullName: profiles.fullName,
      designation: profiles.designation,
      institution: profiles.institution,
      planSlug: memberships.planSlug,
    })
    .from(memberships)
    .innerJoin(profiles, eq(profiles.userId, memberships.userId))
    .where(
      and(
        inArray(memberships.status, ["active"]),
        or(isNull(memberships.expiresAt), gt(memberships.expiresAt, now)),
        eq(profiles.showInDirectory, true)
      )
    )
    .orderBy(profiles.fullName, desc(memberships.createdAt));
}
