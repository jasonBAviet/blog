import { postRepository } from "../repositories/post.repository";
import { CreatePostDto, UpdatePostDto } from "../dtos/post.dto";
import { ConflictError, NotFoundError } from "@/src/core/exceptions/http-error";

export class PostService {
  async getAllPosts() {
    // Lỗi DB sẽ được withErrorHandler log đầy đủ và trả 500; không nuốt mất stack gốc.
    return await postRepository.findAll();
  }

  async getPaginatedPosts(page: number, limit: number) {
    const total = await postRepository.count();
    const totalPages = Math.max(1, Math.ceil(total / limit));
    const safePage = Math.min(Math.max(1, page), totalPages);
    const posts = await postRepository.findPaginated((safePage - 1) * limit, limit);
    return { posts, total, page: safePage, totalPages };
  }

  async getPostBySlug(slug: string) {
    const post = await postRepository.findBySlug(slug);
    if (!post) {
      throw new NotFoundError("Không tìm thấy bài viết này.");
    }
    return post;
  }

  async createPost(data: CreatePostDto) {
    // Business logic check: Kiểm tra xem slug đã tồn tại chưa
    const existingPost = await postRepository.findBySlug(data.slug);
    if (existingPost) {
      throw new ConflictError("Slug đã tồn tại, vui lòng chọn một slug khác.");
    }

    return await postRepository.create(data);
  }

  async updatePost(slug: string, data: UpdatePostDto) {
    // Đảm bảo bài viết tồn tại (ném NotFoundError nếu không)
    await this.getPostBySlug(slug);
    return await postRepository.update(slug, postRepository.buildUpdateData(data));
  }

  async deletePost(slug: string) {
    await this.getPostBySlug(slug);
    return await postRepository.delete(slug);
  }

  async incrementViews(slug: string) {
    await this.getPostBySlug(slug); // Validate exists
    return await postRepository.incrementViews(slug);
  }

  async incrementReaction(slug: string, type: string) {
    const post = await this.getPostBySlug(slug);
    
    // Parse existing reactions
    let reactions: Record<string, number> = {};
    if (post.reactions) {
      try {
        reactions = JSON.parse(post.reactions as string) || {};
      } catch {
        // Ignore
      }
    }
    
    reactions[type] = (reactions[type] || 0) + 1;
    
    await postRepository.update(slug, { reactions: JSON.stringify(reactions) });
    return reactions;
  }

  async getPostsByTag(tag: string) {
    return await postRepository.findByTag(tag);
  }
}

export const postService = new PostService();
