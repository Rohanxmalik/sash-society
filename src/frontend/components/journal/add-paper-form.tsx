import { FormField } from "@/frontend/components/ui/form-field";
import { UploadForm } from "./upload-form";

// For issues the society has already published. These go live without review.
export function AddPaperForm() {
  return (
    <UploadForm
      url="/api/uploads/journal-back-issue"
      submitLabel="Add to Journal"
      abstractRequired={false}
    >
      <FormField label="Published On *" name="publishedOn" type="date" required />
    </UploadForm>
  );
}
