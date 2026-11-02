"use client";

import { useActionState } from "react";
import { importMembersAction } from "@/backend/admin/actions";
import { Button } from "@/frontend/components/ui/button";
import { FormAlert } from "@/frontend/components/ui/form-alert";
import { FormField } from "@/frontend/components/ui/form-field";

export function ImportForm() {
  const [result, formAction, pending] = useActionState(importMembersAction, null);

  return (
    <form action={formAction} className="space-y-5 max-w-xl">
      {result && result.created > 0 && (
        <FormAlert tone="success">
          {result.created} {result.created === 1 ? "member" : "members"} imported.
        </FormAlert>
      )}
      {result && result.problems.length > 0 && (
        <div role="alert" className="border rounded-sm px-4 py-3 text-sm bg-red-50 border-red-200 text-red-800">
          <p className="font-semibold">These rows were not imported:</p>
          <ul className="mt-2 list-disc pl-5 space-y-1">
            {result.problems.map((problem) => (
              <li key={problem}>{problem}</li>
            ))}
          </ul>
        </div>
      )}

      <FormField label="CSV File" name="file" type="file" accept=".csv,text/csv" required />

      <Button type="submit" disabled={pending}>
        {pending ? "Importing..." : "Import Members"}
      </Button>
    </form>
  );
}
