import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/auth-shell";
import { SignupForm } from "@/components/auth/signup-form";

export const metadata: Metadata = {
  title: "Create Account",
  description: "Create your SASS member account.",
};

export default function SignupPage() {
  return (
    <AuthShell
      title="Create Account"
      subtitle="Register to manage your SASS membership."
    >
      <SignupForm />
    </AuthShell>
  );
}
