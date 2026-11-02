"use server";

import { headers } from "next/headers";
import { clientAddress } from "@/backend/client-ip";
import { createRateLimiter } from "@/backend/rate-limit";
import { getMailer } from "@/backend/runtime";
import { sendContactMessage, type ContactResult } from "./send-message";

const ONE_HOUR_MS = 60 * 60 * 1000;
const allowMessage = createRateLimiter({ limit: 5, windowMs: ONE_HOUR_MS });

export async function sendContactMessageAction(
  input: unknown
): Promise<ContactResult> {
  const address = clientAddress(await headers());
  if (!allowMessage(address)) {
    return {
      ok: false,
      message: "Too many messages. Please try again later.",
    };
  }

  return sendContactMessage(getMailer(), input);
}
