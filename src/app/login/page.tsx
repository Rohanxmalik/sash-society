import type { Metadata } from "next";
import { AuthShell } from "@/frontend/components/auth/auth-shell";
import { LoginForm } from "@/frontend/components/auth/login-form";
import { safeRedirectPath } from "@/shared/safe-redirect";

export const metadata: Metadata = {
  title: "Log In",
  description: "Log in to your SASS member account.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string | string[] }>;
}) {
  const { next } = await searchParams;

  return (
    <AuthShell title="Log In" subtitle="Access your SASS member account.">
      <LoginForm next={safeRedirectPath(next)} />
    </AuthShell>
  );
}
