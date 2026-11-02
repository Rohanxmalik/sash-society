import type { Metadata } from "next";
import { LegalPage } from "@/frontend/components/legal/legal-page";
import { privacyPolicy } from "@/frontend/content/legal";

export const metadata: Metadata = {
  title: privacyPolicy.title,
  description: privacyPolicy.description,
};

export default function Page() {
  return <LegalPage document={privacyPolicy} />;
}
