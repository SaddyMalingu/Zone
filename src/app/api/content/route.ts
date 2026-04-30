
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const limit = Math.min(Number(searchParams.get("limit") ?? 20), 100);
  const type = searchParams.get("type");

  const where = type ? { type } : {};
  const [content, total] = await Promise.all([
    prisma.content.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit,
    }),
    prisma.content.count({ where }),
  ]);

  return NextResponse.json({ content, total });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    // tags and metadata should be stringified if they are objects/arrays
    const data = {
      ...body,
      tags: typeof body.tags === "string" ? body.tags : JSON.stringify(body.tags ?? []),
      metadata: body.metadata ? (typeof body.metadata === "string" ? body.metadata : JSON.stringify(body.metadata)) : undefined,
    };
    await prisma.content.create({ data });
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ success: false, error: "Invalid body" }, { status: 400 });
  }
}
