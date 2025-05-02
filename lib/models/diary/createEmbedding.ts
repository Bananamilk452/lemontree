import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

import { vectorStore } from "~/lib/langchain";
import { prisma } from "~/utils/db";
import { logger } from "~/utils/logger";
import { createQueue } from "~/utils/queueFactory";
import { singleton } from "~/utils/singleton";

import type { Job } from "bullmq";

interface Data {
  diaryId: string;
  content: string;
}

async function processEmbedding(job: Job<Data>) {
  logger.info(`Job ${job.name}#${job.id} 임베딩 생성 진행`);

  const separators = ["\n\n", "\n", ".", "!", "?", ",", " ", ""];

  const splitter = new RecursiveCharacterTextSplitter({
    separators,
    chunkSize: 400,
    chunkOverlap: 70,
  });

  const texts = await splitter.splitText(job.data.content);
  const vectors = await prisma.$transaction(
    texts.map((content) =>
      prisma.embedding.create({
        data: { content, diaryId: job.data.diaryId },
      }),
    ),
  );

  try {
    await vectorStore.addModels(vectors);
    return {
      content: job.data.content,
      vectorCount: vectors.length,
    };
  } catch (vectorError) {
    logger.error("벡터 변환 중 오류 발생:", vectorError);

    const vectorIds = vectors.map((doc) => doc.id);
    await prisma.embedding.deleteMany({
      where: {
        id: { in: vectorIds },
      },
    });

    throw new Error(`벡터 변환 실패로 문서 생성이 롤백됨: ${vectorError}`);
  }
}

export const createEmbeddingQueue = singleton("createEmbeddingQueue", () =>
  createQueue<Data>("createEmbedding", processEmbedding),
);
