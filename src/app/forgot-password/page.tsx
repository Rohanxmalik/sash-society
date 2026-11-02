import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/auth-shell";
import { EmailRequestForm } from "@/components/auth/email-request-form";

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
      <EmailRequestForm request="passwordReset" />
    </AuthShell>
  );
}
