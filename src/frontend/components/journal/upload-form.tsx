"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/frontend/components/ui/button";
import { FormAlert } from "@/frontend/components/ui/form-alert";
import {
  FormField,
  SelectField,
  TextAreaField,
} from "@/frontend/components/ui/form-field";
import {
  JOURNAL_ARTICLE_TYPES,
  JOURNAL_FILE_ACCEPT,
  MAX_JOURNAL_FILE_BYTES,
  MAX_JOURNAL_FILE_MB,
} from "@/shared/validation/journal";

type UploadResult = { ok: boolean; message: string };

const UPLOAD_FAILED = "We could not upload your file. Please try again.";
const TOO_LARGE = `This file is larger than ${MAX_JOURNAL_FILE_MB} MB.`;

const isTooLarge = (file: FormDataEntryValue | null) =>
  file instanceof File && file.size > MAX_JOURNAL_FILE_BYTES;

// Posts to a route handler because a server action would have to accept large
// bodies from anyone. Typed text stays in the form if an upload is refused.
export function UploadForm({
  url,
  submitLabel,
  abstractRequired,
  defaultAuthors,
  children,
}: {
  url: string;
  submitLabel: string;
  abstractRequired: boolean;
  defaultAuthors?: string;
  children?: React.ReactNode;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [outcome, setOutcome] = useState<UploadResult | null>(null);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);

    if (isTooLarge(formData.get("file"))) {
      setOutcome({ ok: false, message: TOO_LARGE });
      return;
    }

    setBusy(true);
    setOutcome(null);
    try {
      const response = await fetch(url, { method: "POST", body: formData });
      const result: UploadResult = await response.json();
      setOutcome(result);
      if (result.ok) {
        form.reset();
        router.refresh();
      }
    } catch {
      setOutcome({ ok: false, message: UPLOAD_FAILED });
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      {outcome && (
        <FormAlert tone={outcome.ok ? "success" : "error"}>
          {outcome.message}
        </FormAlert>
      )}

      <FormField label="Title *" name="title" required maxLength={300} />
      <FormField
        label="Authors *"
        name="authors"
        required
        maxLength={300}
        defaultValue={defaultAuthors}
      />
      <TextAreaField
        label={abstractRequired ? "Abstract *" : "Abstract"}
        name="abstract"
        required={abstractRequired}
        maxLength={4000}
      />
      <SelectField label="Type of Work *" name="articleType" required>
        {JOURNAL_ARTICLE_TYPES.map((type) => (
          <option key={type} value={type}>
            {type}
          </option>
        ))}
      </SelectField>

      {children}

      <FormField
        label={`Your File * (PDF or Word .docx, up to ${MAX_JOURNAL_FILE_MB} MB)`}
        name="file"
        type="file"
        accept={JOURNAL_FILE_ACCEPT}
        required
      />

      <Button type="submit" disabled={busy}>
        {busy ? "Uploading..." : submitLabel}
      </Button>
    </form>
  );
}
