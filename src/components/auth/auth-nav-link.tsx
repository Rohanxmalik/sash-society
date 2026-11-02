"use client";

import { UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";

// Reads the session in the browser so the public pages can stay static.
export function AuthNavLink({
  className,
  iconOnly = false,
}: {
  className?: string;
  iconOnly?: boolean;
}) {
  const { data: session, isPending } = authClient.useSession();

  if (isPending) return null;

  const label = session ? "My Account" : "Log In";

  return (
    <Button
      href={session ? "/account" : "/login"}
      variant="ghost"
      size="sm"
      className={className}
    >
      {iconOnly ? (
        <>
          <UserRound className="w-5 h-5" />
          <span className="sr-only">{label}</span>
        </>
      ) : (
        label
      )}
    </Button>
  );
}
