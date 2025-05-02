import { prisma } from "~/utils/db";

export const memory = {
  async removeMemoryByDiaryId(diaryId: string) {
    const memories = await prisma.memory.findMany({
      where: {
        diaries: {
          some: {
            id: diaryId,
          },
        },
      },
      select: { id: true },
    });

    await prisma.$transaction(
      memories.flatMap((memory) => [
        prisma.memory.deleteMany({
          where: {
            diaries: {
              some: {
                id: diaryId,
              },
            },
          },
        }),
        prisma.embedding.deleteMany({
          where: { memoryId: memory.id, diaryId },
        }),
      ]),
    );
  },
};
