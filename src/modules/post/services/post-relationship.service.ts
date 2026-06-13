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

        // Chỉ lưu các mối quan hệ có điểm tương quan đáng kể (>= 0.66)
        if (score >= 0.66) {
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
    const tagsA = postA.tagRefs.map((t: any) => t.name);
    const tagsB = postB.tagRefs.map((t: any) => t.name);

    if (tagsA.length === 0 || tagsB.length === 0) {
      return 0;
    }

    // 1. Kiểm tra sự trùng lặp tag trực tiếp
    const intersection = tagsA.filter((x: string) => tagsB.includes(x));
    const union = Array.from(new Set([...tagsA, ...tagsB]));
    
    // Hệ số Jaccard cơ bản cho tag trực tiếp (trọng số tối đa 0.6)
    const jaccard = intersection.length / union.length;
    score += jaccard * 0.6;

    // 2. Kiểm tra mối liên hệ qua Tag cha (phân cấp Tag)
    // Nếu một bài viết có tag con và bài viết kia có tag cha của tag con đó, hoặc hai tag con có chung tag cha.
    let hierarchyMatchCount = 0;
    
    // Tìm các tag cha của mỗi bài viết
    const parentsA = new Set<string>(tagsA.map((t: string) => parentMap.get(t) as string).filter(Boolean));
    const parentsB = new Set<string>(tagsB.map((t: string) => parentMap.get(t) as string).filter(Boolean));

    // Trường hợp 1: Post A có Tag cha, Post B có Tag con thuộc Tag cha đó (và ngược lại)
    tagsA.forEach((tag: string) => {
      const parent = parentMap.get(tag);
      if (parent && tagsB.includes(parent)) {
        hierarchyMatchCount += 1;
      }
    });
    tagsB.forEach((tag: string) => {
      const parent = parentMap.get(tag);
      if (parent && tagsA.includes(parent)) {
        hierarchyMatchCount += 1;
      }
    });

    // Trường hợp 2: Hai bài viết có các tag con khác nhau nhưng cùng chung tag cha
    parentsA.forEach((p) => {
      if (parentsB.has(p)) {
        hierarchyMatchCount += 0.5; // Điểm cộng ít hơn vì là quan hệ anh-em (sibling)
      }
    });

    if (hierarchyMatchCount > 0) {
      // Trọng số cho khớp phân cấp tag (tối đa 0.2)
      score += Math.min(0.2, hierarchyMatchCount * 0.1);
    }

    // 3. Khớp cùng Danh mục Category (trọng số tối đa 0.2)
    if (postA.category === postB.category) {
      score += 0.2;
    }

    // Chuẩn hóa điểm số tối đa là 1.0
    return Math.min(1.0, Math.max(0.0, score));
  }
}

export const postRelationshipService = new PostRelationshipService();
