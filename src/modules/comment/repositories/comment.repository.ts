import { prisma } from "@/src/config/database";
import { CreateCommentDto } from "../dtos/comment.dto";

export class CommentRepository {
  async findAll() {
    return await prisma.comment.findMany({
      orderBy: { createdAt: "desc" },
    });
  }

  async findById(id: string) {
    return await prisma.comment.findUnique({
      where: { id },
    });
  }

  async findByPostSlug(postSlug: string) {
    return await prisma.comment.findMany({
      where: { postSlug },
      orderBy: { createdAt: "desc" },
    });
  }

  async create(data: CreateCommentDto) {
    return await prisma.comment.create({
      data: {
        id: data.id,
        postSlug: data.postSlug,
        authorName: data.authorName,
        content: data.content,
        createdAt: new Date(),
      },
    });
  }

  async delete(id: string) {
    return await prisma.comment.delete({
      where: { id },
    });
  }
}

export const commentRepository = new CommentRepository();
