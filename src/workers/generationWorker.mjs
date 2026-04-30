/**
 * Zone Generation Worker
 * Standalone Node.js script that runs the generation engine persistently.
 * Run with: node src/workers/generationWorker.mjs
 * Or use: npm run engine:start
 */

import { startEngine, onEngineEvent } from "../lib/generationEngine.js";

console.log("╔══════════════════════════════╗");
console.log("║   Zone Generation Engine     ║");
console.log("╚══════════════════════════════╝");
console.log("");

onEngineEvent((event) => {
  const ts = new Date().toISOString();
  switch (event.type) {
    case "started":
      console.log(`[${ts}] ✓ Engine started`);
      break;
    case "job_started":
      console.log(`[${ts}] ⚡ Job ${event.jobId.slice(0, 8)} | ${event.prompt.slice(0, 60)}...`);
      break;
    case "job_completed":
      console.log(`[${ts}] ✓ Job ${event.jobId.slice(0, 8)} completed [${event.contentType}]`);
      break;
    case "job_failed":
      console.error(`[${ts}] ✗ Job ${event.jobId.slice(0, 8)} FAILED: ${event.error}`);
      break;
    case "tick":
      console.log(`[${ts}] ↻ Tick | Total: ${event.totalGenerated} | Active: ${event.activeJobs}`);
      break;
  }
});

startEngine();

// Graceful shutdown
process.on("SIGINT", () => {
  console.log("\n[Zone Engine] Shutting down...");
  process.exit(0);
});
process.on("SIGTERM", () => {
  process.exit(0);
});
