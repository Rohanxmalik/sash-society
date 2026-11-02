"use client";

import { Button } from "@/frontend/components/ui/button";

// For actions that cannot be undone from here, such as a refund.
export function ConfirmButton({
  question,
  children,
  variant = "outline",
}: {
  question: string;
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "outline";
}) {
  return (
    <Button
      type="submit"
      size="sm"
      variant={variant}
      onClick={(event) => {
        if (!window.confirm(question)) event.preventDefault();
      }}
    >
      {children}
    </Button>
  );
}
