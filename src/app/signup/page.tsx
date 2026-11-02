import type { Metadata } from "next";
import { AuthShell } from "@/frontend/components/auth/auth-shell";
import { SignupForm } from "@/frontend/components/auth/signup-form";
import { safeRedirectPath } from "@/shared/safe-redirect";

export const metadata: Metadata = {
  title: "Create Account",
  description: "Create your SASS member account.",
};

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string | string[] }>;
}) {
  const { next } = await searchParams;

  return (
    <AuthShell
      title="Create Account"
      subtitle="Register to manage your SASS membership."
    >
      <SignupForm next={safeRedirectPath(next, "/membership")} />
    </AuthShell>
  );
}
