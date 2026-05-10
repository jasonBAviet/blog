import { NextResponse } from "next/server";
import { incrementViews } from "@/lib/store";

export async function POST(request: Request) {
  try {
    const { slug } = await request.json();
    if (!slug) {
      return NextResponse.json({ error: "Thieu slug" }, { status: 400 });
    }
    incrementViews(slug);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Loi server" }, { status: 500 });
  }
}
