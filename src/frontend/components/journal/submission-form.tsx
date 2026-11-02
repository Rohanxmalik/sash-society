import { UploadForm } from "./upload-form";

export function SubmissionForm({ defaultAuthors }: { defaultAuthors: string }) {
  return (
    <UploadForm
      url="/api/uploads/journal"
      submitLabel="Submit Work"
      abstractRequired
      defaultAuthors={defaultAuthors}
    >
      <label className="flex gap-3 text-sm text-ink-light cursor-pointer">
        <input
          type="checkbox"
          name="declarationAccepted"
          required
          className="mt-0.5 accent-brand-dark-teal"
        />
        <span>
          I confirm that this is my own original work and has not been published
          elsewhere.
        </span>
      </label>
    </UploadForm>
  );
}
