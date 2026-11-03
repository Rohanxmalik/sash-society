import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { parseCsv } from "@/backend/csv";
import { nextMemberNumber } from "@/backend/db/numbers";
import { memberships, profiles, user } from "@/backend/db/schema";
import type { Db } from "@/backend/db/types";
import { safeLogValue } from "@/backend/safe-log";
import { clientConfig } from "@/shared/client-config";
import { hasRealEmail, placeholderEmail } from "@/shared/no-email";
import { DEFAULT_DESIGNATION, membershipPlans } from "@/shared/plans";
import { optionalText, requiredText } from "@/shared/validation/fields";

const COLUMNS = [
  "name",
  "email",
  "phone",
  "designation",
  "institution",
  "plan",
  "member_number",
  "joined_on",
  "expires_on",
] as const;

const FIRST_DATA_ROW = 2;

const isoDate = z.iso.date("Use the date format YYYY-MM-DD");
const blankToUndefined = (value: unknown) => (value === "" ? undefined : value);

// Old spreadsheets are messy, so only what the site cannot work without is
// required. Members can fill in the rest from their profile.
const rowSchema = z.object({
  name: requiredText("Name is required"),
  email: z.preprocess(
    blankToUndefined,
    z
      .email("Email is invalid")
      .transform((v) => v.toLowerCase())
      .optional()
  ),
  phone: z.string().trim().max(30).default(""),
  designation: optionalText(),
  institution: optionalText(),
  plan: z.string().trim().min(1, "Plan is required"),
  member_number: optionalText(),
  joined_on: isoDate,
  expires_on: z.preprocess(blankToUndefined, isoDate.optional()),
});

export type ImportResult = { created: number; problems: string[] };

const findPlanByText = (value: string) =>
  membershipPlans.find(
    (plan) =>
      plan.slug === value.toLowerCase() ||
      plan.name.toLowerCase() === value.toLowerCase()
  );

const startOfDay = (date: string) => new Date(`${date}T00:00:00Z`);
const endOfDay = (date: string) => new Date(`${date}T23:59:59+05:30`);

// With no email to match on, the name stops a second upload adding them again.
async function findDuplicate(db: Db, row: z.output<typeof rowSchema>) {
  if (row.email) {
    const [existing] = await db
      .select({ id: user.id })
      .from(user)
      .where(eq(user.email, row.email))
      .limit(1);
    return existing ? `${row.email} already has an account` : null;
  }

  const [existing] = await db
    .select({ userId: profiles.userId })
    .from(profiles)
    .where(eq(profiles.fullName, row.name))
    .limit(1);
  return existing ? `${row.name} is already on the list` : null;
}

async function importRow(db: Db, row: z.output<typeof rowSchema>) {
  const plan = findPlanByText(row.plan);
  if (!plan) return `Unknown plan "${row.plan}"`;

  const duplicate = await findDuplicate(db, row);
  if (duplicate) return duplicate;

  const email = row.email ?? placeholderEmail(randomUUID());
  const joinedOn = startOfDay(row.joined_on);
  await db.transaction(async (tx) => {
    const userId = randomUUID();
    await tx.insert(user).values({
      id: userId,
      name: row.name,
      email,
      emailVerified: hasRealEmail(email),
    });
    await tx.insert(profiles).values({
      userId,
      fullName: row.name,
      phone: row.phone,
      designation: row.designation ?? DEFAULT_DESIGNATION,
      institution: row.institution,
    });
    await tx.insert(memberships).values({
      userId,
      planSlug: plan.slug,
      status: "active",
      memberNumber:
        row.member_number ??
        (await nextMemberNumber(
          tx,
          plan.numberCode,
          joinedOn,
          clientConfig.membership.firstMemberNumber
        )),
      startsAt: joinedOn,
      expiresAt: row.expires_on ? endOfDay(row.expires_on) : null,
    });
  });
  return null;
}

// One bad row must not stop the rest of a spreadsheet.
async function tryImportRow(db: Db, row: z.output<typeof rowSchema>) {
  try {
    return await importRow(db, row);
  } catch (error) {
    console.error("Failed to import member", safeLogValue(error));
    return row.member_number
      ? `Could not be saved. Member number ${row.member_number} may already be in use`
      : "Could not be saved";
  }
}

export async function importMembers(
  db: Db,
  csvText: string
): Promise<ImportResult> {
  const [header = [], ...rows] = parseCsv(csvText);
  const columns = header.map((name) => name.trim().toLowerCase());
  const missing = COLUMNS.filter((column) => !columns.includes(column));
  if (missing.length > 0) {
    return {
      created: 0,
      problems: [`The file is missing these columns: ${missing.join(", ")}`],
    };
  }

  let created = 0;
  const problems: string[] = [];

  for (const [index, cells] of rows.entries()) {
    const rowNumber = index + FIRST_DATA_ROW;
    const raw = Object.fromEntries(
      columns.map((column, position) => [column, cells[position] ?? ""])
    );

    const parsed = rowSchema.safeParse(raw);
    const problem = parsed.success
      ? await tryImportRow(db, parsed.data)
      : parsed.error.issues[0].message;

    if (problem) problems.push(`Row ${rowNumber}: ${problem}`);
    else created += 1;
  }

  return { created, problems };
}
