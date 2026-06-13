import { ValidationError } from "@/src/core/exceptions/http-error";

export interface CreateCommentDto {
  id: string;
  postSlug: string;
  authorName: string;
  content: string;
}

export function validateCreateCommentDto(data: any): CreateCommentDto {
  if (!data.id || typeof data.id !== "string") {
    throw new ValidationError("ID comment là bắt buộc và phải là chuỗi.");
  }
  if (!data.postSlug || typeof data.postSlug !== "string") {
    throw new ValidationError("Slug bài viết là bắt buộc và phải là chuỗi.");
  }
  if (!data.authorName || typeof data.authorName !== "string") {
    throw new ValidationError("Tên tác giả là bắt buộc và phải là chuỗi.");
  }
  if (!data.content || typeof data.content !== "string") {
    throw new ValidationError("Nội dung comment là bắt buộc và phải là chuỗi.");
  }
  return {
    id: data.id,
    postSlug: data.postSlug,
    authorName: data.authorName,
    content: data.content,
  };
}
