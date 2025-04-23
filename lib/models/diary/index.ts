import { createEmbeddingQueue } from "~/lib/models/diary/createEmbedding";

import { prisma } from "~/utils/db";
import { singleton } from "~/utils/singleton";

import type { Diary } from "@prisma/client";
import type { JobsOptions } from "bullmq";

export type { Diary };

export interface DiaryWithEmbedding extends Diary {
  embedding: string[];
}

export interface DiaryWithIsEmbeddingNull extends Diary {
  isEmbeddingNull: boolean;
}

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
};

export async function getAllDiaryWithEmbedding() {
  const diaries = await prisma.$queryRaw<DiaryWithEmbedding[]>`
    SELECT 
      id,
      content,
      "createdAt",
      "updatedAt",
      sentiment,
      summary,
      keywords,
      embedding::text::jsonb
    FROM "Diary"
  `;

  return diaries;
}

export async function getAllDiary() {
  const diaries = await prisma.$queryRaw<DiaryWithIsEmbeddingNull[]>`
    SELECT 
      id,
      content,
      "createdAt",
      "updatedAt",
      sentiment,
      summary,
      keywords,
      embedding IS NULL as "isEmbeddingNull"
    FROM "Diary"
  `;
  return diaries;
}
