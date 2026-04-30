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
];

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
