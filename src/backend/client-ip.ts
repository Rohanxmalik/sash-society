// Set by the Cloudflare edge in front of Render, which replaces any value a visitor
// sends. Render passes X-Real-IP and X-Forwarded-For through from the visitor, so
// they cannot be trusted for rate limits.
export const CLIENT_IP_HEADER = "cf-connecting-ip";

export const clientAddress = (requestHeaders: Headers) =>
  requestHeaders.get(CLIENT_IP_HEADER) ?? "unknown";
