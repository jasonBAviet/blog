import { ValidationError } from "@/src/core/exceptions/http-error";

export interface CreateTagDto {
  name: string;
}

export function validateCreateTagDto(data: any): CreateTagDto {
  if (!data.name || typeof data.name !== "string") {
    throw new ValidationError("Tên tag là bắt buộc và phải là chuỗi.");
  }
  return {
    name: data.name,
  };
}
