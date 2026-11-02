"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/backend/auth/session";
import { getPaymentDeps } from "@/backend/runtime";
import type { JournalResult } from "./deps";
import { approvePaper, rejectPaper, removePaper } from "./review";

const field = (formData: FormData, name: string) =>
  String(formData.get(name) ?? "");

function finish(result: JournalResult) {
  revalidatePath("/journal");
  revalidatePath("/journal/archive");
  revalidatePath("/journal/submit");
  revalidatePath("/admin", "layout");
  redirect(`/admin/journal?notice=${encodeURIComponent(result.message)}`);
}

export async function approvePaperAction(formData: FormData) {
  const { user } = await requireAdmin();
  finish(
    await approvePaper(getPaymentDeps(), field(formData, "paperId"), user.email)
  );
}

export async function rejectPaperAction(formData: FormData) {
  const { user } = await requireAdmin();
  finish(
    await rejectPaper(
      getPaymentDeps(),
      field(formData, "paperId"),
      field(formData, "reason"),
      user.email
    )
  );
}

export async function removePaperAction(formData: FormData) {
  const { user } = await requireAdmin();
  finish(
    await removePaper(getPaymentDeps(), field(formData, "paperId"), user.email)
  );
}
