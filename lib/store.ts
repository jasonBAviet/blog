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
