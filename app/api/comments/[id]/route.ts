import { NextResponse } from "next/server";
import { getAllComments, deleteComment } from "@/lib/store";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const comments = getAllComments();
    const exists = comments.some((c) => c.id === id);
    if (!exists) {
      return NextResponse.json({ error: "Khong tim thay" }, { status: 404 });
    }
    deleteComment(id);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Loi server" }, { status: 500 });
  }
}
