import { PrismaVectorStore } from "@langchain/community/vectorstores/prisma";
import { VertexAIEmbeddings } from "@langchain/google-vertexai";
import { Prisma, Vector } from "@prisma/client";

import { prisma } from "~/utils/db";
import { logger } from "~/utils/logger";
import { QueueFactory } from "~/utils/queueFactory";

import type { Job } from "bullmq";

interface Data {
  diaryId: string;
  content: string;
}

export class createEmbeddingQueue extends QueueFactory<Data> {
  constructor() {
    super("createEmbedding");
  }

  async process(job: Job<Data>) {
    try {
      logger.info(`Job ${job.name}#${job.id} 임베딩 생성 진행`);

      const vectorStore = PrismaVectorStore.withModel<Vector>(prisma).create(
        new VertexAIEmbeddings({
          model: "text-multilingual-embedding-002",
        }),
        {
          prisma: Prisma,
          tableName: "Vector",
          vectorColumnName: "vector",
          columns: {
            id: PrismaVectorStore.IdColumn,
            content: PrismaVectorStore.ContentColumn,
          },
        },
      );

      const texts = ["Hello world", "Bye bye", "What's this?"];
      const vectors = await prisma.$transaction(
        texts.map((content) =>
          prisma.vector.create({
            data: { content, diaryId: job.data.diaryId },
          }),
        ),
      );

      try {
        // 2. 벡터 변환 및 저장 시도
        await vectorStore.addModels(vectors);
      } catch (vectorError) {
        logger.error("벡터 변환 중 오류 발생:", vectorError);

        // 3. 벡터 변환 실패 시 생성했던 문서들 삭제
        const vectorIds = vectors.map((doc) => doc.id);
        await prisma.vector.deleteMany({
          where: {
            id: { in: vectorIds },
          },
        });

        // 오류 다시 던지기
        throw new Error(`벡터 변환 실패로 문서 생성이 롤백됨: ${vectorError}`);
      }
    } catch (err) {
      throw err;
    }
  }
}
