/**
 * AI Provider Router
 * Selects a provider and dispatches generation requests.
 */

import type { AIProvider, ContentType, GeneratedContent } from "@/types";
import { generateImageHuggingFace } from "./huggingface";
import { generateWithReplicate } from "./replicate";

export type GenerateParams = {
  prompt: string;
  negativePrompt: string;
  provider?: AIProvider;
  contentType?: ContentType;
};

export async function generateContent(
  params: GenerateParams
): Promise<Omit<GeneratedContent, "id" | "createdAt" | "status" | "tags">> {
  const { prompt, negativePrompt, provider, contentType = "image" } = params;

  // Auto-select provider based on availability
  const resolvedProvider = provider ?? selectProvider(contentType);

  switch (resolvedProvider) {
    case "huggingface":
      return generateImageHuggingFace(prompt, negativePrompt);
    case "replicate":
      return generateWithReplicate(prompt, negativePrompt);
    default:
      throw new Error(`Unknown provider: ${resolvedProvider}`);
  }
}

function selectProvider(contentType: ContentType): AIProvider {
  const hfAvailable = !!process.env.HUGGINGFACE_API_KEY;
  const replicateAvailable = !!process.env.REPLICATE_API_TOKEN;

  // For video, prefer Replicate
  if (contentType === "video") {
    if (replicateAvailable) return "replicate";
    throw new Error("No provider available for video generation");
  }

  // For images, randomly pick from available providers
  const available: AIProvider[] = [];
  if (hfAvailable) available.push("huggingface");
  if (replicateAvailable) available.push("replicate");

  if (available.length === 0) {
    throw new Error("No AI provider API keys are configured. Set HUGGINGFACE_API_KEY or REPLICATE_API_TOKEN in .env.local");
  }

  return available[Math.floor(Math.random() * available.length)];
}

export { generateImageHuggingFace, generateWithReplicate };
