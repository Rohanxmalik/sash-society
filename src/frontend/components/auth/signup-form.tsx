"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { completeSignupAction } from "@/backend/profiles/actions";
import { Button } from "@/frontend/components/ui/button";
import { FormAlert } from "@/frontend/components/ui/form-alert";
import { FormField } from "@/frontend/components/ui/form-field";
import { authClient } from "@/frontend/lib/auth-client";
import { authProblem } from "@/frontend/lib/auth-error-message";
import { signupCodeSchema, signupSchema } from "@/shared/validation/auth";

type SignupValues = z.infer<typeof signupSchema>;
type CodeValues = z.infer<typeof signupCodeSchema>;

const RESEND_WAIT_SECONDS = 60;

const sendCode = (email: string) =>
  authProblem(
    authClient.emailOtp.sendVerificationOtp({ email, type: "sign-in" })
  );

function ResendCode({ email }: { email: string }) {
  const [secondsLeft, setSecondsLeft] = useState(RESEND_WAIT_SECONDS);
  const [problem, setProblem] = useState<string | null>(null);

  useEffect(() => {
    if (secondsLeft === 0) return;
    const timer = setTimeout(() => setSecondsLeft(secondsLeft - 1), 1000);
    return () => clearTimeout(timer);
  }, [secondsLeft]);

  const resend = async () => {
    setSecondsLeft(RESEND_WAIT_SECONDS);
    setProblem(await sendCode(email));
  };

  return (
    <div className="text-sm text-center space-y-3">
      {problem && <FormAlert>{problem}</FormAlert>}
      {secondsLeft > 0 ? (
        <p className="text-ink-muted">
          You can ask for a new code in {secondsLeft}s.
        </p>
      ) : (
        <button
          type="button"
          onClick={resend}
          className="text-brand-teal hover:underline cursor-pointer"
        >
          Send a new code
        </button>
      )}
    </div>
  );
}

function CodeStep({
  details,
  next,
  onBack,
}: {
  details: SignupValues;
  next: string;
  onBack: () => void;
}) {
  const router = useRouter();
  const [problem, setProblem] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CodeValues>({ resolver: zodResolver(signupCodeSchema) });

  const onSubmit = async ({ code }: CodeValues) => {
    const { name, email, phone, designation, password } = details;

    const signInProblem = await authProblem(
      authClient.signIn.emailOtp({ email, otp: code, name })
    );
    if (signInProblem) {
      setProblem(signInProblem);
      return;
    }

    const result = await completeSignupAction({ phone, designation, password });
    if (!result.ok) {
      setProblem(result.message);
      return;
    }

    router.replace(next);
    router.refresh();
  };

  return (
    <div className="space-y-5">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
        <p className="text-sm text-ink-light">
          We have sent a 6-digit code to{" "}
          <strong className="text-ink break-all">{details.email}</strong>. It
          lasts 10 minutes.
        </p>

        {problem && <FormAlert>{problem}</FormAlert>}

        <FormField
          {...register("code")}
          label="6-digit Code *"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          autoFocus
          error={errors.code?.message}
        />

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Checking..." : "Verify and Finish"}
        </Button>
      </form>

      <ResendCode email={details.email} />

      <button
        type="button"
        onClick={onBack}
        className="block mx-auto text-sm text-brand-teal hover:underline cursor-pointer"
      >
        Change my details
      </button>
    </div>
  );
}

export function SignupForm({ next }: { next: string }) {
  const [details, setDetails] = useState<SignupValues | null>(null);
  const [problem, setProblem] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupValues>({ resolver: zodResolver(signupSchema) });

  const onSubmit = async (values: SignupValues) => {
    const result = await sendCode(values.email);
    setProblem(result);
    if (!result) setDetails(values);
  };

  if (details) {
    return (
      <CodeStep
        details={details}
        next={next}
        onBack={() => setDetails(null)}
      />
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
        {...register("phone")}
        label="Phone Number *"
        type="tel"
        autoComplete="tel"
        error={errors.phone?.message}
      />
      <FormField
        {...register("email")}
        label="Email *"
        type="email"
        autoComplete="email"
        error={errors.email?.message}
      />
      <FormField
        {...register("designation")}
        label="Designation *"
        autoComplete="organization-title"
        error={errors.designation?.message}
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
        {isSubmitting ? "Sending Code..." : "Continue"}
      </Button>

      <p className="text-sm text-center text-ink-light">
        Already have an account?{" "}
        <Link
          href={`/login?next=${encodeURIComponent(next)}`}
          className="text-brand-teal hover:underline"
        >
          Log In
        </Link>
      </p>
    </form>
  );
}
