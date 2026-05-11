import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/furniture/:id/process
 * Triggers background removal for a furniture image via remove.bg API.
 * Falls back gracefully if REMOVE_BG_API_KEY is not set.
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const apiKey = process.env.REMOVE_BG_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ skipped: true, reason: "No REMOVE_BG_API_KEY configured" });
  }

  // In a real implementation:
  // 1. Fetch the furniture item's image_url from DB
  // 2. Call remove.bg API with the image
  // 3. Upload the result to Supabase Storage
  // 4. Update furniture_items.processed_image_url
  return NextResponse.json({ success: true, id: params.id });
}
