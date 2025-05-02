import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

import { vectorStore } from "~/lib/langchain";
import { prisma } from "~/utils/db";
import { logger } from "~/utils/logger";

export async function createEmbedding(diaryId: string, content: string) {
  const jobId = crypto.randomUUID();
  logger.info(`[${jobId}] createEmbedding 작업 시작: diaryId: ${diaryId}`);

  const separators = ["\n\n", "\n", ".", "!", "?", ",", " ", ""];

  const splitter = new RecursiveCharacterTextSplitter({
    separators,
    chunkSize: 400,
    chunkOverlap: 70,
  });

  const texts = await splitter.splitText(content);
  const vectors = await prisma.$transaction(
    texts.map((content) =>
      prisma.embedding.create({
        data: { content, diaryId },
      }),
    ),
  );

  try {
    await vectorStore.addModels(vectors);

    logger.info(
      `[${jobId}] createEmbedding 작업 완료: diaryId: ${diaryId}, vectorCounts: ${vectors.length}`,
    );
    return {
      content,
      vectorCounts: vectors.length,
    };
  } catch (vectorError) {
    const vectorIds = vectors.map((doc) => doc.id);
    await prisma.embedding.deleteMany({
      where: {
        id: { in: vectorIds },
      },
    });

    logger.error(
      `[${jobId}] createEmbedding 작업 중 에러로 임베딩 생성이 롤백됨. 에러: ${vectorError}`,
    );
    throw new Error(
      `createEmbedding 작업 중 에러로 임베딩 생성이 롤백됨. 에러: ${vectorError}`,
    );
  }
}
