"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { getAuth } from "@/backend/auth";
import { requireSession } from "@/backend/auth/session";
import { getDb } from "@/backend/db";
import {
  createProfileIfMissing,
  savePhoto,
  saveProfile,
} from "@/backend/profiles/repository";
import { safeLogValue } from "@/backend/safe-log";
import { completeSignupSchema } from "@/shared/validation/auth";
import { photoSchema, profileSchema } from "@/shared/validation/profile";

export type ActionResult = { ok: true } | { ok: false; message: string };

const SAVE_FAILED = "We could not save your profile. Please try again.";

export async function saveProfileAction(input: unknown): Promise<ActionResult> {
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
    return { ok: false, message: SAVE_FAILED };
  }

  revalidatePath("/profile");
  return { ok: true };
}

export async function savePhotoAction(input: unknown): Promise<ActionResult> {
  const session = await requireSession();

  const parsed = photoSchema.nullable().safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0].message };
  }

  await savePhoto(getDb(), session.user.id, parsed.data);
  revalidatePath("/profile");
  return { ok: true };
}

// Runs right after the emailed code has created the account and signed them in.
export async function completeSignupAction(
  input: unknown
): Promise<ActionResult> {
  const session = await requireSession();

  const parsed = completeSignupSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: "Please check the form and try again." };
  }

  const { password, phone, designation } = parsed.data;
  await getAuth()
    .api.setPassword({
      body: { newPassword: password },
      headers: await headers(),
    })
    .catch((error) => {
      // Someone signing up again already has a password, and it must not change.
      console.info("Password not set at sign-up", safeLogValue(error));
    });

  await createProfileIfMissing(getDb(), session.user.id, {
    fullName: session.user.name,
    phone,
    designation,
  });
  return { ok: true };
}
