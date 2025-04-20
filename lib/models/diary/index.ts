import { analyzeSentimentQueue } from "~/lib/models/diary/analyzeSentiment";
import { createEmbeddingQueue } from "~/lib/models/diary/createEmbedding";
import { createSummaryQueue } from "~/lib/models/diary/createSummary";
import { extractKeywordsQueue } from "~/lib/models/diary/extractKeywords";

import { prisma } from "~/utils/db";

import type { Diary } from "@prisma/client";
import type { JobsOptions } from "bullmq";

export type { Diary };

export interface DiaryWithEmbedding extends Diary {
  embedding: string[];
}

export interface DiaryWithIsEmbeddingNull extends Diary {
  isEmbeddingNull: boolean;
}

export class DiaryService {
  private static queues: {
    embedding?: createEmbeddingQueue;
    // sentiment?: analyzeSentimentQueue;
    // summary?: createSummaryQueue;
    // keywords?: extractKeywordsQueue;
  } = {};

  private jobOptions: JobsOptions = {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 1000,
    },
  };

  async createDiary({ content, date }: { content: string; date: Date }) {
    // content만 들어간 Diary 생성
    const diary = await prisma.diary.create({
      data: {
        content,
        date,
      },
    });

    const promises = [
      this.getEmbeddingQueue().addJob(
        { diaryId: diary.id, content },
        this.jobOptions,
      ),
    ];

    Promise.all(promises);
    return diary;
  }

  private getEmbeddingQueue() {
    if (!DiaryService.queues.embedding) {
      DiaryService.queues.embedding = new createEmbeddingQueue();
    }
    return DiaryService.queues.embedding;
  }

  static async cleanup() {
    const cleanupPromises = Object.values(DiaryService.queues).map((queue) =>
      queue?.worker.close(),
    );
    await Promise.all(cleanupPromises);
    DiaryService.queues = {};
  }
}

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
  // isEmbeddingNull을 필드를 추가하여 쿼리
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
