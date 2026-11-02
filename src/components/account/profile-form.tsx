"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { saveProfileAction, type SaveProfileResult } from "@/app/account/actions";
import { Button } from "@/components/ui/button";
import { FormAlert } from "@/components/ui/form-alert";
import { FormField } from "@/components/ui/form-field";
import { profileSchema, type ProfileInput } from "@/lib/profiles/schema";

type ProfileFormValues = z.input<typeof profileSchema>;

export function ProfileForm({ initial }: { initial: ProfileFormValues }) {
  const [result, setResult] = useState<SaveProfileResult | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProfileFormValues, unknown, ProfileInput>({
    resolver: zodResolver(profileSchema),
    defaultValues: initial,
  });

  const onSubmit = async (values: ProfileInput) => {
    setResult(await saveProfileAction(values));
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      {result?.ok && <FormAlert tone="success">Profile saved.</FormAlert>}
      {result?.ok === false && <FormAlert>{result.message}</FormAlert>}

      <FormField
        {...register("fullName")}
        label="Full Name *"
        autoComplete="name"
        error={errors.fullName?.message}
      />
      <div className="grid gap-5 sm:grid-cols-2">
        <FormField
          {...register("phone")}
          label="Phone *"
          type="tel"
          autoComplete="tel"
          error={errors.phone?.message}
        />
        <FormField
          {...register("country")}
          label="Country *"
          autoComplete="country-name"
          error={errors.country?.message}
        />
      </div>
      <FormField
        {...register("institution")}
        label="Institution"
        autoComplete="organization"
        error={errors.institution?.message}
      />
      <FormField
        {...register("qualification")}
        label="Qualification"
        error={errors.qualification?.message}
      />

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Saving..." : "Save Profile"}
      </Button>
    </form>
  );
}
