import { prisma } from "~/utils/db";

export const memory = {
  async isOwner(memoryId: string, userId: string) {
    const memory = await prisma.memory.findFirst({
      where: { id: memoryId, userId },
    });

    return !!memory;
  },
  async updateMemoryById(memoryId: string, userId: string, content: string) {
    const memory = await prisma.memory.update({
      where: { id: memoryId, userId },
      data: { content },
    });

    return memory;
  },
  async deleteMemoryById(memoryId: string, userId: string) {
    await prisma.$transaction([
      prisma.memory.delete({
        where: { id: memoryId, userId },
      }),
      prisma.embedding.deleteMany({
        where: { memoryId },
      }),
    ]);
  },
  async deleteMemoriesByDiaryId(diaryId: string, userId: string) {
    const memories = await prisma.memory.findMany({
      where: {
        userId,
        diaryId,
      },
      select: { id: true },
    });

    await prisma.$transaction(
      memories.flatMap((memory) => [
        prisma.memory.deleteMany({
          where: { id: memory.id, userId },
        }),
        prisma.embedding.deleteMany({
          where: { memoryId: memory.id, diaryId },
        }),
      ]),
    );
  },
};
