// src/app/api/admin/streams/route.ts
import { NextResponse } from "next/server";
import { makeStreamSlug } from "@/lib/slug";
// import { db } from "@/lib/db";  // Example: plug in your actual DB client

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      title,
      league,
      schoolA,
      schoolB,
      startAt,
      access,
      priceUSD,
      thumbnailUrl,
      dacastIframeSrc,
      dacastChannelId,
    } = body;

    // Basic validation
    if (!title || !startAt || !league || !schoolA || !schoolB || !access) {
      return NextResponse.json(
        { error: "Missing required fields." },
        { status: 400 }
      );
    }

    // Generate base slug
    const baseSlug = makeStreamSlug(title, startAt, schoolA, schoolB);

    // Ensure slug uniqueness
    let slug = baseSlug;
    let suffix = 1;

    // Example DB lookup
    // while (await db.stream.findUnique({ where: { slug } })) {
    //   suffix += 1;
    //   slug = `${baseSlug}-${suffix}`;
    // }

    // Create new stream object
    const stream = {
      id: crypto.randomUUID(),
      slug,
      title,
      league,
      schoolA,
      schoolB,
      startAt,
      access,
      priceUSD: priceUSD ?? null,
      thumbnailUrl: thumbnailUrl ?? null,
      dacastIframeSrc: dacastIframeSrc ?? null,
      dacastChannelId: dacastChannelId ?? null,
      status: "upcoming",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Write to your database
    // const created = await db.stream.create({ data: stream });

    // For now, return the stream object (until the DB is connected)
    return NextResponse.json(stream, { status: 201 });
  } catch (err) {
    console.error("Error creating stream:", err);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}