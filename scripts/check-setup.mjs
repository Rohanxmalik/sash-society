// Checks the production setup in one go: npm run setup:check
//
// Reads values from the environment, so run it through Railway to use the live
// variables: railway run npm run setup:check
// Nothing is changed and no secret is printed.
import pg from "pg";

const REQUIRED = [
  "DATABASE_URL",
  "BETTER_AUTH_SECRET",
  "BETTER_AUTH_URL",
  "ADMIN_EMAILS",
  "RESEND_API_KEY",
  "EMAIL_FROM",
  "RAZORPAY_KEY_ID",
  "RAZORPAY_KEY_SECRET",
  "RAZORPAY_WEBHOOK_SECRET",
  "CRON_SECRET",
];

const MIN_SECRET_LENGTH = 32;
const env = process.env;

function report(ok, label, detail = "") {
  console.info(`${ok ? "PASS" : "FAIL"}  ${label}${detail ? `: ${detail}` : ""}`);
  return ok;
}

const failure = (error) => (error instanceof Error ? error.message : String(error));

function checkVariables() {
  const missing = REQUIRED.filter((name) => !env[name]);
  return report(missing.length === 0, "Variables set", missing.join(", "));
}

function checkValues() {
  const url = env.BETTER_AUTH_URL ?? "";
  const key = env.RAZORPAY_KEY_ID ?? "";

  return [
    report(url.startsWith("https://"), "Site address uses https", url),
    report(
      (env.BETTER_AUTH_SECRET ?? "").length >= MIN_SECRET_LENGTH,
      "Auth secret is long enough"
    ),
    report(
      key.startsWith("rzp_live_"),
      "Razorpay key is a live key",
      key.startsWith("rzp_test_") ? "still a test key" : ""
    ),
  ].every(Boolean);
}

async function checkDatabase() {
  const client = new pg.Client({ connectionString: env.DATABASE_URL });
  try {
    await client.connect();
    const { rows } = await client.query(
      "select count(*)::int as tables from information_schema.tables where table_schema = 'public'"
    );
    return report(rows[0].tables > 0, "Database reachable and migrated", `${rows[0].tables} tables`);
  } catch (error) {
    return report(false, "Database reachable", failure(error));
  } finally {
    await client.end().catch(() => {});
  }
}

async function checkResend() {
  const domain = (env.EMAIL_FROM ?? "").match(/@([^>\s]+)/)?.[1];
  try {
    const response = await fetch("https://api.resend.com/domains", {
      headers: { authorization: `Bearer ${env.RESEND_API_KEY}` },
    });
    if (!response.ok) return report(false, "Resend key", `HTTP ${response.status}`);

    const { data } = await response.json();
    const found = data.find(({ name }) => name === domain);
    return report(found?.status === "verified", "Resend domain verified", found?.status ?? `${domain} not added`);
  } catch (error) {
    return report(false, "Resend reachable", failure(error));
  }
}

async function checkRazorpay() {
  const credentials = Buffer.from(
    `${env.RAZORPAY_KEY_ID}:${env.RAZORPAY_KEY_SECRET}`
  ).toString("base64");
  try {
    const response = await fetch("https://api.razorpay.com/v1/orders?count=1", {
      headers: { authorization: `Basic ${credentials}` },
    });
    return report(response.ok, "Razorpay keys accepted", response.ok ? "" : `HTTP ${response.status}`);
  } catch (error) {
    return report(false, "Razorpay reachable", failure(error));
  }
}

async function checkSite() {
  try {
    const response = await fetch(`${env.BETTER_AUTH_URL}/api/health`);
    return report(response.ok, "Live site health check", `HTTP ${response.status}`);
  } catch (error) {
    return report(false, "Live site reachable", failure(error));
  }
}

const results = [
  checkVariables(),
  checkValues(),
  await checkDatabase(),
  await checkResend(),
  await checkRazorpay(),
  await checkSite(),
];

const passed = results.every(Boolean);
console.info(passed ? "\nEverything is ready." : "\nFix the items marked FAIL. See docs/GO-LIVE.md.");
process.exitCode = passed ? 0 : 1;
