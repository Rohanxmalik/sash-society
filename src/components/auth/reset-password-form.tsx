"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { Button } from "@/components/ui/button";
import { FormAlert } from "@/components/ui/form-alert";
import { FormField } from "@/components/ui/form-field";
import { authClient } from "@/lib/auth-client";
import { authProblem } from "@/lib/auth/error-message";
import { resetPasswordSchema } from "@/lib/auth/form-schemas";

type ResetValues = z.infer<typeof resetPasswordSchema>;

export function ResetPasswordForm({ token }: { token: string }) {
  const [problem, setProblem] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetValues>({ resolver: zodResolver(resetPasswordSchema) });

  const onSubmit = async ({ password }: ResetValues) => {
    const result = await authProblem(
      authClient.resetPassword({ newPassword: password, token })
    );
    setProblem(result);
    setDone(!result);
  };

  if (done) {
    return (
      <div className="space-y-5">
        <FormAlert tone="success">Your password has been changed.</FormAlert>
        <Button href="/login" className="w-full">
          Log In
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      {problem && <FormAlert>{problem}</FormAlert>}

      <FormField
        {...register("password")}
        label="New Password *"
        type="password"
        autoComplete="new-password"
        error={errors.password?.message}
      />
      <FormField
        {...register("confirmPassword")}
        label="Confirm Password *"
        type="password"
        autoComplete="new-password"
        error={errors.confirmPassword?.message}
      />

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Changing..." : "Change Password"}
      </Button>
    </form>
  );
}
