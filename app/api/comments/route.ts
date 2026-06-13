import { NextRequest, NextResponse } from "next/server";
import { commentService } from "@/src/modules/comment/services/comment.service";
import { validateCreateCommentDto } from "@/src/modules/comment/dtos/comment.dto";
import { withErrorHandler } from "@/src/core/exceptions/api-handler";

export const GET = withErrorHandler(async (request: NextRequest) => {
  const { searchParams } = new URL(request.url);
  const postSlug = searchParams.get("postSlug");
  const comments = postSlug
    ? await commentService.getCommentsByPostSlug(postSlug)
    : await commentService.getAllComments();
  return NextResponse.json(comments);
});

export const POST = withErrorHandler(async (request: Request) => {
  const body = await request.json();

  // ID luôn do server sinh, không tin id từ client (tránh trùng/chèn khóa chính)
  body.id = `c_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

  const dto = validateCreateCommentDto(body);

  await commentService.createComment(dto);
  return NextResponse.json({ success: true }, { status: 201 });
});

