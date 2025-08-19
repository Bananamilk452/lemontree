import { revalidatePath } from "next/cache";

import { memory } from "~/lib/models/memory";
import { PermissionError } from "~/utils/error";

interface MemoryServiceDeps {
  userId: string;
}

export class MemoryService {
  private userId: string;

  constructor({ userId }: MemoryServiceDeps) {
    this.userId = userId;
  }

  private async checkOwnership(memoryId: string): Promise<void> {
    const isOwner = await memory.isOwner(memoryId, this.userId);
    if (!isOwner) {
      throw new PermissionError();
    }
  }

  private revalidatePages() {
    revalidatePath("/home");
    revalidatePath("/new");
    revalidatePath("/diary/list/[page]", "page");
  }

  async getMemories(options: { limit: number; page: number }) {
    const { limit, page } = options;
    const take = limit;
    const skip = (page - 1) * limit;

    const data = await memory.getMemories(this.userId, { take, skip });

    if (!data) {
      return { memories: [], total: 0 };
    }

    return data;
  }

  async updateMemoryById(memoryId: string, content: string) {
    await this.checkOwnership(memoryId);

    const updatedMemory = await memory.updateMemoryById(
      memoryId,
      this.userId,
      content,
    );

    this.revalidatePages();
    return updatedMemory;
  }

  async deleteMemoryById(memoryId: string) {
    await this.checkOwnership(memoryId);

    await memory.deleteMemoryById(memoryId, this.userId);

    this.revalidatePages();
  }

  async semanticSearch(
    searchTerm: string,
    options: {
      limit: number;
      page: number;
      sort: "accuracy" | "latest" | "oldest";
    },
  ) {
    const { limit, page, sort } = options;
    const take = limit;
    const skip = (page - 1) * limit;

    return await memory.semanticSearch(this.userId, searchTerm, {
      take,
      skip,
      sort,
    });
  }

  async fullTextSearch(
    searchTerm: string,
    options: { limit: number; page: number },
  ) {
    const { limit, page } = options;
    const take = limit;
    const skip = (page - 1) * limit;

    return await memory.fullTextSearch(this.userId, searchTerm, { take, skip });
  }
}
