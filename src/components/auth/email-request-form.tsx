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
import { emailSchema } from "@/lib/auth/form-schemas";

type EmailValues = z.infer<typeof emailSchema>;

const requests = {
  passwordReset: {
    send: ({ email }: EmailValues) =>
      authClient.requestPasswordReset({ email, redirectTo: "/reset-password" }),
    idle: "Send Reset Link",
    sent: "If an account exists for that email, we have sent a reset link.",
  },
  verification: {
    send: ({ email }: EmailValues) =>
      authClient.sendVerificationEmail({ email }),
    idle: "Send New Link",
    sent: "If that email needs verifying, we have sent a new link.",
  },
};

// Both requests answer the same way whether or not the account exists.
export function EmailRequestForm({
  request,
}: {
  request: keyof typeof requests;
}) {
  const { send, idle, sent } = requests[request];
  const [problem, setProblem] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<EmailValues>({ resolver: zodResolver(emailSchema) });

  const onSubmit = async (values: EmailValues) => {
    const result = await authProblem(send(values));
    setProblem(result);
    setDone(!result);
  };

  if (done) return <FormAlert tone="success">{sent}</FormAlert>;

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
        {isSubmitting ? "Sending..." : idle}
      </Button>
    </form>
  );
}
