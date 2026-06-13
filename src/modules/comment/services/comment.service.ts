import { commentRepository } from "../repositories/comment.repository";
import { postRepository } from "../../post/repositories/post.repository";
import { CreateCommentDto } from "../dtos/comment.dto";
import { ConflictError, NotFoundError } from "@/src/core/exceptions/http-error";

export class CommentService {
  async getAllComments() {
    return await commentRepository.findAll();
  }

  async getCommentsByPostSlug(postSlug: string) {
    return await commentRepository.findByPostSlug(postSlug);
  }

  async createComment(data: CreateCommentDto) {
    // Business logic check: Post phải tồn tại
    const post = await postRepository.findBySlug(data.postSlug);
    if (!post) {
      throw new NotFoundError("Không tìm thấy bài viết này để comment.");
    }

    const existing = await commentRepository.findById(data.id);
    if (existing) {
      throw new ConflictError("ID comment đã tồn tại.");
    }

    return await commentRepository.create(data);
  }

  async deleteComment(id: string) {
    const existing = await commentRepository.findById(id);
    if (!existing) {
      throw new NotFoundError("Không tìm thấy comment để xóa.");
    }
    return await commentRepository.delete(id);
  }
}

export const commentService = new CommentService();
