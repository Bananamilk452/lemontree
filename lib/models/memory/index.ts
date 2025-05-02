import { prisma } from "~/utils/db";

export const memory = {
  async removeMemoryByDiaryId(diaryId: string) {
    const memories = await prisma.memory.findMany({
      where: { diaryId },
      select: { id: true, diaryId: true },
    });

    await prisma.$transaction(
      memories.flatMap((memory) => [
        prisma.memory.deleteMany({
          where: { diaryId },
        }),
        prisma.embedding.deleteMany({
          where: { memoryId: memory.id, diaryId: memory.diaryId },
        }),
      ]),
    );
  },
};
