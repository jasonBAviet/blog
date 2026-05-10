import { NextRequest, NextResponse } from "next/server";
import { getAllComments, getCommentsByPostSlug, createComment } from "@/lib/store";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const postSlug = searchParams.get("postSlug");
    const comments = postSlug ? getCommentsByPostSlug(postSlug) : getAllComments();
    return NextResponse.json(comments);
  } catch {
    return NextResponse.json({ error: "Loi server" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { postSlug, authorName, content } = body;
    if (!postSlug || !authorName || !content) {
      return NextResponse.json({ error: "Thieu thong tin binh luan" }, { status: 400 });
    }
    createComment({
      id: `c_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
      postSlug,
      authorName,
      content,
      createdAt: new Date().toISOString(),
    });
    return NextResponse.json({ success: true }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Loi server" }, { status: 500 });
  }
}
