import { getEnv } from "@/backend/env";

// Stops the server at boot on bad config, rather than on the first login. Next
// only logs errors thrown from register(), so exit explicitly to fail the deploy.
export function assertValidEnv() {
  try {
    getEnv();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}
