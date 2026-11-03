"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { saveProfileAction } from "@/backend/profiles/actions";
import { Button } from "@/frontend/components/ui/button";
import { FormAlert } from "@/frontend/components/ui/form-alert";
import { FormField, TextAreaField } from "@/frontend/components/ui/form-field";
import { profileSchema } from "@/shared/validation/profile";

type ProfileFormInput = z.input<typeof profileSchema>;

export type ProfileFormValues = {
  fullName: string;
  phone: string;
  designation: string;
  institution: string;
  country: string;
  education: string;
  experience: string;
  publications: string;
  website: string;
  showInDirectory: boolean;
};

export function ProfileForm({ initial }: { initial: ProfileFormValues }) {
  const [problem, setProblem] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProfileFormInput>({
    resolver: zodResolver(profileSchema),
    defaultValues: initial,
  });

  const onSubmit = async (values: ProfileFormInput) => {
    setSaved(false);
    const result = await saveProfileAction(values);
    setProblem(result.ok ? null : result.message);
    setSaved(result.ok);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      {problem && <FormAlert>{problem}</FormAlert>}
      {saved && (
        <FormAlert tone="success">Your profile has been saved.</FormAlert>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <FormField
          {...register("fullName")}
          label="Full Name *"
          autoComplete="name"
          error={errors.fullName?.message}
        />
        <FormField
          {...register("phone")}
          label="Phone Number *"
          type="tel"
          autoComplete="tel"
          error={errors.phone?.message}
        />
        <FormField
          {...register("designation")}
          label="Designation *"
          error={errors.designation?.message}
        />
        <FormField
          {...register("institution")}
          label="Institution"
          error={errors.institution?.message}
        />
        <FormField
          {...register("country")}
          label="Country"
          autoComplete="country-name"
          error={errors.country?.message}
        />
        <FormField
          {...register("website")}
          label="Website"
          type="url"
          autoComplete="url"
          placeholder="https://www.yourwebsite.com"
          error={errors.website?.message}
        />
      </div>

      <TextAreaField
        {...register("education")}
        label="Education"
        placeholder="Schools, colleges and universities you attended"
        error={errors.education?.message}
      />
      <TextAreaField
        {...register("experience")}
        label="Experience"
        placeholder="Past positions and roles"
        error={errors.experience?.message}
      />
      <TextAreaField
        {...register("publications")}
        label="Publications"
        placeholder="Articles, books and chapters"
        error={errors.publications?.message}
      />

      <label className="flex gap-3 text-sm text-ink-light cursor-pointer">
        <input
          {...register("showInDirectory")}
          type="checkbox"
          className="mt-0.5 accent-brand-dark-teal"
        />
        Show my name in the public members list
      </label>

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Saving..." : "Save Profile"}
      </Button>
    </form>
  );
}
