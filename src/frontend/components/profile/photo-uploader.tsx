"use client";

import { useId, useState, type ChangeEvent } from "react";
import { UserRound } from "lucide-react";
import { savePhotoAction } from "@/backend/profiles/actions";
import { FormAlert } from "@/frontend/components/ui/form-alert";
import { resizePhoto } from "@/frontend/lib/resize-photo";

const READ_FAILED = "We could not read that photo. Please try another one.";

export function PhotoUploader({ initial }: { initial: string | null }) {
  const inputId = useId();
  const [photo, setPhoto] = useState(initial);
  const [problem, setProblem] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const save = async (next: string | null) => {
    const result = await savePhotoAction(next);
    setProblem(result.ok ? null : result.message);
    if (result.ok) setPhoto(next);
  };

  const onChoose = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setBusy(true);
    try {
      await save(await resizePhoto(file));
    } catch {
      setProblem(READ_FAILED);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-5">
        {photo ? (
          // A data URL from the database, which next/image cannot optimise.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={photo}
            alt="Your profile photo"
            className="w-24 h-24 rounded-full object-cover border border-ink/10"
          />
        ) : (
          <div className="w-24 h-24 rounded-full bg-brand-teal/10 flex items-center justify-center">
            <UserRound className="w-10 h-10 text-brand-teal" />
          </div>
        )}

        <div className="space-y-2">
          <label
            htmlFor={inputId}
            className="block text-sm font-semibold text-brand-dark-teal cursor-pointer hover:underline"
          >
            {busy ? "Saving..." : "Upload Photo"}
          </label>
          <input
            id={inputId}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            disabled={busy}
            onChange={onChoose}
            className="sr-only"
          />
          {photo && (
            <button
              type="button"
              onClick={() => save(null)}
              className="block text-sm text-ink-muted hover:text-ink cursor-pointer"
            >
              Remove photo
            </button>
          )}
        </div>
      </div>

      {problem && <FormAlert>{problem}</FormAlert>}
    </div>
  );
}
