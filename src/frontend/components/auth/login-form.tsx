"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { Button } from "@/frontend/components/ui/button";
import { FormAlert } from "@/frontend/components/ui/form-alert";
import { FormField } from "@/frontend/components/ui/form-field";
import { authClient } from "@/frontend/lib/auth-client";
import { authProblem } from "@/frontend/lib/auth-error-message";
import { loginSchema } from "@/shared/validation/auth";

type LoginValues = z.infer<typeof loginSchema>;

export function LoginForm({ next }: { next: string }) {
  const router = useRouter();
  const [problem, setProblem] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (values: LoginValues) => {
    const result = await authProblem(authClient.signIn.email(values));
    setProblem(result);
    if (result) return;

    router.replace(next);
    router.refresh();
  };

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
      <FormField
        {...register("password")}
        label="Password *"
        type="password"
        autoComplete="current-password"
        error={errors.password?.message}
      />

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Logging in..." : "Log In"}
      </Button>

      <div className="flex justify-between text-sm">
        <Link href="/forgot-password" className="text-brand-teal hover:underline">
          Forgot password?
        </Link>
        <Link
          href={`/signup?next=${encodeURIComponent(next)}`}
          className="text-brand-teal hover:underline"
        >
          Create an account
        </Link>
      </div>
    </form>
  );
}
