import { Post, Category, Comment } from "@/types";
import { mockPosts, mockCategories } from "./mock-data";

let posts: Post[] = [...mockPosts];
let categories: Category[] = [...mockCategories];
let comments: Comment[] = [];

export function getAllPosts(): Post[] {
  return [...posts].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function getPaginatedPosts(page: number, limit: number) {
  const sorted = getAllPosts();
  const total = sorted.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = (safePage - 1) * limit;
  return {
    posts: sorted.slice(start, start + limit),
    total,
    page: safePage,
    totalPages,
  };
}

export function getPostBySlug(slug: string): Post | undefined {
  return posts.find((p) => p.slug === slug);
}

export function createPost(post: Post): void {
  posts = [post, ...posts];
}

export function updatePost(slug: string, data: Partial<Post>): void {
  posts = posts.map((p) =>
    p.slug === slug ? { ...p, ...data, updatedAt: new Date().toISOString() } : p
  );
}

export function deletePost(slug: string): void {
  posts = posts.filter((p) => p.slug !== slug);
}

export function incrementViews(slug: string): void {
  posts = posts.map((p) =>
    p.slug === slug ? { ...p, views: p.views + 1 } : p
  );
}

export function getAllCategories(): Category[] {
  return [...categories];
}

export function getCategoryBySlug(slug: string): Category | undefined {
  return categories.find((c) => c.slug === slug);
}

export function createCategory(category: Category): void {
  categories.push(category);
}

export function updateCategory(slug: string, data: Partial<Category>): void {
  categories = categories.map((c) =>
    c.slug === slug ? { ...c, ...data } : c
  );
}

export function deleteCategory(slug: string): void {
  categories = categories.filter((c) => c.slug !== slug);
}

export function getAllComments(): Comment[] {
  return [...comments].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function getCommentsByPostSlug(postSlug: string): Comment[] {
  return comments
    .filter((c) => c.postSlug === postSlug)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function createComment(comment: Comment): void {
  comments.push(comment);
}

export function deleteComment(id: string): void {
  comments = comments.filter((c) => c.id !== id);
}

export function getPostsByTag(tag: string): Post[] {
  const normalizedTag = tag.toLowerCase();
  return posts.filter((p) =>
    p.tags?.some((t) => t.toLowerCase() === normalizedTag)
  );
}

export function getAllTags(): { tag: string; count: number }[] {
  const tagMap = new Map<string, number>();
  posts.forEach((p) => {
    p.tags?.forEach((t) => {
      const normalized = t.toLowerCase();
      tagMap.set(normalized, (tagMap.get(normalized) || 0) + 1);
    });
  });
  return Array.from(tagMap.entries())
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count);
}

export function incrementReaction(slug: string, type: string): Record<string, number> {
  let reactions: Record<string, number> = {};
  posts = posts.map((p) => {
    if (p.slug !== slug) return p;
    reactions = { ...(p.reactions || {}) };
    reactions[type] = (reactions[type] || 0) + 1;
    return { ...p, reactions };
  });
  return reactions;
}

export function getStats() {
  return {
    totalPosts: posts.length,
    totalViews: posts.reduce((sum, p) => sum + p.views, 0),
    totalComments: comments.length,
    totalCategories: categories.length,
    recentPosts: [...posts]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5),
    topPosts: [...posts].sort((a, b) => b.views - a.views).slice(0, 5),
  };
}
