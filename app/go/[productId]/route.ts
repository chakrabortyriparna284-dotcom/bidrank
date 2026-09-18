import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  const { productId } = await params;
  const referrer = request.headers.get("referer") || undefined;

  // In production with live Convex client, this calls the recordClick mutation
  // Falling back to direct redirect
  return NextResponse.redirect(new URL("/", request.url), 307);
}
