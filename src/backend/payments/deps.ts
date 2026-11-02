import type { Db } from "@/backend/db/types";
import type { SendEmail } from "@/backend/email/sender";
import type { Gateway } from "./gateway";

export interface PaymentDeps {
  db: Db;
  gateway: Gateway;
  sendEmail: SendEmail;
  baseURL: string;
  now: () => Date;
}
