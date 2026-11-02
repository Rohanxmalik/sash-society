import { useId, type InputHTMLAttributes, type Ref } from "react";

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
        className="w-full border border-ink/20 rounded-sm px-4 py-3 text-sm bg-white focus:outline-none focus:border-brand-teal focus:ring-1 focus:ring-brand-teal transition-colors"
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
