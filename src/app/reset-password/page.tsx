import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/auth-shell";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Reset Password",
  robots: { index: false },
};

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{
    token?: string | string[];
    error?: string | string[];
  }>;
}) {
  const { token, error } = await searchParams;

  if (typeof token !== "string" || !token || error) {
    return (
      <AuthShell title="Reset Password">
        <div className="space-y-5">
          <p className="text-sm text-ink-light">
            This reset link is invalid or has expired.
          </p>
          <Button href="/forgot-password" className="w-full">
            Request a New Link
          </Button>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell title="Reset Password" subtitle="Choose a new password.">
      <ResetPasswordForm token={token} />
    </AuthShell>
  );
}
