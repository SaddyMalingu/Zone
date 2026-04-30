import { NextResponse } from "next/server";
import { getEngineStatus } from "@/lib/generationEngine";

export async function GET() {
  const status = getEngineStatus();
  return NextResponse.json(status);
}
