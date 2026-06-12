import { NextRequest, NextResponse } from "next/server";
import { incrementReaction } from "@/lib/store";

const VALID_TYPES = new Set(["like", "love", "insightful", "appreciate"]);

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { slug, type } = body || {};

  if (!slug || !type) {
    return NextResponse.json({ error: "Thieu slug hoac type" }, { status: 400 });
  }

  if (!VALID_TYPES.has(type)) {
    return NextResponse.json({ error: "Loai reaction khong hop le" }, { status: 400 });
  }

  const reactions = await incrementReaction(slug, type);
  return NextResponse.json({ reactions });
}
