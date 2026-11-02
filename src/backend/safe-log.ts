const QUERY_PARAMS = /\s*params:[\s\S]*$/;

const withoutParams = (text: string) => text.replace(QUERY_PARAMS, "");

// Drizzle puts query values in its error messages, which would otherwise write
// member names, phone numbers and password hashes to the hosting logs.
export function safeLogValue(value: unknown) {
  if (typeof value === "string") return withoutParams(value);

  if (value instanceof Error) {
    const { code } = (value.cause ?? value) as { code?: string };
    return { name: value.name, code, message: withoutParams(value.message) };
  }

  return "[omitted]";
}
