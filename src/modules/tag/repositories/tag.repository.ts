import { prisma } from "@/src/config/database";
import { CreateTagDto } from "../dtos/tag.dto";

export class TagRepository {
  async upsertTags(names: string[]) {
    if (!names.length) return;
    await Promise.all(
      names.map((name) =>
        prisma.tag.upsert({ where: { name }, update: {}, create: { name } })
      )
    );
  }

  async findAll() {
    return await prisma.tag.findMany({ orderBy: { name: "asc" } });
  }

  async findAllWithCount() {
    return await prisma.tag.findMany({
      where: { posts: { some: {} } },
      include: { _count: { select: { posts: true } } },
      orderBy: { posts: { _count: "desc" } },
    });
  }

  async create(data: CreateTagDto) {
    return await prisma.tag.upsert({
      where: { name: data.name },
      update: {},
      create: { name: data.name },
    });
  }

  async delete(name: string) {
    return await prisma.tag.delete({ where: { name } });
  }
}

export const tagRepository = new TagRepository();
