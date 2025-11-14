// src/app/api/streams/[slug]/route.ts
import { NextResponse } from "next/server";

// ---- Mock function: Then switch to a real database query. ----
async function getStreamBySlug(slug: string) {
// This will become a DB query in the future:

// return await db.stream.findUnique({ where: { slug } });

// This is fake data for testing; let the UI run first.
  const MOCK_STREAM = {
    id: "1",
    slug: "wolves-vs-tigers-2025-11-14",
    title: "Wolves vs Tigers",
    schoolA: "Desert Ridge",
    schoolB: "Mesa East",
    league: "HS Football",
    startAt: "2025-11-14T02:00:00.000Z",
    status: "live",
    access: "free",
    priceUSD: null,
    thumbnailUrl: null,

    // Change it to the Dacast source you actually want to play
    dacastIframeSrc:
      "https://iframe.dacast.com/live/12345/abcdefg12345",
    dacastChannelId: "abcdefg12345",

    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  if (slug === MOCK_STREAM.slug) return MOCK_STREAM;
  return null;
}

// ---- GET /api/streams/[slug] ----
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
  } catch (error) {
    console.error("Error fetching stream:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
