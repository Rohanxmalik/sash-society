"use server";

import { revalidatePath } from "next/cache";
import { getDb } from "@/db";
import { saveProfile } from "@/lib/profiles/repository";
import { profileSchema } from "@/lib/profiles/schema";
import { safeLogValue } from "@/lib/safe-log";
import { requireSession } from "@/lib/session";

export type SaveProfileResult = { ok: true } | { ok: false; message: string };

export async function saveProfileAction(
  input: unknown
): Promise<SaveProfileResult> {
  const session = await requireSession();

  const parsed = profileSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: "Please check the form and try again." };
  }

  try {
    await saveProfile(getDb(), session.user.id, parsed.data);
  } catch (error) {
    console.error("Failed to save profile", {
      userId: session.user.id,
      error: safeLogValue(error),
    });
    return {
      ok: false,
      message: "We could not save your profile. Please try again.",
    };
  }

  revalidatePath("/account");
  return { ok: true };
}
