import { categoryRepository } from "../repositories/category.repository";
import { CreateCategoryDto, UpdateCategoryDto } from "../dtos/category.dto";
import { ConflictError, NotFoundError } from "@/src/core/exceptions/http-error";

export class CategoryService {
  async getAllCategories() {
    return await categoryRepository.findAll();
  }

  async getCategoryBySlug(slug: string) {
    const category = await categoryRepository.findBySlug(slug);
    if (!category) {
      throw new NotFoundError("Không tìm thấy danh mục này.");
    }
    return category;
  }

  async createCategory(data: CreateCategoryDto) {
    const existing = await categoryRepository.findBySlug(data.slug);
    if (existing) {
      throw new ConflictError("Slug danh mục đã tồn tại.");
    }
    return await categoryRepository.create(data);
  }

  async updateCategory(slug: string, data: UpdateCategoryDto) {
    // Đảm bảo category tồn tại
    await this.getCategoryBySlug(slug);
    return await categoryRepository.update(slug, data);
  }

  async deleteCategory(slug: string) {
    await this.getCategoryBySlug(slug);
    return await categoryRepository.delete(slug);
  }
}

export const categoryService = new CategoryService();
