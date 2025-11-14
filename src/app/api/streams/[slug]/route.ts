// src/app/api/streams/[slug]/route.ts
import { NextResponse } from 'next/server';

export async function GET(req: Request, context: any) {
  return NextResponse.json({
    ok: true,
    message: 'temporary placeholder for /api/streams/[slug]',
  });
}
