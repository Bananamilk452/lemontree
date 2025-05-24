import { revalidatePath } from "next/cache";

import { memory } from "~/lib/models/memory";

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
      throw new Error("이 메모리에 대한 권한이 없습니다.");
    }
  }

  private revalidatePages() {
    revalidatePath("/home");
    revalidatePath("/new");
    revalidatePath("/list/[page]", "page");
  }

  async updateMemoryById(memoryId: string, content: string) {
    await this.checkOwnership(memoryId);

    const updatedMemory = await memory.updateMemoryById(
      memoryId,
      this.userId,
      content,
    );

    if (!updatedMemory) {
      throw new Error("메모리 업데이트에 실패했습니다.");
    }

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
    options: { limit: number; page: number },
  ) {
    const { limit, page } = options;
    const take = limit;
    const skip = (page - 1) * limit;

    return await memory.semanticSearch(this.userId, searchTerm, { take, skip });
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
