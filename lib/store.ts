import { Post, Category, Tag, Comment } from "@/types";
import { prisma } from "@/lib/db";
import type {
  Post as PrismaPost,
  Comment as PrismaComment,
  Category as PrismaCategory,
  Tag as PrismaTag,
} from "@prisma/client";

// --- Types ---

type PostWithRelations = PrismaPost & {
  categoryRef: PrismaCategory;
  tagRefs: PrismaTag[];
};

const POST_INCLUDE = { categoryRef: true, tagRefs: true } as const;

// --- JSON helpers ---

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

function toPost(p: PostWithRelations): Post {
  return {
    slug: p.slug,
    title: p.title,
    content: p.content,
    summary: p.summary ?? undefined,
    category: p.category,
    categoryName: p.categoryRef?.name ?? undefined,
    tags: p.tagRefs.length ? p.tagRefs.map((t) => t.name) : undefined,
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

function toTag(t: PrismaTag): Tag {
  return {
    name: t.name,
    createdAt: t.createdAt.toISOString(),
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

// --- Tag upsert helper ---

async function upsertTags(names: string[]): Promise<void> {
  if (!names.length) return;
  await Promise.all(
    names.map((name) =>
      prisma.tag.upsert({ where: { name }, update: {}, create: { name } })
    )
  );
}

// --- Posts ---

export async function getAllPosts(): Promise<Post[]> {
  const rows = await prisma.post.findMany({
    include: POST_INCLUDE,
    orderBy: { createdAt: "desc" },
  });
  return rows.map(toPost);
}

export async function getPaginatedPosts(page: number, limit: number) {
  const [total, rows] = await Promise.all([
    prisma.post.count(),
    prisma.post.findMany({
      include: POST_INCLUDE,
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
  const p = await prisma.post.findUnique({ where: { slug }, include: POST_INCLUDE });
  return p ? toPost(p) : undefined;
}

export async function createPost(post: Omit<Post, "views"> & { views?: number }): Promise<void> {
  const tagNames = post.tags ?? [];
  await upsertTags(tagNames);

  await prisma.post.create({
    data: {
      slug: post.slug,
      title: post.title,
      content: post.content,
      summary: post.summary ?? null,
      category: post.category,
      createdAt: new Date(post.createdAt),
      views: post.views ?? 0,
      reactions: post.reactions ? JSON.stringify(post.reactions) : null,
      coverImage: post.coverImage ?? null,
      images: post.images ? JSON.stringify(post.images) : null,
      tagRefs: tagNames.length ? { connect: tagNames.map((name) => ({ name })) } : undefined,
    },
  });
}

export async function updatePost(slug: string, data: Partial<Post>): Promise<void> {
  if (data.tags !== undefined) {
    await upsertTags(data.tags);
  }

  await prisma.post.update({
    where: { slug },
    data: {
      ...(data.title !== undefined && { title: data.title }),
      ...(data.content !== undefined && { content: data.content }),
      ...(data.summary !== undefined && { summary: data.summary }),
      ...(data.category !== undefined && { category: data.category }),
      ...(data.coverImage !== undefined && { coverImage: data.coverImage }),
      ...(data.images !== undefined && { images: JSON.stringify(data.images) }),
      ...(data.tags !== undefined && {
        tagRefs: { set: data.tags.map((name) => ({ name })) },
      }),
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
  const rows = await prisma.post.findMany({
    where: { tagRefs: { some: { name: { equals: tag, mode: "insensitive" } } } },
    include: POST_INCLUDE,
    orderBy: { createdAt: "desc" },
  });
  return rows.map(toPost);
}

export async function getAllTags(): Promise<{ tag: string; count: number }[]> {
  const tags = await prisma.tag.findMany({
    where: { posts: { some: {} } },
    include: { _count: { select: { posts: true } } },
    orderBy: { posts: { _count: "desc" } },
  });
  return tags.map((t) => ({ tag: t.name, count: t._count.posts }));
}

export async function incrementReaction(
  slug: string,
  type: string
): Promise<Record<string, number>> {
  const p = await prisma.post.findUnique({ where: { slug }, select: { reactions: true } });
  const reactions = parseReactions(p?.reactions ?? null) ?? {};
  reactions[type] = (reactions[type] ?? 0) + 1;
  await prisma.post.update({ where: { slug }, data: { reactions: JSON.stringify(reactions) } });
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
    data: { ...(data.name !== undefined && { name: data.name }) },
  });
}

export async function deleteCategory(slug: string): Promise<void> {
  await prisma.category.delete({ where: { slug } });
}

// --- Tags master data ---

export async function getAllTagsMaster(): Promise<Tag[]> {
  const rows = await prisma.tag.findMany({ orderBy: { name: "asc" } });
  return rows.map(toTag);
}

export async function createTag(name: string): Promise<Tag> {
  const t = await prisma.tag.upsert({
    where: { name },
    update: {},
    create: { name },
  });
  return toTag(t);
}

export async function deleteTag(name: string): Promise<void> {
  await prisma.tag.delete({ where: { name } });
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
      prisma.post.findMany({
        include: POST_INCLUDE,
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
      prisma.post.findMany({
        include: POST_INCLUDE,
        orderBy: { views: "desc" },
        take: 5,
      }),
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
