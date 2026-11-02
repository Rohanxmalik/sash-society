import { requireAdmin } from "@/backend/auth/session";
import { ImportForm } from "@/frontend/components/admin/import-form";
import { membershipPlans } from "@/shared/plans";

export default async function AdminImportPage() {
  await requireAdmin();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-black text-ink font-heading">Import Members</h1>

      <div className="space-y-2 text-sm text-ink-light max-w-2xl">
        <p>
          Adds existing members from a spreadsheet saved as CSV.{" "}
          <a
            href="/member-import-template.csv"
            className="text-brand-teal hover:underline"
          >
            Download the template
          </a>
          .
        </p>
        <p>
          No emails are sent. Imported members set their password with
          &ldquo;Forgot password&rdquo; on the login page, using the same email.
        </p>
        <p>
          Plan codes:{" "}
          {membershipPlans.map(({ slug }) => slug).join(", ")}.
        </p>
      </div>

      <ImportForm />
    </div>
  );
}
