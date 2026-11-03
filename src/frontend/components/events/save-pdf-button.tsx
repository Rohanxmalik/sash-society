"use client";

import { Download } from "lucide-react";
import { Button } from "@/frontend/components/ui/button";

// The browser's print window offers Save as PDF, so no PDF files are hosted.
export function SavePdfButton() {
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={() => window.print()}
    >
      <Download className="w-4 h-4" />
      Save as PDF
    </Button>
  );
}
