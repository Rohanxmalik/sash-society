// Accounts need a unique email, but some members on the society's list have none.
// They get an address on .invalid, a domain reserved so it can never exist, until
// an admin adds the real one.
const NO_EMAIL_DOMAIN = "no-email.invalid";

export const placeholderEmail = (id: string) => `member-${id}@${NO_EMAIL_DOMAIN}`;

export const hasRealEmail = (email: string) =>
  !email.endsWith(`@${NO_EMAIL_DOMAIN}`);
