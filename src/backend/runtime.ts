import "server-only";
import { getDb } from "@/backend/db";
import { createEmailSender, type SendEmail } from "@/backend/email/sender";
import { getEnv } from "@/backend/env";
import type { PaymentDeps } from "@/backend/payments/deps";
import { createFakeGateway } from "@/backend/payments/fake-gateway";
import type { Gateway } from "@/backend/payments/gateway";
import { createRazorpayGateway } from "@/backend/payments/razorpay";
import { createVisitCounter, type VisitCounter } from "@/backend/visits/counter";

let mailer: SendEmail | undefined;
let gateway: Gateway | undefined;
let visitCounter: VisitCounter | undefined;

export function getMailer(): SendEmail {
  if (mailer) return mailer;

  const env = getEnv();
  mailer = createEmailSender({
    resendApiKey: env.RESEND_API_KEY,
    from: env.EMAIL_FROM,
    devMailFile: env.DEV_MAIL_FILE,
  });
  return mailer;
}

function getGateway(): Gateway {
  if (gateway) return gateway;

  const { RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET } = getEnv();
  // parseEnv requires both keys in production, so the fake is development only.
  gateway =
    RAZORPAY_KEY_ID && RAZORPAY_KEY_SECRET
      ? createRazorpayGateway({
          keyId: RAZORPAY_KEY_ID,
          keySecret: RAZORPAY_KEY_SECRET,
        })
      : createFakeGateway();
  return gateway;
}

export function getVisitCounter(): VisitCounter {
  visitCounter ??= createVisitCounter({ db: getDb() });
  return visitCounter;
}

export function getPaymentDeps(): PaymentDeps {
  return {
    db: getDb(),
    gateway: getGateway(),
    sendEmail: getMailer(),
    baseURL: getEnv().BETTER_AUTH_URL,
    now: () => new Date(),
  };
}
