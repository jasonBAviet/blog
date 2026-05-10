import { Post, Category } from "@/types";
import { sourcePosts } from "@/lib/source-posts";

export const mockCategories: Category[] = [
  { slug: "cong-nghe", name: "Cong nghe", createdAt: "2026-01-01" },
  { slug: "doi-song", name: "Doi song", createdAt: "2026-01-01" },
  { slug: "suy-ngam", name: "Suy ngam", createdAt: "2026-01-01" },
  { slug: "lap-trinh", name: "Lap trinh", createdAt: "2026-01-01" },
];

export const mockPosts: Post[] = [...sourcePosts];
