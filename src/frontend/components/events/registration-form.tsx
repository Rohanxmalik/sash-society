"use client";

import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { startEventCheckoutAction } from "@/backend/payments/actions";
import { Celebration } from "@/frontend/components/payment/celebration";
import { useCheckout } from "@/frontend/components/payment/use-checkout";
import { Button } from "@/frontend/components/ui/button";
import { FormAlert } from "@/frontend/components/ui/form-alert";
import { FormField } from "@/frontend/components/ui/form-field";
import { formatMoney, type Currency } from "@/shared/money";
import { eventRegistrationSchema } from "@/shared/validation/event";

type RegistrationValues = z.input<typeof eventRegistrationSchema>;

export type FormOption = {
  id: string;
  label: string;
  amountMinor: number;
  currency: Currency;
  closesLabel: string;
  open: boolean;
};

export function RegistrationForm({
  eventId,
  options,
  subThemes,
  prefill,
}: {
  eventId: string;
  options: FormOption[];
  subThemes: string[];
  prefill: Partial<RegistrationValues>;
}) {
  const { pay, busy, problem, outcome } = useCheckout();
  const firstOpen = options.find((option) => option.open);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RegistrationValues>({
    resolver: zodResolver(eventRegistrationSchema),
    defaultValues: { eventId, optionId: firstOpen?.id, ...prefill },
  });

  const optionId = useWatch({ control, name: "optionId" });

  if (outcome) return <Celebration outcome={outcome} />;

  if (!firstOpen) {
    return <FormAlert>Registration for this event has closed.</FormAlert>;
  }

  const chosen = options.find((option) => option.id === optionId);
  const onSubmit = (values: RegistrationValues) =>
    pay(() => startEventCheckoutAction(values));

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      {problem && <FormAlert>{problem}</FormAlert>}

      <fieldset>
        <legend className="block text-sm font-medium text-ink mb-2">
          How will you attend? *
        </legend>
        <div className="space-y-2">
          {options.map((option) => (
            <label
              key={option.id}
              className={`flex items-center gap-3 border rounded-sm px-4 py-3 text-sm ${
                option.open
                  ? "border-ink/20 cursor-pointer"
                  : "border-ink/10 text-ink-muted"
              }`}
            >
              <input
                {...register("optionId")}
                type="radio"
                value={option.id}
                disabled={!option.open}
                className="accent-brand-dark-teal"
              />
              <span className="flex-1">
                {option.label}
                <span className="block text-xs text-ink-muted">
                  {option.open ? `Closes ${option.closesLabel}` : "Closed"}
                </span>
              </span>
              <span className="font-semibold text-ink">
                {formatMoney(option.amountMinor, option.currency)}
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <FormField
        {...register("fullName")}
        label="Full Name *"
        autoComplete="name"
        error={errors.fullName?.message}
      />
      <FormField
        {...register("email")}
        label="Email *"
        type="email"
        autoComplete="email"
        error={errors.email?.message}
      />
      <FormField
        {...register("whatsapp")}
        label="WhatsApp Number *"
        type="tel"
        autoComplete="tel"
        error={errors.whatsapp?.message}
      />
      <FormField
        {...register("affiliation")}
        label="Affiliation *"
        placeholder="Your university or institution"
        error={errors.affiliation?.message}
      />
      <FormField
        {...register("designation")}
        label="Designation *"
        error={errors.designation?.message}
      />
      <FormField
        {...register("paperTitle")}
        label="Paper Title"
        error={errors.paperTitle?.message}
      />

      {subThemes.length > 0 && (
        <div>
          <label
            htmlFor="sub-theme"
            className="block text-sm font-medium text-ink mb-1.5"
          >
            Sub-theme
          </label>
          <select
            {...register("subTheme")}
            id="sub-theme"
            className="w-full border border-ink/20 rounded-sm px-4 py-3 text-sm bg-white focus:outline-none focus:border-brand-teal focus:ring-1 focus:ring-brand-teal transition-colors"
          >
            <option value="">Choose a sub-theme</option>
            {subThemes.map((subTheme) => (
              <option key={subTheme} value={subTheme}>
                {subTheme}
              </option>
            ))}
          </select>
        </div>
      )}

      <Button type="submit" className="w-full" disabled={busy}>
        {busy
          ? "Opening..."
          : `Pay ${chosen ? formatMoney(chosen.amountMinor, chosen.currency) : ""}`}
      </Button>
    </form>
  );
}
