import { prisma } from "~/utils/db";

export const embedding = {
  async deleteEmbeddingsByDiaryId(diaryId: string) {
    const embeddings = await prisma.embedding.findMany({
      where: { diaryId },
      select: { id: true, diaryId: true },
    });

    await prisma.embedding.deleteMany({
      where: { diaryId },
    });

    return embeddings;
  },
};
