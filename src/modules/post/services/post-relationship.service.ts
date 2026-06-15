import { postRepository } from "../repositories/post.repository";
import { postRelationshipRepository } from "../repositories/post-relationship.repository";
import { prisma } from "@/src/config/database";

export class PostRelationshipService {
  /**
   * Tính toán và lưu mối quan hệ giữa tất cả các cặp bài viết trong database.
   */
  async calculateAllRelationships() {
    const posts = await postRepository.findAll();
    const tags = await prisma.tag.findMany({
      include: {
        parent: true,
      },
    });

    // Tạo bản đồ tag cha để tra cứu nhanh
    const parentMap = new Map<string, string>();
    tags.forEach((tag) => {
      if (tag.parentName) {
        parentMap.set(tag.name, tag.parentName);
      }
    });

    const relationshipsData: Array<{ sourceSlug: string; targetSlug: string; score: number }> = [];

    // Quét từng cặp bài viết và tính toán điểm số
    for (let i = 0; i < posts.length; i++) {
      for (let j = i + 1; j < posts.length; j++) {
        const postA = posts[i];
        const postB = posts[j];

        const score = this.calculateSimilarity(postA, postB, parentMap);

        // Lưu các mối quan hệ có điểm tương quan >= 0.2 (category match floor)
        if (score >= 0.2) {
          // Chuẩn bị lưu cả hai chiều (A -> B và B -> A) để dễ dàng truy vấn
          relationshipsData.push({ sourceSlug: postA.slug, targetSlug: postB.slug, score });
          relationshipsData.push({ sourceSlug: postB.slug, targetSlug: postA.slug, score });
        }
      }
    }

    // Xóa sạch các mối quan hệ cũ và lưu hàng loạt bằng Transaction để tối ưu hóa hiệu năng
    await prisma.$transaction([
      prisma.postRelationship.deleteMany({}),
      prisma.postRelationship.createMany({
        data: relationshipsData,
      }),
    ]);
  }

  /**
   * Lấy danh sách các bài viết liên quan có điểm tương quan >= threshold.
   */
  async getRelatedPosts(slug: string, threshold: number = 0.0) {
    const relationships = await postRelationshipRepository.findBySource(slug, threshold);
    return relationships.map((rel) => ({
      ...rel.targetPost,
      relationshipScore: rel.score,
    }));
  }

  /**
   * Thuật toán tính toán điểm tương quan giữa hai bài viết.
   * Kết quả nằm trong khoảng [0.0, 1.0]
   */
  private calculateSimilarity(postA: any, postB: any, parentMap: Map<string, string>): number {
    let score = 0;
    const tagsA: string[] = postA.tagRefs.map((t: any) => t.name);
    const tagsB: string[] = postB.tagRefs.map((t: any) => t.name);
    const setA = new Set(tagsA);
    const setB = new Set(tagsB);

    if (tagsA.length > 0 && tagsB.length > 0) {
      // 1. Hệ số Jaccard cho tag trực tiếp (trọng số tối đa 0.6)
      const intersection = tagsA.filter((x) => setB.has(x));
      const union = new Set([...tagsA, ...tagsB]);
      const jaccard = intersection.length / union.size;
      score += jaccard * 0.6;

      // 2. Kiểm tra mối liên hệ qua Tag cha (trọng số tối đa 0.2)
      let hierarchyMatchCount = 0;
      const parentsA = new Set<string>(tagsA.map((t) => parentMap.get(t)!).filter(Boolean));
      const parentsB = new Set<string>(tagsB.map((t) => parentMap.get(t)!).filter(Boolean));

      tagsA.forEach((tag) => {
        const parent = parentMap.get(tag);
        if (parent && setB.has(parent)) hierarchyMatchCount += 1;
      });
      tagsB.forEach((tag) => {
        const parent = parentMap.get(tag);
        if (parent && setA.has(parent)) hierarchyMatchCount += 1;
      });
      parentsA.forEach((p) => {
        if (parentsB.has(p)) hierarchyMatchCount += 0.5;
      });

      if (hierarchyMatchCount > 0) {
        score += Math.min(0.2, hierarchyMatchCount * 0.1);
      }
    }

    // 3. Khớp cùng Danh mục Category (trọng số tối đa 0.2)
    if (postA.category === postB.category) {
      score += 0.2;
    }

    return Math.min(1.0, Math.max(0.0, score));
  }
}

export const postRelationshipService = new PostRelationshipService();
