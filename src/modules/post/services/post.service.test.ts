import { describe, it, expect, vi, beforeEach } from "vitest";
import { postService } from "./post.service";
import { postRepository } from "../repositories/post.repository";
import { mockDeep, mockReset } from "vitest-mock-extended";

// Mock the entire repository module
vi.mock("../repositories/post.repository", () => ({
  postRepository: {
    findAll: vi.fn(),
    findBySlug: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    incrementViews: vi.fn(),
    findByTag: vi.fn(),
  },
}));

describe("PostService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getPostBySlug", () => {
    it("nên trả về bài viết nếu tồn tại", async () => {
      const mockPost = { slug: "test-slug", title: "Test", content: "Content" };
      vi.mocked(postRepository.findBySlug).mockResolvedValue(mockPost as any);

      const result = await postService.getPostBySlug("test-slug");
      
      expect(result).toEqual(mockPost);
      expect(postRepository.findBySlug).toHaveBeenCalledWith("test-slug");
    });

    it("nên ném lỗi nếu bài viết không tồn tại", async () => {
      vi.mocked(postRepository.findBySlug).mockResolvedValue(null);

      await expect(postService.getPostBySlug("not-found")).rejects.toThrow("Không tìm thấy bài viết này.");
    });
  });

  describe("createPost", () => {
    const validDto = {
      slug: "new-post",
      title: "New Post",
      content: "Content",
      category: "tech"
    };

    it("nên tạo bài viết thành công nếu slug chưa tồn tại", async () => {
      vi.mocked(postRepository.findBySlug).mockResolvedValue(null); // Slug chưa tồn tại
      vi.mocked(postRepository.create).mockResolvedValue(validDto as any); // Mock hàm tạo thành công

      const result = await postService.createPost(validDto);

      expect(result).toEqual(validDto);
      expect(postRepository.create).toHaveBeenCalledWith(validDto);
    });

    it("nên ném lỗi nếu slug đã tồn tại", async () => {
      // Giả lập đã có bài viết với slug này
      vi.mocked(postRepository.findBySlug).mockResolvedValue({ slug: "new-post" } as any);

      await expect(postService.createPost(validDto)).rejects.toThrow("Slug đã tồn tại, vui lòng chọn một slug khác.");
      
      // Đảm bảo không gọi repository.create nếu validation fail
      expect(postRepository.create).not.toHaveBeenCalled();
    });
  });
});
