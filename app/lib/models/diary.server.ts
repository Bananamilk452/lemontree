import type { Diary } from "@prisma/client";
import { createEmbeddingQueue } from "./diary/createEmbedding";
import { analyzeSentimentQueue } from "./diary/analyzeSentiment";
import { extractKeywordsQueue } from "./diary/extractKeywords";
import { createSummaryQueue } from "./diary/createSummary";
import { prisma } from "~/lib/utils/db.server";
import type { JobsOptions } from "bullmq";

export interface DiaryWithEmbedding extends Diary {
  embedding: string[];
}

export interface DiaryWithIsEmbeddingNull extends Diary {
  isEmbeddingNull: boolean;
}

export class DiaryService {
  private createEmbeddingQueue;
  private analyzeSentimentQueue;
  private createSummaryQueue;
  private extractKeywordsQueue;
  private jobOptions: JobsOptions = {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 1000,
    },
  };

  constructor() {
    this.createEmbeddingQueue = new createEmbeddingQueue();
    this.analyzeSentimentQueue = new analyzeSentimentQueue();
    this.createSummaryQueue = new createSummaryQueue();
    this.extractKeywordsQueue = new extractKeywordsQueue();
  }

  async createDiary(content: string) {
    // content만 들어간 Diary 생성
    const diary = await prisma.diary.create({
      data: {
        content,
      },
    });

    const promises = [
      this.createEmbedding(diary.id, content),
      this.analyzeSentiment(diary.id, content),
      this.createSummary(diary.id, content),
      this.extractKeywords(diary.id, content),
    ];

    return Promise.all(promises);
  }

  async createEmbedding(diaryId: string, content: string) {
    return this.createEmbeddingQueue.addJob(
      { diaryId, content },
      this.jobOptions,
    );
  }

  async analyzeSentiment(diaryId: string, content: string) {
    return this.analyzeSentimentQueue.addJob(
      { diaryId, content },
      this.jobOptions,
    );
  }

  async createSummary(diaryId: string, content: string) {
    return this.createSummaryQueue.addJob(
      { diaryId, content },
      this.jobOptions,
    );
  }

  async extractKeywords(diaryId: string, content: string) {
    return this.extractKeywordsQueue.addJob(
      { diaryId, content },
      this.jobOptions,
    );
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
