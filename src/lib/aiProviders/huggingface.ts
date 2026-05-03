/**
 * Hugging Face AI Provider
 * Supports text-to-image generation via the Inference API.
 */

import type { AIModelConfig, GeneratedContent } from "@/types";
import { v4 as uuidv4 } from "uuid";

const HF_API_URL = "https://api-inference.huggingface.co/models";

export const HF_MODELS: AIModelConfig[] = [
  {
    id: "stabilityai/stable-diffusion-xl-base-1.0",
    name: "Stable Diffusion XL",
    provider: "huggingface",
    type: "image",
    defaultParams: { width: 1024, height: 1024, num_inference_steps: 30 },
  },
  {
    id: "runwayml/stable-diffusion-v1-5",
    name: "Stable Diffusion 1.5",
    provider: "huggingface",
    type: "image",
    defaultParams: { width: 512, height: 512, num_inference_steps: 25 },
  },
  {
    id: "prompthero/openjourney-v4",
    name: "OpenJourney v4",
    provider: "huggingface",
    type: "image",
    defaultParams: { width: 512, height: 512, num_inference_steps: 25 },
  },
  {
    id: "dreamlike-art/dreamlike-diffusion-1.0",
    name: "Dreamlike Diffusion",
    provider: "huggingface",
    type: "image",
    defaultParams: { width: 768, height: 768, num_inference_steps: 30 },
  },
  // Free Hugging Face video models
  {
    id: "Lightricks/LTX-2.3",
    name: "LTX-2.3 (Text-to-Video)",
    provider: "huggingface",
    type: "video",
    defaultParams: { fps: 8, num_frames: 16 },
  },
  {
    id: "Motif-Technologies/Motif-Video-2B",
    name: "Motif-Video-2B (Text-to-Video)",
    provider: "huggingface",
    type: "video",
    defaultParams: { fps: 8, num_frames: 16 },
  },
  {
    id: "Wan-AI/Wan2.2-Turbo",
    name: "Wan2.2-Turbo (Text-to-Video)",
    provider: "huggingface",
    type: "video",
    defaultParams: { fps: 8, num_frames: 16 },
  },
];
// Video generation via Hugging Face Inference API
export async function generateVideoHuggingFace(
  prompt: string,
  negativePrompt: string = "",
  modelConfig?: AIModelConfig
): Promise<Omit<GeneratedContent, "id" | "createdAt" | "status" | "tags">> {
  const apiKey = process.env.HUGGINGFACE_API_KEY;
  if (!apiKey) throw new Error("HUGGINGFACE_API_KEY is not set");

  // Pick a video model if not specified
  const videoModels = HF_MODELS.filter((m) => m.type === "video");
  const model = modelConfig && modelConfig.type === "video"
    ? modelConfig
    : videoModels[Math.floor(Math.random() * videoModels.length)];
  const params = model.defaultParams ?? {};

  const response = await fetch(`${HF_API_URL}/${model.id}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      inputs: prompt,
      parameters: {
        negative_prompt: negativePrompt,
        ...params,
      },
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`HuggingFace API error (${response.status}): ${err}`);
  }

  // The response is a video file (mp4/gif/webm)
  const blob = await response.blob();
  const arrayBuffer = await blob.arrayBuffer();
  const base64 = Buffer.from(arrayBuffer).toString("base64");
  // Try to detect content type (default to mp4)
  const contentType = response.headers.get("content-type") || "video/mp4";
  const dataUrl = `data:${contentType};base64,${base64}`;

  return {
    type: "video",
    url: dataUrl,
    prompt,
    negativePrompt,
    provider: "huggingface",
    model: model.id,
    width: (params.width as number) ?? undefined,
    height: (params.height as number) ?? undefined,
    duration: (params.num_frames as number && params.fps as number)
      ? (params.num_frames as number) / (params.fps as number)
      : undefined,
    metadata: { modelName: model.name },
  };
}

export async function generateImageHuggingFace(
  prompt: string,
  negativePrompt: string,
  modelConfig?: AIModelConfig
): Promise<Omit<GeneratedContent, "id" | "createdAt" | "status" | "tags">> {
  const apiKey = process.env.HUGGINGFACE_API_KEY;
  if (!apiKey) throw new Error("HUGGINGFACE_API_KEY is not set");

  const model = modelConfig ?? HF_MODELS[Math.floor(Math.random() * HF_MODELS.length)];
  const params = model.defaultParams ?? {};

  const response = await fetch(`${HF_API_URL}/${model.id}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      inputs: prompt,
      parameters: {
        negative_prompt: negativePrompt,
        ...params,
      },
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`HuggingFace API error (${response.status}): ${err}`);
  }

  const blob = await response.blob();
  const arrayBuffer = await blob.arrayBuffer();
  const base64 = Buffer.from(arrayBuffer).toString("base64");
  const dataUrl = `data:image/jpeg;base64,${base64}`;

  return {
    type: "image",
    url: dataUrl,
    prompt,
    negativePrompt,
    provider: "huggingface",
    model: model.id,
    width: (params.width as number) ?? 512,
    height: (params.height as number) ?? 512,
    metadata: { modelName: model.name },
  };
}

export function getRandomHFModel(): AIModelConfig {
  return HF_MODELS[Math.floor(Math.random() * HF_MODELS.length)];
}
