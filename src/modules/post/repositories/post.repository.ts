import { prisma } from "@/src/config/database";
import { CreatePostDto, UpdatePostDto } from "../dtos/post.dto";

export class PostRepository {
  async findAll() {
    return await prisma.post.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        categoryRef: true,
        tagRefs: true,
      },
    });
  }

  async count() {
    return await prisma.post.count();
  }

  async findPaginated(skip: number, take: number) {
    return await prisma.post.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        categoryRef: true,
        tagRefs: true,
      },
      skip,
      take,
    });
  }

  async countExcluding(excludeSlugs: string[]) {
    return await prisma.post.count({
      where: excludeSlugs.length ? { slug: { notIn: excludeSlugs } } : undefined,
    });
  }

  async findPaginatedExcluding(skip: number, take: number, excludeSlugs: string[]) {
    return await prisma.post.findMany({
      where: excludeSlugs.length ? { slug: { notIn: excludeSlugs } } : undefined,
      orderBy: { createdAt: "desc" },
      include: { categoryRef: true, tagRefs: true },
      skip,
      take,
    });
  }

  async findBySlugs(slugs: string[]) {
    if (!slugs.length) return [];
    return await prisma.post.findMany({
      where: { slug: { in: slugs } },
      orderBy: { createdAt: "desc" },
      include: { categoryRef: true, tagRefs: true },
    });
  }

  async findBySlug(slug: string) {
    return await prisma.post.findUnique({
      where: { slug },
      include: {
        categoryRef: true,
        tagRefs: true,
        comments: {
          orderBy: { createdAt: "desc" },
        },
      },
    });
  }

  async create(data: CreatePostDto) {
    return await prisma.post.create({
      data: {
        slug: data.slug,
        title: data.title,
        content: data.content,
        summary: data.summary,
        category: data.category,
        coverImage: data.coverImage,
        images: data.images,
        source: data.source || "manual",
        sourceUrl: data.sourceUrl,
        // Connect or create tags
        tagRefs: data.tags?.length
          ? {
              connectOrCreate: data.tags.map((tag) => ({
                where: { name: tag },
                create: { name: tag },
              })),
            }
          : undefined,
      },
    });
  }

  async update(slug: string, data: any) {
    return await prisma.post.update({
      where: { slug },
      data,
    });
  }

  // Chuyển UpdatePostDto thành payload Prisma (xử lý tags + images JSON).
  buildUpdateData(data: UpdatePostDto) {
    const payload: any = { updatedAt: new Date() };

    if (data.title !== undefined) payload.title = data.title;
    if (data.content !== undefined) payload.content = data.content;
    if (data.summary !== undefined) payload.summary = data.summary;
    if (data.category !== undefined) payload.category = data.category;
    if (data.coverImage !== undefined) payload.coverImage = data.coverImage;

    if (data.images !== undefined) {
      payload.images =
        data.images == null
          ? null
          : typeof data.images === "string"
            ? data.images
            : JSON.stringify(data.images);
    }

    if (data.tags !== undefined) {
      const names = Array.isArray(data.tags) ? data.tags : [];
      payload.tagRefs = {
        set: [],
        connectOrCreate: names.map((name) => ({
          where: { name },
          create: { name },
        })),
      };
    }

    return payload;
  }

  async delete(slug: string) {
    return await prisma.post.delete({ where: { slug } });
  }

  async incrementViews(slug: string) {
    return await prisma.post.update({
      where: { slug },
      data: { views: { increment: 1 } },
    });
  }

  async findByTag(tag: string) {
    return await prisma.post.findMany({
      where: { tagRefs: { some: { name: { equals: tag, mode: "insensitive" } } } },
      include: {
        categoryRef: true,
        tagRefs: true,
      },
      orderBy: { createdAt: "desc" },
    });
  }
}

export const postRepository = new PostRepository();
