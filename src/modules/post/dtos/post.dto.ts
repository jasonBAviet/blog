import { ValidationError } from "@/src/core/exceptions/http-error";

export interface CreatePostDto {
  slug: string;
  title: string;
  content: string;
  summary?: string;
  category: string;
  tags?: string[];
  coverImage?: string;
  images?: string;
  source?: string;
  sourceUrl?: string;
}

export interface UpdatePostDto {
  title?: string;
  content?: string;
  summary?: string;
  category?: string;
  coverImage?: string;
  images?: string[] | string | null;
  tags?: string[] | null;
}

export function validateCreatePostDto(data: any): CreatePostDto {
  if (!data.slug || typeof data.slug !== "string") {
    throw new ValidationError("Slug là bắt buộc và phải là chuỗi hợp lệ.");
  }
  if (!data.title || typeof data.title !== "string") {
    throw new ValidationError("Title là bắt buộc và phải là chuỗi hợp lệ.");
  }
  if (!data.content || typeof data.content !== "string") {
    throw new ValidationError("Content là bắt buộc và phải là chuỗi hợp lệ.");
  }
  if (!data.category || typeof data.category !== "string") {
    throw new ValidationError("Category là bắt buộc và phải là chuỗi hợp lệ.");
  }

  return {
    slug: data.slug,
    title: data.title,
    content: data.content,
    summary: data.summary,
    category: data.category,
    tags: Array.isArray(data.tags) ? data.tags : undefined,
    coverImage: data.coverImage,
    images: data.images,
    source: data.source,
    sourceUrl: data.sourceUrl,
  };
}
