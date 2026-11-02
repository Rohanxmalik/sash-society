import {
  useId,
  type InputHTMLAttributes,
  type Ref,
  type TextareaHTMLAttributes,
} from "react";

const CONTROL_CLASSES =
  "w-full border border-ink/20 rounded-sm px-4 py-3 text-sm bg-white focus:outline-none focus:border-brand-teal focus:ring-1 focus:ring-brand-teal transition-colors";

type FormFieldProps = {
  label: string;
  error?: string;
  ref?: Ref<HTMLInputElement>;
} & InputHTMLAttributes<HTMLInputElement>;

export function FormField({ label, error, ...props }: FormFieldProps) {
  const id = useId();
  const errorId = `${id}-error`;

  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-ink mb-1.5">
        {label}
      </label>
      <input
        id={id}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        className={CONTROL_CLASSES}
        {...props}
      />
      {error && (
        <p id={errorId} className="mt-1 text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}

type TextAreaFieldProps = {
  label: string;
  error?: string;
  ref?: Ref<HTMLTextAreaElement>;
} & TextareaHTMLAttributes<HTMLTextAreaElement>;

export function TextAreaField({ label, error, ...props }: TextAreaFieldProps) {
  const id = useId();
  const errorId = `${id}-error`;

  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-ink mb-1.5">
        {label}
      </label>
      <textarea
        id={id}
        rows={4}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        className={`${CONTROL_CLASSES} resize-y`}
        {...props}
      />
      {error && (
        <p id={errorId} className="mt-1 text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
