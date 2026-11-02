"use client";

import { useState } from "react";
import { confirmPaymentAction } from "@/backend/payments/actions";
import { openCheckout } from "@/frontend/lib/checkout";
import type { CheckoutResult, PaymentOutcome } from "@/shared/checkout";

const PAYMENT_ERROR =
  "We could not complete the payment. If money was taken, we will confirm it by email shortly.";

export function useCheckout() {
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);
  const [outcome, setOutcome] = useState<PaymentOutcome | null>(null);

  const pay = async (start: () => Promise<CheckoutResult>) => {
    setBusy(true);
    setProblem(null);

    try {
      const started = await start();
      if (!started.ok) {
        setProblem(started.message);
        return;
      }

      const response = await openCheckout(started.order);
      if (!response) return;

      const confirmed = await confirmPaymentAction(response);
      if (confirmed.ok) setOutcome(confirmed.outcome);
      else setProblem(confirmed.message);
    } catch {
      setProblem(PAYMENT_ERROR);
    } finally {
      setBusy(false);
    }
  };

  return { pay, busy, problem, outcome };
}
