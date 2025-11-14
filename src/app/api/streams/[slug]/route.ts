// src/app/api/streams/[slug]/route.ts
import { NextResponse } from "next/server";

type Stream = {
  id: string;
  slug: string;
  title: string;
  league: string;
  schoolA: string;
  schoolB: string;
  startAt: string;
  status: "live" | "upcoming" | "past";
  access: "free" | "ppv" | "subscriber";
  priceUSD?: number | null;
  thumbnailUrl?: string | null;
  dacastIframeSrc?: string | null;
  dacastChannelId?: string | null;
  createdAt: string;
  updatedAt: string;
};

// Temporary mock; replace with real DB lookup later
async function getStreamBySlug(slug: string): Promise<Stream | null> {
  const mock: Stream = {
    id: "1",
    slug: "wolves-vs-tigers-2025-11-14-1900",
    title: "Wolves vs Tigers",
    league: "HS Football",
    schoolA: "Desert Ridge",
    schoolB: "Mesa East",
    startAt: "2025-11-15T02:00:00.000Z",
    status: "live",
    access: "free",
    priceUSD: null,
    thumbnailUrl: null,
    dacastIframeSrc: "https://iframe.dacast.com/live/12345/abcdef",
    dacastChannelId: "abcdef",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  if (slug === mock.slug) return mock;
  return null;
}

export async function GET(
  req: Request,
  { params }: { params: { slug: string } }
) {
  const { slug } = params;

  if (!slug) {
    return NextResponse.json(
      { error: "Missing slug" },
      { status: 400 }
    );
  }

  try {
    const stream = await getStreamBySlug(slug);

    if (!stream) {
      return NextResponse.json(
        { error: "Stream not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(stream, {
      status: 200,
      headers: {
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    console.error("Error in GET /api/streams/[slug]:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
