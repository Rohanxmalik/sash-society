import type { Metadata } from "next";
import { AuthShell } from "@/frontend/components/auth/auth-shell";
import { ForgotPasswordForm } from "@/frontend/components/auth/forgot-password-form";

export const metadata: Metadata = {
  title: "Forgot Password",
  description: "Reset your SASS account password.",
};

export default function ForgotPasswordPage() {
  return (
    <AuthShell
      title="Forgot Password"
      subtitle="We will email you a link to choose a new password."
    >
      <ForgotPasswordForm />
    </AuthShell>
  );
}
