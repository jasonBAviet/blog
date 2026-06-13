import { NextRequest, NextResponse } from "next/server";
import { postService } from "@/src/modules/post/services/post.service";
import { withErrorHandler } from "@/src/core/exceptions/api-handler";
import { ValidationError } from "@/src/core/exceptions/http-error";

const VALID_TYPES = new Set(["like", "love", "insightful", "appreciate"]);

export const POST = withErrorHandler(async (request: NextRequest) => {
  const body = await request.json();
  const { slug, type } = body || {};

  if (!slug || !type) {
    throw new ValidationError("Thiếu slug hoặc type là bắt buộc");
  }

  if (!VALID_TYPES.has(type)) {
    throw new ValidationError("Loại reaction không hợp lệ");
  }

  const reactions = await postService.incrementReaction(slug, type);
  return NextResponse.json({ reactions });
});

