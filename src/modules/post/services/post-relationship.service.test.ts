import { describe, it, expect, vi, beforeEach } from "vitest";
import { postRelationshipService } from "./post-relationship.service";
import { postRepository } from "../repositories/post.repository";
import { postRelationshipRepository } from "../repositories/post-relationship.repository";
import { prisma } from "@/src/config/database";

// Mock các dependencies
vi.mock("../repositories/post.repository", () => ({
  postRepository: {
    findAll: vi.fn(),
  },
}));

vi.mock("../repositories/post-relationship.repository", () => ({
  postRelationshipRepository: {
    findBySource: vi.fn(),
    upsert: vi.fn(),
  },
}));

vi.mock("@/src/config/database", () => ({
  prisma: {
    tag: {
      findMany: vi.fn(),
    },
    postRelationship: {
      deleteMany: vi.fn(),
      createMany: vi.fn(),
    },
    $transaction: vi.fn((actions) => Promise.all(actions)),
  },
}));

describe("PostRelationshipService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getRelatedPosts", () => {
    it("nên trả về danh sách bài viết liên quan có kèm theo relationshipScore", async () => {
      const mockRelationships = [
        {
          score: 0.85,
          targetPost: {
            slug: "related-post-1",
            title: "Related Post 1",
            category: "technology",
            tagRefs: [{ name: "AI" }],
          },
        },
      ];

      vi.mocked(postRelationshipRepository.findBySource).mockResolvedValue(mockRelationships as any);

      const result = await postRelationshipService.getRelatedPosts("source-post", 0.5);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        slug: "related-post-1",
        title: "Related Post 1",
        category: "technology",
        tagRefs: [{ name: "AI" }],
        relationshipScore: 0.85,
      });
      expect(postRelationshipRepository.findBySource).toHaveBeenCalledWith("source-post", 0.5);
    });
  });

  describe("calculateAllRelationships", () => {
    it("nên tính toán điểm tương quan và lưu hàng loạt bằng transaction", async () => {
      const mockPosts = [
        {
          slug: "post-1",
          category: "tech",
          tagRefs: [{ name: "AI" }],
        },
        {
          slug: "post-2",
          category: "tech",
          tagRefs: [{ name: "AI" }],
        },
      ];

      const mockTags = [
        {
          name: "AI",
          parentName: "Technology",
        },
      ];

      vi.mocked(postRepository.findAll).mockResolvedValue(mockPosts as any);
      vi.mocked(prisma.tag.findMany).mockResolvedValue(mockTags as any);

      await postRelationshipService.calculateAllRelationships();

      expect(postRepository.findAll).toHaveBeenCalled();
      expect(prisma.tag.findMany).toHaveBeenCalled();
      expect(prisma.$transaction).toHaveBeenCalled();
      expect(prisma.postRelationship.createMany).toHaveBeenCalledWith({
        data: [
          { sourceSlug: "post-1", targetSlug: "post-2", score: expect.any(Number) },
          { sourceSlug: "post-2", targetSlug: "post-1", score: expect.any(Number) },
        ],
      });
    });
  });
});
