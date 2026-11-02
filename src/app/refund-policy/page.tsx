import type { Metadata } from "next";
import { LegalPage } from "@/frontend/components/legal/legal-page";
import { refundPolicy } from "@/frontend/content/legal";

export const metadata: Metadata = {
  title: refundPolicy.title,
  description: refundPolicy.description,
};

export default function Page() {
  return <LegalPage document={refundPolicy} />;
}
