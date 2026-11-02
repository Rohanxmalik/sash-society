import { clientConfig } from "@/shared/client-config";
import { formatDateIndia } from "@/shared/dates";
import type { Email, EmailAttachment } from "./sender";

const { society, emails } = clientConfig;

const HTML_ENTITIES: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

const escapeHtml = (value: string) =>
  value.replace(/[&<>"']/g, (char) => HTML_ENTITIES[char]);

type EmailContent = {
  to: string;
  subject: string;
  paragraphs: string[];
  listTitle?: string;
  list?: string[];
  action?: { label: string; url: string };
  footnote?: string;
  attachments?: EmailAttachment[];
  replyTo?: string;
};

function compose({
  to,
  subject,
  paragraphs,
  listTitle,
  list = [],
  action,
  footnote,
  attachments,
  replyTo,
}: EmailContent): Email {
  const text = [
    ...paragraphs,
    ...(listTitle ? [listTitle] : []),
    ...(list.length ? [list.map((item) => `- ${item}`).join("\n")] : []),
    ...(action ? [`${action.label}: ${action.url}`] : []),
    ...(footnote ? [footnote] : []),
    society.name,
  ].join("\n\n");

  const html = [
    ...paragraphs.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`),
    ...(listTitle ? [`<p><strong>${escapeHtml(listTitle)}</strong></p>`] : []),
    ...(list.length
      ? [`<ul>${list.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`]
      : []),
    ...(action
      ? [`<p><a href="${escapeHtml(action.url)}">${escapeHtml(action.label)}</a></p>`]
      : []),
    ...(footnote ? [`<p><small>${escapeHtml(footnote)}</small></p>`] : []),
    `<p>${escapeHtml(society.name)}</p>`,
  ].join("\n");

  return { to, subject, text, html, attachments, replyTo };
}

export function signupCodeEmail(to: string, code: string): Email {
  return compose({
    to,
    subject: `${code} is your ${society.shortName} code`,
    paragraphs: [
      `Your ${society.shortName} verification code is ${code}.`,
      "It expires in 10 minutes.",
    ],
    footnote: "If you did not ask for this code, you can ignore this email.",
  });
}

export function passwordResetEmail(to: string, url: string): Email {
  return compose({
    to,
    subject: "Reset your password",
    paragraphs: ["We received a request to reset your password."],
    action: { label: "Choose a new password", url },
    footnote:
      "This link expires in 1 hour. If you did not ask for it, you can ignore this email.",
  });
}

export function welcomeMemberEmail({
  to,
  name,
  planName,
  memberNumber,
  expiresAt,
  profileUrl,
  attachments,
}: {
  to: string;
  name: string;
  planName: string;
  memberNumber: string;
  expiresAt: Date | null;
  profileUrl: string;
  attachments: EmailAttachment[];
}): Email {
  return compose({
    to,
    subject: `Welcome to the ${society.name}`,
    paragraphs: [
      `Dear ${name},`,
      `Congratulations and welcome to the ${society.name}. Your ${planName} is now active.`,
      `Member number: ${memberNumber}${
        expiresAt ? `. Valid until ${formatDateIndia(expiresAt)}.` : "."
      }`,
    ],
    listTitle: "What to expect",
    list: emails.memberWhatToExpect,
    action: { label: "View your profile", url: profileUrl },
    attachments,
  });
}

export function applicationReceivedEmail({
  to,
  name,
  planName,
  attachments,
}: {
  to: string;
  name: string;
  planName: string;
  attachments: EmailAttachment[];
}): Email {
  return compose({
    to,
    subject: `We have received your ${planName} application`,
    paragraphs: [
      `Dear ${name},`,
      `Thank you for applying for ${planName} of the ${society.name}.`,
    ],
    listTitle: "What to expect",
    list: emails.approvalWhatToExpect,
    attachments,
  });
}

export function membershipRejectedEmail({
  to,
  name,
  planName,
  refunded,
}: {
  to: string;
  name: string;
  planName: string;
  refunded: boolean;
}): Email {
  return compose({
    to,
    subject: `Your ${planName} application`,
    paragraphs: [
      `Dear ${name},`,
      `We regret that your application for ${planName} was not approved.`,
      refunded
        ? "Your payment has been refunded and should reach you within 5-7 working days."
        : "We will refund your payment and confirm once it has been processed.",
      `Please write to ${society.email} if you have any questions.`,
    ],
  });
}

export function renewalReminderEmail({
  to,
  name,
  planName,
  expiresAt,
  renewUrl,
}: {
  to: string;
  name: string;
  planName: string;
  expiresAt: Date;
  renewUrl: string;
}): Email {
  return compose({
    to,
    subject: `Your ${society.shortName} membership expires soon`,
    paragraphs: [
      `Dear ${name},`,
      `Your ${planName} expires on ${formatDateIndia(expiresAt)}.`,
    ],
    action: { label: "Renew your membership", url: renewUrl },
  });
}

export function eventConfirmationEmail({
  to,
  name,
  eventTitle,
  eventDate,
  eventLocation,
  optionLabel,
  registrationNumber,
  keyDates,
  attachments,
}: {
  to: string;
  name: string;
  eventTitle: string;
  eventDate: string;
  eventLocation: string;
  optionLabel: string;
  registrationNumber: string;
  keyDates: { label: string; date: string }[];
  attachments: EmailAttachment[];
}): Email {
  return compose({
    to,
    subject: `Registration confirmed: ${eventTitle}`,
    paragraphs: [
      `Dear ${name},`,
      `Congratulations, your registration for the ${eventTitle} is confirmed.`,
      `Registration number: ${registrationNumber}. Attending: ${optionLabel}. ${eventDate}, ${eventLocation}.`,
    ],
    listTitle: "What to expect",
    list: [
      ...emails.eventWhatToExpect,
      ...keyDates.map(({ label, date }) => `${label}: ${date}`),
    ],
    footnote: `For questions, write to ${society.email}.`,
    attachments,
  });
}

export function contactMessageEmail({
  to,
  firstName,
  lastName,
  email,
  subject,
  message,
}: {
  to: string;
  firstName: string;
  lastName: string;
  email: string;
  subject: string;
  message: string;
}): Email {
  return compose({
    to,
    subject: `Website message: ${subject}`,
    paragraphs: [`From ${firstName} ${lastName} (${email})`, message],
    replyTo: email,
  });
}
