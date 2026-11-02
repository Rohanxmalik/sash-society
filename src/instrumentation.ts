export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { assertValidEnv } = await import("./instrumentation-node");
    assertValidEnv();
  }
}
