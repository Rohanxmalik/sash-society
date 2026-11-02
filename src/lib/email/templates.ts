import type { Email } from "./sender";

const SOCIETY_NAME = "South Asian Sociological Society";

const HTML_ENTITIES: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

const escapeHtml = (value: string) =>
  value.replace(/[&<>"']/g, (char) => HTML_ENTITIES[char]);

type LinkEmail = {
  subject: string;
  intro: string;
  action: string;
  footnote: string;
};

function linkEmail(
  to: string,
  url: string,
  { subject, intro, action, footnote }: LinkEmail
): Email {
  return {
    to,
    subject,
    text: `${intro}\n\n${url}\n\n${footnote}\n\n${SOCIETY_NAME}`,
    html: `<p>${escapeHtml(intro)}</p>
<p><a href="${escapeHtml(url)}">${escapeHtml(action)}</a></p>
<p>${escapeHtml(footnote)}</p>
<p>${SOCIETY_NAME}</p>`,
  };
}

export function verificationEmail(to: string, url: string): Email {
  return linkEmail(to, url, {
    subject: "Verify your email address",
    intro: "Please confirm your email address to finish creating your account.",
    action: "Verify email address",
    footnote: "If you did not create an account, you can ignore this email.",
  });
}

export function existingAccountEmail(to: string, url: string): Email {
  return linkEmail(to, url, {
    subject: "You already have an account",
    intro: "Someone tried to register with this email address, but it already has an account.",
    action: "Reset your password",
    footnote:
      "If this was you and you have forgotten your password, you can reset it here. If not, you can ignore this email.",
  });
}

export function passwordResetEmail(to: string, url: string): Email {
  return linkEmail(to, url, {
    subject: "Reset your password",
    intro: "We received a request to reset your password.",
    action: "Choose a new password",
    footnote:
      "This link expires in 1 hour. If you did not ask for it, you can ignore this email.",
  });
}
