const DEFAULT_PATH = "/account";
const INTERNAL_ORIGIN = "http://internal.invalid";

// Parses like a browser does, so "//evil.com" and "/\evil.com" cannot leave the site.
export function safeRedirectPath(target: unknown): string {
  if (
    typeof target !== "string" ||
    !target.startsWith("/") ||
    !URL.canParse(target, INTERNAL_ORIGIN)
  ) {
    return DEFAULT_PATH;
  }

  return new URL(target, INTERNAL_ORIGIN).origin === INTERNAL_ORIGIN
    ? target
    : DEFAULT_PATH;
}
