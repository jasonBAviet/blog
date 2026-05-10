import { NextResponse } from "next/server";
import { getCategoryBySlug, updateCategory, deleteCategory } from "@/lib/store";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const existing = getCategoryBySlug(slug);
    if (!existing) {
      return NextResponse.json({ error: "Không tìm thấy" }, { status: 404 });
    }
    const body = await request.json();
    updateCategory(slug, body);
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
    const existing = getCategoryBySlug(slug);
    if (!existing) {
      return NextResponse.json({ error: "Không tìm thấy" }, { status: 404 });
    }
    deleteCategory(slug);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}
