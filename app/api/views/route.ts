import { NextResponse } from "next/server";
import { incrementViews } from "@/lib/store";

export async function POST(request: Request) {
  try {
    const { slug } = await request.json();
    if (!slug) {
      return NextResponse.json({ error: "Thiếu slug" }, { status: 400 });
    }
    await incrementViews(slug);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}
