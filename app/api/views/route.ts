import { NextResponse } from "next/server";
import { postService } from "@/src/modules/post/services/post.service";
import { withErrorHandler } from "@/src/core/exceptions/api-handler";
import { ValidationError } from "@/src/core/exceptions/http-error";

export const POST = withErrorHandler(async (request: Request) => {
  const { slug } = await request.json();
  if (!slug) {
    throw new ValidationError("Thiếu slug là bắt buộc");
  }
  await postService.incrementViews(slug);
  return NextResponse.json({ success: true });
});

