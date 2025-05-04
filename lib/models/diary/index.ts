import { headers } from "next/headers";

import { auth } from "~/lib/auth";
import { createEmbedding } from "~/lib/models/diary/createEmbedding";
import { createMemory } from "~/lib/models/diary/createMemory";
import { embedding } from "~/lib/models/embedding";
import { memory } from "~/lib/models/memory";
import { prisma } from "~/utils/db";

import type { Diary } from "@prisma/client";

export type { Diary };

export const diary = {
  async createDiary(
    diaryId: string | undefined,
    data: { content: string; date: Date; userId: string },
  ) {
    const { user } = (await auth.api.getSession({
      headers: await headers(),
    }))!;

    const diary = await prisma.diary.upsert({
      where: {
        id: diaryId || "00000000-0000-0000-0000-0000-000000000000",
      },
      create: {
        ...data,
        userId: user.id,
      },
      update: {
        ...data,
      },
    });

    // UPDATE 시에는 기존의 임베딩과 메모리를 삭제하고 새로 생성
    if (diaryId) {
      await embedding.removeEmbeddingByDiaryId(diaryId);
      await memory.removeMemoryByDiaryId(diaryId);
    }

    await createEmbedding(diary.id, diary.content);
    const { memories } = await createMemory(diary.id, user.id);

    return {
      diary,
      memories,
    };
  },

  async tempSaveDiary(
    diaryId: string | undefined,
    data: { content: string; date: Date; userId: string },
  ) {
    const diary = await prisma.diary.upsert({
      where: {
        id: diaryId || "00000000-0000-0000-0000-0000-000000000000",
      },
      create: {
        ...data,
        userId: data.userId,
      },
      update: {
        ...data,
      },
    });

    return { diary };
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
    const { memories } = await createMemory(diary.id, diary.userId);

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
      throw new Error("Diary not found");
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
    const { memories } = await createMemory(diary.id, diary.userId);

    return {
      diary,
      memories,
    };
  },

  async getDiaryById(id: string) {
    const { user } = (await auth.api.getSession({
      headers: await headers(),
    }))!;

    const diary = await prisma.diary.findUnique({
      where: {
        id,
        userId: user.id,
      },
    });

    return diary;
  },

  async getDiaryByDate(date: Date) {
    const { user } = (await auth.api.getSession({
      headers: await headers(),
    }))!;

    const diary = await prisma.diary.findFirst({
      where: {
        date,
        userId: user.id,
      },
    });

    return diary;
  },

  async getRecentDiary() {
    const { user } = (await auth.api.getSession({
      headers: await headers(),
    }))!;

    const diary = await prisma.diary.findFirst({
      where: {
        userId: user.id,
      },
      orderBy: {
        date: "desc",
      },
    });

    return diary;
  },

  async getDiarys(options: { limit: number; page: number }) {
    const { user } = (await auth.api.getSession({
      headers: await headers(),
    }))!;

    const { limit, page } = options;

    const diarys = await prisma.diary.findMany({
      where: {
        userId: user.id,
      },
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

    const total = await prisma.diary.count({
      where: {
        userId: user.id,
      },
    });

    return {
      diarys,
      total,
    };
  },

  async getUnmemorizedOldestDiaryByDate(date: Date) {
    const { user } = (await auth.api.getSession({
      headers: await headers(),
    }))!;

    const diarys = await prisma.diary.findMany({
      where: {
        userId: user.id,
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
