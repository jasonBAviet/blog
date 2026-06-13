import { ValidationError } from "@/src/core/exceptions/http-error";

export interface CreateCategoryDto {
  slug: string;
  name: string;
}

export interface UpdateCategoryDto {
  name: string;
}

export function validateCreateCategoryDto(data: any): CreateCategoryDto {
  if (!data.slug || typeof data.slug !== "string") {
    throw new ValidationError("Slug danh mục là bắt buộc và phải là chuỗi.");
  }
  if (!data.name || typeof data.name !== "string") {
    throw new ValidationError("Tên danh mục là bắt buộc và phải là chuỗi.");
  }
  return {
    slug: data.slug,
    name: data.name,
  };
}

export function validateUpdateCategoryDto(data: any): UpdateCategoryDto {
  if (!data.name || typeof data.name !== "string") {
    throw new ValidationError("Tên danh mục là bắt buộc và phải là chuỗi.");
  }
  return {
    name: data.name,
  };
}
