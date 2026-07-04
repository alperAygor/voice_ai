export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { logEvent } = await import("./lib/monitoring/logger");
    logEvent("info", "monitoring.registered", { runtime: "nodejs" });
  }
}
