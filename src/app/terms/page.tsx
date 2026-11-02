import type { Metadata } from "next";
import { LegalPage } from "@/frontend/components/legal/legal-page";
import { termsAndConditions } from "@/frontend/content/legal";

export const metadata: Metadata = {
  title: termsAndConditions.title,
  description: termsAndConditions.description,
};

export default function Page() {
  return <LegalPage document={termsAndConditions} />;
}
