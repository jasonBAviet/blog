import { NextResponse } from "next/server";
import { postService } from "@/src/modules/post/services/post.service";
import { validateCreatePostDto } from "@/src/modules/post/dtos/post.dto";
import { withErrorHandler } from "@/src/core/exceptions/api-handler";
import { getAllPosts } from "@/src/core/utils/store";

export const GET = withErrorHandler(async () => {
  // Trả về Post đã map (tags, categoryName, reactions...) đúng contract như client mong đợi
  const posts = await getAllPosts();
  return NextResponse.json(posts);
});

export const POST = withErrorHandler(async (request: Request) => {
  const body = await request.json();
  
  // Validate DTO
  const dto = validateCreatePostDto(body);

  // Call Service
  const newPost = await postService.createPost(dto);

  return NextResponse.json({ success: true, slug: newPost.slug }, { status: 201 });
});

