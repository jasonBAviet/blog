import { NextResponse } from "next/server";
import { getPostBySlug, updatePost, deletePost } from "@/lib/store";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const post = await getPostBySlug(slug);
    if (!post) {
      return NextResponse.json({ error: "Không tìm thấy" }, { status: 404 });
    }
    return NextResponse.json(post);
  } catch {
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const existing = await getPostBySlug(slug);
    if (!existing) {
      return NextResponse.json({ error: "Không tìm thấy" }, { status: 404 });
    }
    const body = await request.json();
    await updatePost(slug, body);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const existing = await getPostBySlug(slug);
    if (!existing) {
      return NextResponse.json({ error: "Không tìm thấy" }, { status: 404 });
    }
    await deletePost(slug);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}
