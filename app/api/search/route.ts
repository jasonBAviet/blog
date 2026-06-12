import { NextRequest, NextResponse } from "next/server";
import { searchPosts } from "@/lib/search";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") || "";

  if (q.trim().length < 2) {
    return NextResponse.json({ results: [], total: 0 });
  }

  const results = await searchPosts(q);
  return NextResponse.json({ results, total: results.length });
}
