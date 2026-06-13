import { prisma } from "@/src/config/database";

export class StatService {
  async getStats() {
    const POST_INCLUDE = { categoryRef: true, tagRefs: true } as const;

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
      recentPosts: recentRows,
      topPosts: topRows,
    };
  }
}

export const statService = new StatService();
