"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/backend/auth/session";
import { getDb } from "@/backend/db";
import { sendPaymentEmail } from "@/backend/payments/notify";
import { getPaymentDeps } from "@/backend/runtime";
import { safeLogValue } from "@/backend/safe-log";
import { safeRedirectPath } from "@/shared/safe-redirect";
import { importMembers, type ImportResult } from "./import-members";
import {
  approveMembership,
  reinstateMember,
  rejectMembership,
  removeMember,
  resendWelcomeEmail,
  updateMemberEmail,
  type AdminResult,
} from "./members";

const MAX_IMPORT_BYTES = 5 * 1024 * 1024;

const field = (formData: FormData, name: string) =>
  String(formData.get(name) ?? "");

function finish(path: string, result: AdminResult) {
  revalidatePath("/admin", "layout");
  const notice = result.message ?? "Done.";
  redirect(`${path}?notice=${encodeURIComponent(notice)}`);
}

const memberPath = (formData: FormData) =>
  `/admin/members/${encodeURIComponent(field(formData, "userId"))}`;

export async function approveAction(formData: FormData) {
  const { user } = await requireAdmin();
  const result = await approveMembership(
    getPaymentDeps(),
    field(formData, "membershipId"),
    user.email
  );
  finish(memberPath(formData), result);
}

export async function rejectAction(formData: FormData) {
  const { user } = await requireAdmin();
  const result = await rejectMembership(
    getPaymentDeps(),
    field(formData, "membershipId"),
    user.email
  );
  finish(memberPath(formData), result);
}

export async function removeAction(formData: FormData) {
  const { user } = await requireAdmin();
  const userId = field(formData, "userId");
  const result =
    userId === user.id
      ? { ok: false as const, message: "You cannot remove your own account." }
      : await removeMember(
          getPaymentDeps(),
          userId,
          field(formData, "reason"),
          user.email
        );
  finish(memberPath(formData), result);
}

export async function reinstateAction(formData: FormData) {
  await requireAdmin();
  const result = await reinstateMember(
    getPaymentDeps(),
    field(formData, "userId")
  );
  finish(memberPath(formData), result);
}

export async function updateMemberEmailAction(formData: FormData) {
  await requireAdmin();
  const result = await updateMemberEmail(
    getDb(),
    field(formData, "userId"),
    field(formData, "email")
  );
  finish(memberPath(formData), result);
}

export async function resendWelcomeAction(formData: FormData) {
  await requireAdmin();
  const result = await resendWelcomeEmail(
    getPaymentDeps(),
    field(formData, "membershipId")
  );
  finish(memberPath(formData), result);
}

export async function resendPaymentEmailAction(formData: FormData) {
  await requireAdmin();
  let result: AdminResult = { ok: true, message: "Email sent." };
  try {
    await sendPaymentEmail(getPaymentDeps(), field(formData, "paymentId"));
  } catch (error) {
    console.error("Failed to resend payment email", safeLogValue(error));
    result = { ok: false, message: "The email could not be sent." };
  }
  finish(safeRedirectPath(field(formData, "returnTo"), "/admin/payments"), result);
}

export async function importMembersAction(
  _previous: ImportResult | null,
  formData: FormData
): Promise<ImportResult> {
  await requireAdmin();

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { created: 0, problems: ["Please choose a CSV file."] };
  }
  if (file.size > MAX_IMPORT_BYTES) {
    return { created: 0, problems: ["This file is too large."] };
  }

  const result = await importMembers(getDb(), await file.text());
  revalidatePath("/admin", "layout");
  return result;
}
