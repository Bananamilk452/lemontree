import { createEmbedding } from "~/lib/models/diary/createEmbedding";
import { createMemory } from "~/lib/models/diary/createMemory";
import { fullTextSearch as diaryFullTextSearch } from "~/lib/models/diary/fullTextSearch";
import { semanticSearch as diarySemanticSearch } from "~/lib/models/diary/semanticSearch";
import { memory } from "~/lib/models/memory";
import { prisma } from "~/utils/db";
import { NotFoundError } from "~/utils/error";

import type { Diary } from "~/prisma/generated/client";

export type { Diary };

export const diary = {
  async isOwner(diaryId: string, userId: string) {
    const diary = await prisma.diary.findUnique({
      where: {
        id: diaryId,
        userId,
      },
    });

    return !!diary;
  },
  async deleteMemoriesAndEmbeddings(diaryId: string, userId: string) {
    return prisma.$transaction([
      prisma.embedding.deleteMany({
        where: { diaryId },
      }),
      prisma.memory.deleteMany({
        where: { diaryId, userId },
      }),
    ]);
  },
  async createDiary(
    diaryId: string | undefined,
    userId: string,
    data: { content: string; date: Date },
  ) {
    const diary = await prisma.diary.upsert({
      where: {
        id: diaryId || "00000000-0000-0000-0000-0000-000000000000",
      },
      create: {
        ...data,
        userId,
      },
      update: {
        ...data,
      },
    });

    // UPDATE 시에는 기존의 임베딩과 메모리를 삭제하고 새로 생성
    if (diaryId) {
      await this.deleteMemoriesAndEmbeddings(diaryId, userId);
    }

    await createEmbedding(diary.id, diary.content);
    const { memories } = await createMemory(diary.id, userId);

    return {
      diary,
      memories,
    };
  },

  async tempSaveDiary(
    diaryId: string | undefined,
    userId: string,
    data: { content: string; date: Date },
  ) {
    const diary = await prisma.diary.upsert({
      where: {
        id: diaryId || "00000000-0000-0000-0000-0000-000000000000",
      },
      create: {
        ...data,
        userId,
      },
      update: {
        ...data,
      },
    });

    return { diary };
  },

  async updateDiary(
    diaryId: string,
    userId: string,
    data: { content: string; date: Date },
  ) {
    const diary = await prisma.diary.update({
      where: {
        id: diaryId,
        userId,
      },
      data,
    });

    await this.deleteMemoriesAndEmbeddings(diaryId, userId);

    await createEmbedding(diary.id, diary.content);
    const { memories } = await createMemory(diary.id, diary.userId);

    return {
      diary,
      memories,
    };
  },

  async deleteDiary(diaryId: string, userId: string) {
    await prisma.diary.delete({
      where: {
        id: diaryId,
        userId,
      },
    });
  },

  async processDiary(diaryId: string, userId: string) {
    const diary = await prisma.diary.findUnique({
      where: {
        id: diaryId,
        userId,
      },
    });

    if (!diary) {
      throw new NotFoundError("일기를 찾을 수 없습니다.");
    }

    const embeddingCount = await prisma.embedding.count({
      where: {
        diaryId: diaryId,
      },
    });

    await memory.deleteMemoriesByDiaryId(diaryId, userId);

    // 임베딩이 없을 경우에만 임베딩 생성 (완전히 새로운 일기일 경우)
    if (embeddingCount === 0) {
      await createEmbedding(diary.id, diary.content);
    }
    const { memories } = await createMemory(diaryId, userId);

    return {
      diary,
      memories,
    };
  },

  async getDiaryById(diaryId: string, userId: string) {
    const diary = await prisma.diary.findUnique({
      where: {
        id: diaryId,
        userId,
      },
      include: {
        _count: {
          select: {
            embeddings: true,
            memories: true,
          },
        },
        memories: {
          orderBy: {
            id: "asc",
          },
        },
      },
    });

    return diary;
  },

  async getDiaryByDate(date: Date, userId: string) {
    const diary = await prisma.diary.findFirst({
      where: {
        date,
        userId,
      },
      include: {
        _count: {
          select: {
            embeddings: true,
            memories: true,
          },
        },
        memories: {
          orderBy: {
            id: "asc",
          },
        },
      },
    });

    return diary;
  },

  async getRecentDiary(userId: string) {
    const diary = await prisma.diary.findFirst({
      where: {
        userId,
      },
      orderBy: {
        date: "desc",
      },
    });

    return diary;
  },

  async getDiarys(userId: string, options: { take: number; skip: number }) {
    const { take, skip } = options;

    const diarys = await prisma.diary.findMany({
      where: {
        userId,
      },
      include: {
        _count: {
          select: {
            embeddings: true,
            memories: true,
          },
        },
        memories: {
          orderBy: {
            id: "asc",
          },
        },
      },
      orderBy: {
        date: "desc",
      },
      take,
      skip,
    });

    const total = await prisma.diary.count({
      where: {
        userId,
      },
    });

    return {
      diarys,
      total,
    };
  },

  async getOldestUnmemorizedDiaryByDate(userId: string, date: Date) {
    const diarys = await prisma.diary.findMany({
      where: {
        userId,
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

  semanticSearch: diarySemanticSearch,

  fullTextSearch: diaryFullTextSearch,
};

export type DiaryWithCount = Awaited<
  ReturnType<typeof diary.getDiarys>
>["diarys"][0];
