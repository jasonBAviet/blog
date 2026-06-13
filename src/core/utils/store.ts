import { Post, Category, Tag, Comment } from "@/types";
import { postService } from "@/src/modules/post/services/post.service";
import { categoryService } from "@/src/modules/category/services/category.service";
import { tagService } from "@/src/modules/tag/services/tag.service";
import { commentService } from "@/src/modules/comment/services/comment.service";
import { statService } from "@/src/modules/stat/services/stat.service";
import { NotFoundError } from "@/src/core/exceptions/http-error";

// Helpers
function parseReactions(raw: string | null): Record<string, number> | undefined {
  if (!raw) return undefined;
  try { return JSON.parse(raw); } catch { return undefined; }
}

function parseImages(raw: string | null): string[] | undefined {
  if (!raw) return undefined;
  try {
    const i = JSON.parse(raw);
    return Array.isArray(i) && i.length ? i : undefined;
  } catch { return undefined; }
}

function toPost(p: any): Post {
  return {
    slug: p.slug,
    title: p.title,
    content: p.content,
    summary: p.summary ?? undefined,
    category: p.category,
    categoryName: p.categoryRef?.name ?? undefined,
    tags: p.tagRefs?.length ? p.tagRefs.map((t: any) => t.name) : undefined,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt?.toISOString(),
    views: p.views,
    reactions: parseReactions(p.reactions),
    coverImage: p.coverImage ?? undefined,
    images: parseImages(p.images),
  };
}

// --- Posts ---
export async function getAllPosts(): Promise<Post[]> {
  const posts = await postService.getAllPosts();
  return posts.map(toPost);
}

export async function getPaginatedPosts(page: number, limit: number) {
  // Phân trang ở tầng DB (skip/take) thay vì tải toàn bộ rồi cắt trong memory
  const { posts, total, page: safePage, totalPages } = await postService.getPaginatedPosts(page, limit);
  return { posts: posts.map(toPost), total, page: safePage, totalPages };
}

export async function getPostBySlug(slug: string): Promise<Post | undefined> {
  try {
    const p = await postService.getPostBySlug(slug);
    return p ? toPost(p) : undefined;
  } catch (error) {
    // Chỉ nuốt lỗi "không tìm thấy"; lỗi hệ thống (DB...) phải ném ra để trả 500
    if (error instanceof NotFoundError) return undefined;
    throw error;
  }
}

export async function createPost(post: any): Promise<void> {
  await postService.createPost({
    slug: post.slug,
    title: post.title,
    content: post.content,
    summary: post.summary,
    category: post.category,
    tags: post.tags,
    coverImage: post.coverImage,
    images: post.images ? JSON.stringify(post.images) : undefined,
  });
}

export async function updatePost(slug: string, data: Partial<Post>): Promise<void> {
  await postService.updatePost(slug, data);
}

export async function deletePost(slug: string): Promise<void> {
  await postService.deletePost(slug);
}

export async function incrementViews(slug: string): Promise<void> {
  await postService.incrementViews(slug);
}

export async function getPostsByTag(tag: string): Promise<Post[]> {
  const posts = await postService.getPostsByTag(tag);
  return posts.map(toPost);
}

export async function incrementReaction(slug: string, type: string) {
  return await postService.incrementReaction(slug, type);
}

// --- Categories ---
export async function getAllCategories(): Promise<Category[]> {
  const cats = await categoryService.getAllCategories();
  return cats.map(c => ({ ...c, createdAt: c.createdAt.toISOString() }));
}

export async function getCategoryBySlug(slug: string): Promise<Category | undefined> {
  try {
    const c = await categoryService.getCategoryBySlug(slug);
    return c ? { ...c, createdAt: c.createdAt.toISOString() } : undefined;
  } catch { return undefined; }
}

export async function createCategory(category: Category): Promise<void> {
  await categoryService.createCategory(category);
}

export async function updateCategory(slug: string, data: Partial<Category>): Promise<void> {
  await categoryService.updateCategory(slug, { name: data.name as string });
}

export async function deleteCategory(slug: string): Promise<void> {
  await categoryService.deleteCategory(slug);
}

// --- Tags ---
export async function getAllTags() {
  return await tagService.getAllTagsWithCount();
}

export async function getAllTagsMaster() {
  const tags = await tagService.getAllTagsMaster();
  return tags.map(t => ({ ...t, createdAt: t.createdAt.toISOString() }));
}

export async function createTag(name: string) {
  const t = await tagService.createTag({ name });
  return { ...t, createdAt: t.createdAt.toISOString() };
}

export async function deleteTag(name: string): Promise<void> {
  await tagService.deleteTag(name);
}

// --- Comments ---
export async function getAllComments(): Promise<Comment[]> {
  const comments = await commentService.getAllComments();
  return comments.map(c => ({ ...c, createdAt: c.createdAt.toISOString() }));
}

export async function getCommentsByPostSlug(postSlug: string): Promise<Comment[]> {
  const comments = await commentService.getCommentsByPostSlug(postSlug);
  return comments.map(c => ({ ...c, createdAt: c.createdAt.toISOString() }));
}

export async function createComment(comment: Comment): Promise<void> {
  await commentService.createComment(comment);
}

export async function deleteComment(id: string): Promise<void> {
  await commentService.deleteComment(id);
}

// --- Stats ---
export async function getStats() {
  const stats = await statService.getStats();
  return {
    ...stats,
    recentPosts: stats.recentPosts.map(toPost),
    topPosts: stats.topPosts.map(toPost),
  };
}
