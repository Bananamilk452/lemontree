import { getRelatedMemories as getRelatedMemoriesQuery } from "@prisma/client/sql";

import { createEmbeddingQueue } from "~/lib/models/diary/createEmbedding";
import { embedding } from "~/lib/models/embedding";
import { memory } from "~/lib/models/memory";
import { prisma } from "~/utils/db";

import { createMemoryQueue } from "./createMemory";

import type { Diary } from "@prisma/client";
import type { JobsOptions } from "bullmq";

export type { Diary };

const jobOptions: JobsOptions = {
  attempts: 3,
  backoff: {
    type: "exponential",
    delay: 1000,
  },
};

export const diary = {
  async createDiary(data: { content: string; date: Date }) {
    const diary = await prisma.diary.create({
      data,
    });

    createEmbeddingQueue.addJob(
      { diaryId: diary.id, content: diary.content },
      jobOptions,
    );
    createMemoryQueue.addJob({ diaryId: diary.id }, jobOptions);
    return diary;
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

    createEmbeddingQueue.addJob(
      { diaryId: diary.id, content: diary.content },
      jobOptions,
    );
    createMemoryQueue.addJob({ diaryId: diary.id }, jobOptions);
    return diary;
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
      createEmbeddingQueue.addJob(
        { diaryId: diary.id, content: diary.content },
        jobOptions,
      );
    }
    createMemoryQueue.addJob({ diaryId: diary.id }, jobOptions);
    return diary;
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

  async getRelatedMemories(diaryId: string) {
    const diary = await prisma.diary.findUnique({
      where: {
        id: diaryId,
      },
    });

    if (!diary) {
      return [];
    }

    const memories = await prisma.$queryRawTyped(
      getRelatedMemoriesQuery(diary.id, diary.date),
    );

    return memories;
  },
};

export type DiaryWithCount = Awaited<
  ReturnType<typeof diary.getDiarys>
>["diarys"][0];
