import type { Metadata } from "next";
import { LegalPage } from "@/frontend/components/legal/legal-page";
import { deliveryPolicy } from "@/frontend/content/legal";

export const metadata: Metadata = {
  title: deliveryPolicy.title,
  description: deliveryPolicy.description,
};

export default function Page() {
  return <LegalPage document={deliveryPolicy} />;
}
