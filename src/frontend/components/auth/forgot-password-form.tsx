"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { Button } from "@/frontend/components/ui/button";
import { FormAlert } from "@/frontend/components/ui/form-alert";
import { FormField } from "@/frontend/components/ui/form-field";
import { authClient } from "@/frontend/lib/auth-client";
import { authProblem } from "@/frontend/lib/auth-error-message";
import { emailSchema } from "@/shared/validation/auth";

type EmailValues = z.infer<typeof emailSchema>;

// Answers the same way whether or not the account exists.
export function ForgotPasswordForm() {
  const [problem, setProblem] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<EmailValues>({ resolver: zodResolver(emailSchema) });

  const onSubmit = async ({ email }: EmailValues) => {
    const result = await authProblem(
      authClient.requestPasswordReset({ email, redirectTo: "/reset-password" })
    );
    setProblem(result);
    setDone(!result);
  };

  if (done) {
    return (
      <FormAlert tone="success">
        If an account exists for that email, we have sent a reset link.
      </FormAlert>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      {problem && <FormAlert>{problem}</FormAlert>}

      <FormField
        {...register("email")}
        label="Email *"
        type="email"
        autoComplete="email"
        error={errors.email?.message}
      />

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Sending..." : "Send Reset Link"}
      </Button>
    </form>
  );
}
