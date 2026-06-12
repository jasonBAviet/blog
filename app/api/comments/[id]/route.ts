import { NextResponse } from "next/server";
import { getAllComments, deleteComment } from "@/lib/store";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const comments = await getAllComments();
    const exists = comments.some((c) => c.id === id);
    if (!exists) {
      return NextResponse.json({ error: "Không tìm thấy" }, { status: 404 });
    }
    await deleteComment(id);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}
