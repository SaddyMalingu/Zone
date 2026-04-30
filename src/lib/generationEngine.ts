/**
 * Zone Generation Engine
 * Persistent loop that continuously generates AI content.
 * Can be run in-process (via API route) or as a standalone worker.
 */

import { generatePrompt } from "@/lib/promptEngine";
import { generateContent } from "@/lib/aiProviders";
import type { GenerationEngineConfig, ContentType } from "@/types";
import { v4 as uuidv4 } from "uuid";

const DEFAULT_CONFIG: GenerationEngineConfig = {
  intervalMs: Number(process.env.GENERATION_INTERVAL_MS) || 30_000,
  maxConcurrentJobs: Number(process.env.MAX_CONCURRENT_JOBS) || 2,
  defaultContentType: (process.env.DEFAULT_CONTENT_TYPE as ContentType) || "image",
  providers: [],
};

let engineTimer: NodeJS.Timeout | null = null;
let isRunning = false;
let activeJobs = 0;
let totalGenerated = 0;

export type EngineEventHandler = (event: EngineEvent) => void;

export type EngineEvent =
  | { type: "started" }
  | { type: "stopped" }
  | { type: "job_started"; jobId: string; prompt: string }
  | { type: "job_completed"; jobId: string; contentUrl: string; contentType: string }
  | { type: "job_failed"; jobId: string; error: string }
  | { type: "tick"; totalGenerated: number; activeJobs: number };

const eventHandlers: EngineEventHandler[] = [];

export function onEngineEvent(handler: EngineEventHandler) {
  eventHandlers.push(handler);
}

function emit(event: EngineEvent) {
  eventHandlers.forEach((h) => {
    try { h(event); } catch (_) {}
  });
}

async function runGenerationCycle(config: GenerationEngineConfig) {
  if (activeJobs >= config.maxConcurrentJobs) return;

  const jobId = uuidv4();
  const { prompt, negativePrompt, tags } = generatePrompt();

  activeJobs++;
  emit({ type: "job_started", jobId, prompt });

  try {
    const result = await generateContent({
      prompt,
      negativePrompt,
      contentType: config.defaultContentType,
    });

    totalGenerated++;

    emit({
      type: "job_completed",
      jobId,
      contentUrl: result.url,
      contentType: result.type,
    });
  } catch (err) {
    const error = err instanceof Error ? err.message : String(err);
    emit({ type: "job_failed", jobId, error });
    console.error(`[Zone Engine] Job ${jobId} failed: ${error}`);
  } finally {
    activeJobs--;
    emit({ type: "tick", totalGenerated, activeJobs });
  }
}

export function startEngine(config: Partial<GenerationEngineConfig> = {}) {
  if (isRunning) return;
  isRunning = true;
  const mergedConfig = { ...DEFAULT_CONFIG, ...config };

  console.log(`[Zone Engine] Starting — interval: ${mergedConfig.intervalMs}ms, max jobs: ${mergedConfig.maxConcurrentJobs}`);
  emit({ type: "started" });

  // Run immediately on start
  runGenerationCycle(mergedConfig);

  engineTimer = setInterval(() => {
    runGenerationCycle(mergedConfig);
  }, mergedConfig.intervalMs);
}

export function stopEngine() {
  if (!isRunning) return;
  isRunning = false;
  if (engineTimer) {
    clearInterval(engineTimer);
    engineTimer = null;
  }
  console.log("[Zone Engine] Stopped.");
  emit({ type: "stopped" });
}

export function getEngineStatus() {
  return { isRunning, activeJobs, totalGenerated };
}
