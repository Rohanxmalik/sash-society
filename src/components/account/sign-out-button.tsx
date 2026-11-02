"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { FormAlert } from "@/components/ui/form-alert";
import { authClient } from "@/lib/auth-client";
import { authProblem } from "@/lib/auth/error-message";

export function SignOutButton() {
  const router = useRouter();
  const [problem, setProblem] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const signOut = async () => {
    setPending(true);
    const result = await authProblem(authClient.signOut());
    setProblem(result);
    setPending(false);
    if (result) return;

    router.push("/");
    router.refresh();
  };

  return (
    <div className="space-y-3">
      {problem && <FormAlert>{problem}</FormAlert>}
      <Button variant="outline" size="sm" onClick={signOut} disabled={pending}>
        {pending ? "Signing Out..." : "Sign Out"}
      </Button>
    </div>
  );
}
