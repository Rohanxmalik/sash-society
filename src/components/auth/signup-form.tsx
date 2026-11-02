"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { Button } from "@/components/ui/button";
import { FormAlert } from "@/components/ui/form-alert";
import { FormField } from "@/components/ui/form-field";
import { authClient } from "@/lib/auth-client";
import { authProblem } from "@/lib/auth/error-message";
import { signupSchema } from "@/lib/auth/form-schemas";

type SignupValues = z.infer<typeof signupSchema>;

export function SignupForm() {
  const [problem, setProblem] = useState<string | null>(null);
  const [sentTo, setSentTo] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupValues>({ resolver: zodResolver(signupSchema) });

  const onSubmit = async ({ name, email, password }: SignupValues) => {
    const result = await authProblem(
      authClient.signUp.email({ name, email, password })
    );
    setProblem(result);
    if (!result) setSentTo(email);
  };

  if (sentTo) {
    return (
      <div className="text-center">
        <h2 className="text-xl font-bold text-ink font-heading">
          Check your inbox
        </h2>
        <p className="mt-2 text-sm text-ink-light">
          We sent a verification link to {sentTo}. Open it to finish creating
          your account.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      {problem && <FormAlert>{problem}</FormAlert>}

      <FormField
        {...register("name")}
        label="Full Name *"
        autoComplete="name"
        error={errors.name?.message}
      />
      <FormField
        {...register("email")}
        label="Email *"
        type="email"
        autoComplete="email"
        error={errors.email?.message}
      />
      <FormField
        {...register("password")}
        label="Password *"
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
        {isSubmitting ? "Creating..." : "Create Account"}
      </Button>

      <p className="text-sm text-center text-ink-light">
        Already have an account?{" "}
        <Link href="/login" className="text-brand-teal hover:underline">
          Log in
        </Link>
      </p>
    </form>
  );
}
