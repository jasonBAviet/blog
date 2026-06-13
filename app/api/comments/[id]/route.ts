import { NextResponse } from "next/server";
import { commentService } from "@/src/modules/comment/services/comment.service";
import { withErrorHandler } from "@/src/core/exceptions/api-handler";

export const DELETE = withErrorHandler(async (
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params;
  await commentService.deleteComment(id);
  return NextResponse.json({ success: true });
});
