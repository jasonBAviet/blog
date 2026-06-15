import { prisma } from "@/src/config/database";

export class PostRelationshipRepository {
  async findBySource(sourceSlug: string, minScore: number = 0.0, limit: number = 6) {
    return await prisma.postRelationship.findMany({
      where: {
        sourceSlug,
        score: {
          gte: minScore,
        },
      },
      include: {
        targetPost: {
          include: {
            categoryRef: true,
            tagRefs: true,
          },
        },
      },
      orderBy: {
        score: "desc",
      },
      take: limit,
    });
  }

  async upsert(sourceSlug: string, targetSlug: string, score: number) {
    return await prisma.postRelationship.upsert({
      where: {
        sourceSlug_targetSlug: {
          sourceSlug,
          targetSlug,
        },
      },
      update: {
        score,
      },
      create: {
        sourceSlug,
        targetSlug,
        score,
      },
    });
  }

  async deleteForPost(slug: string) {
    return await prisma.postRelationship.deleteMany({
      where: {
        OR: [
          { sourceSlug: slug },
          { targetSlug: slug },
        ],
      },
    });
  }
}

export const postRelationshipRepository = new PostRelationshipRepository();
