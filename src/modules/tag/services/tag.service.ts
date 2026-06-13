import { tagRepository } from "../repositories/tag.repository";
import { CreateTagDto } from "../dtos/tag.dto";

export class TagService {
  async upsertTags(names: string[]) {
    await tagRepository.upsertTags(names);
  }

  async getAllTagsMaster() {
    return await tagRepository.findAll();
  }

  async getAllTagsWithCount() {
    const tags = await tagRepository.findAllWithCount();
    return tags.map((t) => ({ tag: t.name, count: t._count.posts }));
  }

  async createTag(data: CreateTagDto) {
    return await tagRepository.create(data);
  }

  async deleteTag(name: string) {
    return await tagRepository.delete(name);
  }
}

export const tagService = new TagService();
