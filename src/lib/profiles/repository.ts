import { eq } from "drizzle-orm";
import { profiles } from "@/db/schema";
import type { Db } from "@/db/types";
import type { ProfileInput } from "./schema";

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
    qualification: input.qualification ?? null,
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
