// src/app/api/admin/streams/route.ts
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  // Temporary stub implementation so Vercel build passes
  const body = await req.json().catch(() => null);

  return NextResponse.json(
    {
      message: "Admin create stream API placeholder",
      received: body,
    },
    { status: 200 }
  );
}
