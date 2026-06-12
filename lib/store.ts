import { Post, Category, Comment } from "@/types";
import { prisma } from "@/lib/db";
import type { Post as PrismaPost, Comment as PrismaComment, Category as PrismaCategory } from "@prisma/client";

// --- JSON helpers ---

function parseTags(raw: string | null): string[] | undefined {
  if (!raw) return undefined;
  try {
    const t = JSON.parse(raw);
    return Array.isArray(t) && t.length ? t : undefined;
  } catch {
    return undefined;
  }
}

function parseReactions(raw: string | null): Record<string, number> | undefined {
  if (!raw) return undefined;
  try {
    return JSON.parse(raw) as Record<string, number>;
  } catch {
    return undefined;
  }
}

function parseImages(raw: string | null): string[] | undefined {
  if (!raw) return undefined;
  try {
    const i = JSON.parse(raw);
    return Array.isArray(i) && i.length ? i : undefined;
  } catch {
    return undefined;
  }
}

function toPost(p: PrismaPost): Post {
  return {
    slug: p.slug,
    title: p.title,
    content: p.content,
    category: p.category,
    categoryName: p.categoryName ?? undefined,
    tags: parseTags(p.tags),
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt?.toISOString(),
    views: p.views,
    reactions: parseReactions(p.reactions),
    coverImage: p.coverImage ?? undefined,
    images: parseImages(p.images),
  };
}

function toCategory(c: PrismaCategory): Category {
  return {
    slug: c.slug,
    name: c.name,
    createdAt: c.createdAt.toISOString(),
  };
}

function toComment(c: PrismaComment): Comment {
  return {
    id: c.id,
    postSlug: c.postSlug,
    authorName: c.authorName,
    content: c.content,
    createdAt: c.createdAt.toISOString(),
  };
}

// --- Posts ---

export async function getAllPosts(): Promise<Post[]> {
  const rows = await prisma.post.findMany({ orderBy: { createdAt: "desc" } });
  return rows.map(toPost);
}

export async function getPaginatedPosts(page: number, limit: number) {
  const [total, rows] = await Promise.all([
    prisma.post.count(),
    prisma.post.findMany({
      orderBy: { createdAt: "desc" },
      skip: (Math.max(1, page) - 1) * limit,
      take: limit,
    }),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const safePage = Math.min(Math.max(1, page), totalPages);
  return { posts: rows.map(toPost), total, page: safePage, totalPages };
}

export async function getPostBySlug(slug: string): Promise<Post | undefined> {
  const p = await prisma.post.findUnique({ where: { slug } });
  return p ? toPost(p) : undefined;
}

export async function createPost(post: Omit<Post, "views"> & { views?: number }): Promise<void> {
  await prisma.post.create({
    data: {
      slug: post.slug,
      title: post.title,
      content: post.content,
      category: post.category,
      categoryName: post.categoryName ?? null,
      tags: post.tags ? JSON.stringify(post.tags) : null,
      createdAt: new Date(post.createdAt),
      views: post.views ?? 0,
      reactions: post.reactions ? JSON.stringify(post.reactions) : null,
      coverImage: post.coverImage ?? null,
      images: post.images ? JSON.stringify(post.images) : null,
    },
  });
}

export async function updatePost(slug: string, data: Partial<Post>): Promise<void> {
  await prisma.post.update({
    where: { slug },
    data: {
      ...(data.title !== undefined && { title: data.title }),
      ...(data.content !== undefined && { content: data.content }),
      ...(data.category !== undefined && { category: data.category }),
      ...(data.categoryName !== undefined && { categoryName: data.categoryName }),
      ...(data.tags !== undefined && { tags: JSON.stringify(data.tags) }),
      ...(data.coverImage !== undefined && { coverImage: data.coverImage }),
      ...(data.images !== undefined && { images: JSON.stringify(data.images) }),
      updatedAt: new Date(),
    },
  });
}

export async function deletePost(slug: string): Promise<void> {
  await prisma.post.delete({ where: { slug } });
}

export async function incrementViews(slug: string): Promise<void> {
  await prisma.post.update({
    where: { slug },
    data: { views: { increment: 1 } },
  });
}

export async function getPostsByTag(tag: string): Promise<Post[]> {
  const rows = await prisma.post.findMany({ orderBy: { createdAt: "desc" } });
  const norm = tag.toLowerCase();
  return rows.map(toPost).filter((p) => p.tags?.some((t) => t.toLowerCase() === norm));
}

export async function getAllTags(): Promise<{ tag: string; count: number }[]> {
  const rows = await prisma.post.findMany({ select: { tags: true } });
  const tagMap = new Map<string, number>();
  for (const row of rows) {
    const tags = parseTags(row.tags) ?? [];
    for (const t of tags) {
      const norm = t.toLowerCase();
      tagMap.set(norm, (tagMap.get(norm) ?? 0) + 1);
    }
  }
  return Array.from(tagMap.entries())
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count);
}

export async function incrementReaction(slug: string, type: string): Promise<Record<string, number>> {
  const p = await prisma.post.findUnique({ where: { slug }, select: { reactions: true } });
  const reactions = parseReactions(p?.reactions ?? null) ?? {};
  reactions[type] = (reactions[type] ?? 0) + 1;
  await prisma.post.update({
    where: { slug },
    data: { reactions: JSON.stringify(reactions) },
  });
  return reactions;
}

// --- Categories ---

export async function getAllCategories(): Promise<Category[]> {
  const rows = await prisma.category.findMany({ orderBy: { createdAt: "asc" } });
  return rows.map(toCategory);
}

export async function getCategoryBySlug(slug: string): Promise<Category | undefined> {
  const c = await prisma.category.findUnique({ where: { slug } });
  return c ? toCategory(c) : undefined;
}

export async function createCategory(category: Category): Promise<void> {
  await prisma.category.create({
    data: {
      slug: category.slug,
      name: category.name,
      createdAt: new Date(category.createdAt),
    },
  });
}

export async function updateCategory(slug: string, data: Partial<Category>): Promise<void> {
  await prisma.category.update({
    where: { slug },
    data: {
      ...(data.name !== undefined && { name: data.name }),
    },
  });
}

export async function deleteCategory(slug: string): Promise<void> {
  await prisma.category.delete({ where: { slug } });
}

// --- Comments ---

export async function getAllComments(): Promise<Comment[]> {
  const rows = await prisma.comment.findMany({ orderBy: { createdAt: "desc" } });
  return rows.map(toComment);
}

export async function getCommentsByPostSlug(postSlug: string): Promise<Comment[]> {
  const rows = await prisma.comment.findMany({
    where: { postSlug },
    orderBy: { createdAt: "desc" },
  });
  return rows.map(toComment);
}

export async function createComment(comment: Comment): Promise<void> {
  await prisma.comment.create({
    data: {
      id: comment.id,
      postSlug: comment.postSlug,
      authorName: comment.authorName,
      content: comment.content,
      createdAt: new Date(comment.createdAt),
    },
  });
}

export async function deleteComment(id: string): Promise<void> {
  await prisma.comment.delete({ where: { id } });
}

// --- Stats ---

export async function getStats() {
  const [totalPosts, totalComments, totalCategories, viewAgg, recentRows, topRows] =
    await Promise.all([
      prisma.post.count(),
      prisma.comment.count(),
      prisma.category.count(),
      prisma.post.aggregate({ _sum: { views: true } }),
      prisma.post.findMany({ orderBy: { createdAt: "desc" }, take: 5 }),
      prisma.post.findMany({ orderBy: { views: "desc" }, take: 5 }),
    ]);
  return {
    totalPosts,
    totalViews: viewAgg._sum.views ?? 0,
    totalComments,
    totalCategories,
    recentPosts: recentRows.map(toPost),
    topPosts: topRows.map(toPost),
  };
}
