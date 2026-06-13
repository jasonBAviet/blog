import { NextResponse } from "next/server";
import { categoryService } from "@/src/modules/category/services/category.service";
import { validateUpdateCategoryDto } from "@/src/modules/category/dtos/category.dto";
import { withErrorHandler } from "@/src/core/exceptions/api-handler";

export const PUT = withErrorHandler(async (
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) => {
  const { slug } = await params;
  const body = await request.json();
  const dto = validateUpdateCategoryDto(body);
  await categoryService.updateCategory(slug, dto);
  return NextResponse.json({ success: true });
});

export const DELETE = withErrorHandler(async (
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) => {
  const { slug } = await params;
  await categoryService.deleteCategory(slug);
  return NextResponse.json({ success: true });
});
