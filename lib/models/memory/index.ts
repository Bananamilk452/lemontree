import { vectorStore } from "~/lib/langchain";
import { fullTextSearch as memoryFullTextSearch } from "~/lib/models/memory/fullTextSearch";
import { semanticSearch as memorySemanticSearch } from "~/lib/models/memory/semanticSearch";
import { prisma } from "~/utils/db";

export const memory = {
  async isOwner(memoryId: string, userId: string) {
    const memory = await prisma.memory.findFirst({
      where: { id: memoryId, userId },
    });

    return !!memory;
  },
  async updateMemoryById(memoryId: string, userId: string, content: string) {
    const memory = await prisma.memory.findFirst({
      where: { id: memoryId, userId },
    });

    if (!memory) {
      throw new Error("메모리를 찾을 수 없습니다.");
    }

    const [updatedMemory, , embedding] = await prisma.$transaction([
      prisma.memory.update({
        where: { id: memoryId, userId },
        data: { content },
      }),
      prisma.embedding.deleteMany({
        where: { memoryId },
      }),
      prisma.embedding.create({
        data: { content, memoryId },
      }),
    ]);

    try {
      await vectorStore.addModels([embedding]);
      return updatedMemory;
    } catch (error) {
      prisma.memory.update({
        where: { id: memoryId, userId },
        data: { content: memory.content },
      });

      prisma.embedding.deleteMany({
        where: { memoryId },
      });

      throw new Error(
        `updateMemoryById 작업 중 에러로 임베딩 생성이 롤백됨. 에러: ${error}`,
      );
    }
  },
  async deleteMemoryById(memoryId: string, userId: string) {
    await prisma.$transaction([
      prisma.memory.delete({
        where: { id: memoryId, userId },
      }),
    ]);
  },
  async deleteMemoriesByDiaryId(diaryId: string, userId: string) {
    await prisma.memory.deleteMany({
      where: {
        userId,
        diaryId,
      },
    });
  },
  async semanticSearch(
    userId: string,
    searchTerm: string,
    options: { limit: number; page: number },
  ) {
    return memorySemanticSearch(userId, searchTerm, {
      limit: options.limit,
      page: (options.page - 1) * options.limit,
    });
  },

  async fullTextSearch(
    userId: string,
    searchTerm: string,
    options: { limit: number; page: number },
  ) {
    return memoryFullTextSearch(userId, searchTerm, {
      limit: options.limit,
      page: (options.page - 1) * options.limit,
    });
  },
};
