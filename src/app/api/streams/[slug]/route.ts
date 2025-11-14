import { NextRequest, NextResponse } from 'next/server';

type RouteContext = {
  params: {
    slug: string;
  };
};

export async function GET(req: NextRequest, { params }: RouteContext) {
  const { slug } = params;

  return NextResponse.json({
    message: 'OK',
    slug,
  });
}
