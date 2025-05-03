import { createEmbedding } from "~/lib/models/diary/createEmbedding";
import { createMemory } from "~/lib/models/diary/createMemory";
import { embedding } from "~/lib/models/embedding";
import { memory } from "~/lib/models/memory";
import { prisma } from "~/utils/db";

import type { Diary } from "@prisma/client";

export type { Diary };

export const diary = {
  async createDiary(data: { content: string; date: Date }) {
    const diary = await prisma.diary.create({
      data,
    });

    await createEmbedding(diary.id, diary.content);
    const { memories } = await createMemory(diary.id);

    return {
      diary,
      memories,
    };
  },

  async tempSaveDiary(data: { content: string; date: Date }) {
    const diary = await prisma.diary.create({
      data,
    });

    return diary;
  },

  async updateDiary(id: string, data: { content: string; date: Date }) {
    const diary = await prisma.diary.update({
      where: {
        id,
      },
      data,
    });

    await embedding.removeEmbeddingByDiaryId(id);
    await memory.removeMemoryByDiaryId(id);

    await createEmbedding(diary.id, diary.content);
    const { memories } = await createMemory(diary.id);

    return {
      diary,
      memories,
    };
  },

  async deleteDiary(id: string) {
    await prisma.diary.delete({
      where: {
        id,
      },
    });

    await prisma.embedding.deleteMany({
      where: {
        diaryId: id,
      },
    });

    await prisma.memory.deleteMany({
      where: {
        diaries: {
          some: {
            id,
          },
        },
      },
    });
  },

  async processDiary(id: string) {
    const diary = await prisma.diary.findUnique({
      where: {
        id,
      },
    });

    if (!diary) {
      return null;
    }

    const embeddingCount = await prisma.embedding.count({
      where: {
        diaryId: id,
      },
    });

    await memory.removeMemoryByDiaryId(id);

    if (embeddingCount === 0) {
      await createEmbedding(diary.id, diary.content);
    }
    const { memories } = await createMemory(diary.id);

    return {
      diary,
      memories,
    };
  },

  async getDiaryById(id: string) {
    const diary = await prisma.diary.findUnique({
      where: {
        id,
      },
    });

    return diary;
  },

  async getDiaryByDate(date: Date) {
    const diary = await prisma.diary.findFirst({
      where: {
        date,
      },
    });

    return diary;
  },

  async getRecentDiary() {
    const diary = await prisma.diary.findFirst({
      orderBy: {
        date: "desc",
      },
    });

    return diary;
  },

  async getDiarys(options: { limit: number; page: number }) {
    const { limit, page } = options;

    const diarys = await prisma.diary.findMany({
      include: {
        _count: {
          select: {
            embeddings: true,
            memories: true,
          },
        },
      },
      orderBy: {
        date: "desc",
      },
      take: limit,
      skip: (page - 1) * limit,
    });

    const total = await prisma.diary.count();

    return {
      diarys,
      total,
    };
  },

  async getUnmemorizedOldestDiaryByDate(date: Date) {
    const diarys = await prisma.diary.findMany({
      where: {
        date: {
          lt: date,
        },
        embeddings: {
          none: {},
        },
      },
      orderBy: {
        date: "asc",
      },
      take: 1,
    });

    return diarys;
  },
};

export type DiaryWithCount = Awaited<
  ReturnType<typeof diary.getDiarys>
>["diarys"][0];
