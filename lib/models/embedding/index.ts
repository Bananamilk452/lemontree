import { prisma } from "~/utils/db";

export const embedding = {
  async deleteEmbeddingsByDiaryId(diaryId: string) {
    await prisma.embedding.deleteMany({
      where: { diaryId },
    });
  },
};
