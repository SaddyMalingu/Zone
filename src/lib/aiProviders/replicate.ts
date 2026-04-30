/**
 * Replicate AI Provider
 * Supports text-to-image and text-to-video generation via the Replicate API.
 */

import type { AIModelConfig, GeneratedContent } from "@/types";

export const REPLICATE_MODELS: AIModelConfig[] = [
  {
    id: "stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b",
    name: "Stable Diffusion XL (Replicate)",
    provider: "replicate",
    type: "image",
    defaultParams: { width: 1024, height: 1024, num_inference_steps: 30 },
  },
  {
    id: "black-forest-labs/flux-schnell",
    name: "FLUX Schnell",
    provider: "replicate",
    type: "image",
    defaultParams: { width: 1024, height: 1024 },
  },
  {
    id: "lucataco/animate-diff:beecf59c4764 3684e6ce97d3e5e0e0b38d0cdbb3de92d6f64600 d53b8a30f2e",
    name: "AnimateDiff (video)",
    provider: "replicate",
    type: "video",
    defaultParams: { num_frames: 16, fps: 8 },
  },
];

export async function generateWithReplicate(
  prompt: string,
  negativePrompt: string,
  modelConfig?: AIModelConfig
): Promise<Omit<GeneratedContent, "id" | "createdAt" | "status" | "tags">> {
  const apiToken = process.env.REPLICATE_API_TOKEN;
  if (!apiToken) throw new Error("REPLICATE_API_TOKEN is not set");

  const model = modelConfig ?? REPLICATE_MODELS[Math.floor(Math.random() * REPLICATE_MODELS.length)];
  const params = model.defaultParams ?? {};

  // Start the prediction
  const startResponse = await fetch("https://api.replicate.com/v1/predictions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      version: model.id.includes(":") ? model.id.split(":")[1] : undefined,
      model: model.id.includes(":") ? undefined : model.id,
      input: {
        prompt,
        negative_prompt: negativePrompt,
        ...params,
      },
    }),
  });

  if (!startResponse.ok) {
    const err = await startResponse.text();
    throw new Error(`Replicate API error (${startResponse.status}): ${err}`);
  }

  let prediction = await startResponse.json();
  const pollUrl = prediction.urls?.get;
  if (!pollUrl) throw new Error("No poll URL returned from Replicate");

  // Poll until done
  while (prediction.status !== "succeeded" && prediction.status !== "failed") {
    await new Promise((resolve) => setTimeout(resolve, 2000));
    const pollResponse = await fetch(pollUrl, {
      headers: { Authorization: `Bearer ${apiToken}` },
    });
    prediction = await pollResponse.json();
  }

  if (prediction.status === "failed") {
    throw new Error(`Replicate generation failed: ${prediction.error}`);
  }

  const outputUrl = Array.isArray(prediction.output)
    ? prediction.output[0]
    : prediction.output;

  return {
    type: model.type,
    url: outputUrl,
    prompt,
    negativePrompt,
    provider: "replicate",
    model: model.id,
    width: (params.width as number) ?? 1024,
    height: (params.height as number) ?? 1024,
    duration: model.type === "video" ? ((params.num_frames as number) ?? 16) / ((params.fps as number) ?? 8) : undefined,
    metadata: { modelName: model.name, predictionId: prediction.id },
  };
}

export function getRandomReplicateModel(type?: "image" | "video"): AIModelConfig {
  const filtered = type ? REPLICATE_MODELS.filter((m) => m.type === type) : REPLICATE_MODELS;
  return filtered[Math.floor(Math.random() * filtered.length)];
}
