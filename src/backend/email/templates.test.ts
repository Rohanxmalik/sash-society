import { describe, expect, test } from "vitest";
import {
  contactMessageEmail,
  eventConfirmationEmail,
  membershipRejectedEmail,
  passwordResetEmail,
  signupCodeEmail,
  welcomeMemberEmail,
} from "./templates";

const URL_WITH_QUERY = "http://localhost:3000/api/auth/reset?token=abc&next=/profile";

describe("password reset email", () => {
  test("is addressed to the member", () => {
    expect(passwordResetEmail("member@example.org", URL_WITH_QUERY).to).toBe(
      "member@example.org"
    );
  });

  test("carries the exact link in the text version", () => {
    expect(passwordResetEmail("m@example.org", URL_WITH_QUERY).text).toContain(
      URL_WITH_QUERY
    );
  });

  test("encodes the link for use in an HTML attribute", () => {
    expect(passwordResetEmail("m@example.org", URL_WITH_QUERY).html).toContain(
      'href="http://localhost:3000/api/auth/reset?token=abc&amp;next=/profile"'
    );
  });

  test("cannot be broken out of by quotes in the link", () => {
    const { html } = passwordResetEmail(
      "m@example.org",
      'http://localhost:3000/?x="><script>alert(1)</script>'
    );

    expect(html).not.toContain("<script>");
    expect(html).toContain("&quot;&gt;&lt;script&gt;");
  });
});

describe("sign-up code email", () => {
  test("shows the code in both versions", () => {
    const email = signupCodeEmail("m@example.org", "482913");

    expect(email.text).toContain("482913");
    expect(email.html).toContain("482913");
  });
});

describe("welcome email", () => {
  const welcome = (name: string, expiresAt: Date | null) =>
    welcomeMemberEmail({
      to: "m@example.org",
      name,
      planName: "Student Membership",
      memberNumber: "SASS/ST/2026/0001",
      expiresAt,
      profileUrl: "https://sass.example.org/profile",
      attachments: [],
    });

  test("gives the member number and validity", () => {
    const { text } = welcome("Asha", new Date("2027-11-09T23:59:59Z"));

    expect(text).toContain("SASS/ST/2026/0001");
    expect(text).toContain("10 November 2027");
  });

  test("does not mention an expiry on life plans", () => {
    expect(welcome("Asha", null).text).not.toContain("Valid until");
  });

  test("escapes a member's name in the HTML version", () => {
    const { html } = welcome("<img src=x onerror=alert(1)>", null);

    expect(html).not.toContain("<img");
  });
});

describe("event confirmation email", () => {
  test("includes the number, mode and key dates", () => {
    const { text, attachments } = eventConfirmationEmail({
      to: "m@example.org",
      name: "Asha",
      eventTitle: "4th International Conference",
      eventDate: "January 29 - February 2, 2027",
      eventLocation: "Curepipe, Mauritius",
      optionLabel: "Online",
      registrationNumber: "SASS/MU27/0001",
      keyDates: [{ label: "Abstract Submission", date: "January 6, 2027" }],
      attachments: [{ filename: "r.pdf", content: new Uint8Array([1]) }],
    });

    expect(text).toContain("SASS/MU27/0001");
    expect(text).toContain("Online");
    expect(text).toContain("Abstract Submission: January 6, 2027");
    expect(attachments).toHaveLength(1);
  });
});

describe("rejection email", () => {
  const rejected = (refunded: boolean) =>
    membershipRejectedEmail({
      to: "m@example.org",
      name: "Asha",
      planName: "Ordinary Membership",
      refunded,
    }).text;

  test("says the refund happened when it did", () => {
    expect(rejected(true)).toContain("has been refunded");
  });

  test("does not claim a refund that failed", () => {
    expect(rejected(false)).not.toContain("has been refunded");
  });
});

describe("contact message email", () => {
  test("replies go to the visitor", () => {
    const email = contactMessageEmail({
      to: "society@example.org",
      firstName: "Asha",
      lastName: "Rao",
      email: "asha@example.org",
      subject: "Question",
      message: "Hello",
    });

    expect(email.to).toBe("society@example.org");
    expect(email.replyTo).toBe("asha@example.org");
  });
});
