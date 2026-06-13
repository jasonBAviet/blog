import { prisma } from "@/src/config/database";
import { CreateCategoryDto, UpdateCategoryDto } from "../dtos/category.dto";

export class CategoryRepository {
  async findAll() {
    return await prisma.category.findMany({
      orderBy: { createdAt: "asc" },
    });
  }

  async findBySlug(slug: string) {
    return await prisma.category.findUnique({
      where: { slug },
    });
  }

  async create(data: CreateCategoryDto) {
    return await prisma.category.create({
      data: {
        slug: data.slug,
        name: data.name,
        createdAt: new Date(),
      },
    });
  }

  async update(slug: string, data: UpdateCategoryDto) {
    return await prisma.category.update({
      where: { slug },
      data: { name: data.name },
    });
  }

  async delete(slug: string) {
    return await prisma.category.delete({
      where: { slug },
    });
  }
}

export const categoryRepository = new CategoryRepository();
