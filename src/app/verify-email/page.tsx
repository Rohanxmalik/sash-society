import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/auth-shell";
import { EmailRequestForm } from "@/components/auth/email-request-form";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Verify Email",
  robots: { index: false },
};

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{
    error?: string | string[];
    verified?: string | string[];
  }>;
}) {
  const { error, verified } = await searchParams;

  if (verified && !error) {
    return (
      <AuthShell title="Verify Email">
        <div className="text-center space-y-5">
          <h2 className="text-xl font-bold text-ink font-heading">
            Your email is verified
          </h2>
          <p className="text-sm text-ink-light">
            Log in with your password to continue.
          </p>
          <Button href="/login" className="w-full">
            Log In
          </Button>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell title="Verify Email">
      <div className="space-y-5">
        <h2 className="text-xl font-bold text-ink font-heading">
          {error ? "This link has expired" : "Need a new link?"}
        </h2>
        <p className="text-sm text-ink-light">
          Enter your email and we will send you a new verification link.
        </p>
        <EmailRequestForm request="verification" />
      </div>
    </AuthShell>
  );
}
