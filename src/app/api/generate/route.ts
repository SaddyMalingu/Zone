import { NextResponse } from "next/server";
import { generateContent } from "@/lib/aiProviders";
import { generatePrompt } from "@/lib/promptEngine";
import { v4 as uuidv4 } from "uuid";
import type { GeneratedContent } from "@/types";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { prompt: customPrompt, contentType = "image" } = body;

    const { prompt, negativePrompt, tags } = customPrompt
      ? { prompt: customPrompt, negativePrompt: "", tags: [] }
      : generatePrompt();

    const result = await generateContent({ prompt, negativePrompt, contentType });

    const content: GeneratedContent = {
      id: uuidv4(),
      ...result,
      tags,
      createdAt: new Date(),
      status: "completed",
    };

    return NextResponse.json({ success: true, content });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Generation failed";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function GET() {
  const { prompt, negativePrompt, tags } = generatePrompt();
  return NextResponse.json({ prompt, negativePrompt, tags });
}
