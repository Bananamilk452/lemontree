import { vectorStore } from "~/lib/langchain";
import { fullTextSearch as memoryFullTextSearch } from "~/lib/models/memory/fullTextSearch";
import { semanticSearch as memorySemanticSearch } from "~/lib/models/memory/semanticSearch";
import { prisma } from "~/utils/db";
import { ApplicationError, NotFoundError } from "~/utils/error";
import { logger } from "~/utils/logger";

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
      throw new NotFoundError("메모리를 찾을 수 없습니다.");
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

      logger.error(error);
      throw new ApplicationError(
        "메모리 업데이트 중 오류가 발생했습니다. 다시 시도해주세요.",
      );
    }
  },
  async deleteMemoryById(memoryId: string, userId: string) {
    await prisma.memory.delete({
      where: { id: memoryId, userId },
    });
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
    options: { take: number; skip: number },
  ) {
    return memorySemanticSearch(userId, searchTerm, options);
  },

  async fullTextSearch(
    userId: string,
    searchTerm: string,
    options: { take: number; skip: number },
  ) {
    return memoryFullTextSearch(userId, searchTerm, options);
  },
};
