import { Post, Category } from "@/types";
import { sourcePosts } from "@/src/core/utils/source-posts";

export const mockCategories: Category[] = [
  { slug: "cong-nghe", name: "Công nghệ", createdAt: "2026-01-01" },
  { slug: "doi-song", name: "Đời sống", createdAt: "2026-01-01" },
  { slug: "suy-ngam", name: "Suy ngẫm", createdAt: "2026-01-01" },
  { slug: "lap-trinh", name: "Lập trình", createdAt: "2026-01-01" },
];

export const mockPosts: Post[] = [...sourcePosts];
