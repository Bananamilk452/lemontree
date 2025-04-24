import "server-only";

import { createEmbeddingQueue } from "~/lib/models/diary/createEmbedding";
import { prisma } from "~/utils/db";

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
  async createDiary({ content, date }: { content: string; date: Date }) {
    const diary = await prisma.diary.create({
      data: {
        content,
        date,
      },
    });

    const promises = [
      createEmbeddingQueue.addJob({ diaryId: diary.id, content }, jobOptions),
    ];

    Promise.all(promises);
    return diary;
  },

  async tempSaveDiary({ content, date }: { content: string; date: Date }) {
    const diary = await prisma.diary.create({
      data: {
        content,
        date,
      },
    });

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
};
