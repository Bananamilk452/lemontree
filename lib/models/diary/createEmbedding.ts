import { PrismaVectorStore } from "@langchain/community/vectorstores/prisma";
import { VertexAIEmbeddings } from "@langchain/google-vertexai";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { Embedding, Prisma } from "@prisma/client";

import { prisma } from "~/utils/db";
import { logger } from "~/utils/logger";
import { createQueue } from "~/utils/queueFactory";

import type { Job } from "bullmq";

interface Data {
  diaryId: string;
  content: string;
}

async function processEmbedding(job: Job<Data>) {
  logger.info(`Job ${job.name}#${job.id} 임베딩 생성 진행`);

  const vectorStore = PrismaVectorStore.withModel<Embedding>(prisma).create(
    new VertexAIEmbeddings({
      model: "text-multilingual-embedding-002",
    }),
    {
      prisma: Prisma,
      // @ts-expect-error Embedding 테이블이 embedding으로 매핑되어있음
      tableName: "embedding",
      vectorColumnName: "vector",
      columns: {
        id: PrismaVectorStore.IdColumn,
        content: PrismaVectorStore.ContentColumn,
      },
    },
  );

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

export const createEmbeddingQueue = createQueue<Data>(
  "createEmbedding",
  processEmbedding,
);
