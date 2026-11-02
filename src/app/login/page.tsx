import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/auth-shell";
import { LoginForm } from "@/components/auth/login-form";
import { safeRedirectPath } from "@/lib/safe-redirect";

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
