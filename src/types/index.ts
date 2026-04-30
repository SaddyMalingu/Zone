// Central type definitions for Zone

export type ContentType = "image" | "video";

export type AIProvider = "huggingface" | "replicate" | "openai";

export type GenerationStatus =
  | "queued"
  | "generating"
  | "completed"
  | "failed";

export interface GeneratedContent {
  id: string;
  type: ContentType;
  url: string;
  prompt: string;
  negativePrompt?: string;
  provider: AIProvider;
  model: string;
  width?: number;
  height?: number;
  duration?: number; // seconds, for video
  tags: string[];
  createdAt: Date;
  status: GenerationStatus;
  metadata?: Record<string, unknown>;
}

export interface GenerationJob {
  id: string;
  prompt: string;
  negativePrompt?: string;
  contentType: ContentType;
  provider: AIProvider;
  model: string;
  status: GenerationStatus;
  result?: GeneratedContent;
  error?: string;
  startedAt?: Date;
  completedAt?: Date;
}

export interface PromptCategory {
  name: string;
  weight: number; // higher = more likely to be chosen
  subjects: string[];
  styles: string[];
  moods: string[];
  settings: string[];
}

export interface AIModelConfig {
  id: string;
  name: string;
  provider: AIProvider;
  type: ContentType;
  endpoint?: string;
  defaultParams?: Record<string, unknown>;
}

export interface GenerationEngineConfig {
  intervalMs: number;
  maxConcurrentJobs: number;
  defaultContentType: ContentType;
  providers: AIProvider[];
}

export interface ContentFeedItem extends GeneratedContent {
  isNew?: boolean;
}
