type AuthError = { code?: string; status?: number };

const GENERIC_MESSAGE = "Something went wrong. Please try again.";
const RATE_LIMITED_MESSAGE =
  "Too many attempts. Please wait a few minutes and try again.";

const MESSAGES: Record<string, string> = {
  INVALID_EMAIL_OR_PASSWORD: "Incorrect email or password.",
  EMAIL_NOT_VERIFIED: "Please sign up again to verify your email.",
  INVALID_TOKEN: "This link is invalid or has expired. Please request a new one.",
  INVALID_OTP: "That code is not right. Please check it and try again.",
  OTP_EXPIRED: "That code has expired. Please ask for a new one.",
  TOO_MANY_ATTEMPTS: "Too many wrong codes. Please ask for a new one.",
  BANNED_USER: "This account has been removed. Please contact the society.",
};

function messageFor({ code, status }: AuthError) {
  if (status === 429) return RATE_LIMITED_MESSAGE;
  return (code && MESSAGES[code]) || GENERIC_MESSAGE;
}

// Resolves to a message for the person at the form, or null when the call worked.
export async function authProblem(
  call: Promise<{ error: AuthError | null }>
): Promise<string | null> {
  try {
    const { error } = await call;
    return error ? messageFor(error) : null;
  } catch {
    return GENERIC_MESSAGE;
  }
}
