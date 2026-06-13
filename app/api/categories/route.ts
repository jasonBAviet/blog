import { NextResponse } from "next/server";
import { categoryService } from "@/src/modules/category/services/category.service";
import { validateCreateCategoryDto } from "@/src/modules/category/dtos/category.dto";
import { withErrorHandler } from "@/src/core/exceptions/api-handler";

export const GET = withErrorHandler(async () => {
  const categories = await categoryService.getAllCategories();
  return NextResponse.json(categories);
});

export const POST = withErrorHandler(async (request: Request) => {
  const body = await request.json();
  const dto = validateCreateCategoryDto(body);
  await categoryService.createCategory(dto);
  return NextResponse.json({ success: true }, { status: 201 });
});

