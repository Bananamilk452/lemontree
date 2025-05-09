import { ChatVertexAI } from "@langchain/google-vertexai";
import { Memory } from "@prisma/client";
import { getRelatedMemories as getRelatedMemoriesQuery } from "@prisma/client/sql";
import { format } from "date-fns";

import { vectorStore } from "~/lib/langchain";
import {
  createMemoryPromptTemplate,
  CreateMemorySchema,
  createMemorySchema,
} from "~/lib/prompts";
import { prisma } from "~/utils/db";
import { logger } from "~/utils/logger";

export async function createMemory(diaryId: string, userId: string) {
  const jobId = crypto.randomUUID();
  logger.info(`[${jobId}] createMemory 작업 시작: diaryId: ${diaryId}`);

  const diary = await prisma.diary.findUnique({
    where: { id: diaryId },
    include: {
      _count: {
        select: {
          embeddings: true,
        },
      },
    },
  });

  if (!diary) {
    throw new Error(`다이어리 없음: ${diaryId}`);
  }

  if (diary._count.embeddings <= 0) {
    throw new Error(`임베딩 없음: ${diaryId}`);
  }

  const model = new ChatVertexAI({
    model: "gemini-2.5-flash-preview-04-17",
    temperature: 0.2,
    maxReasoningTokens: 0,
  });

  const modelWithStructure = model.withStructuredOutput(createMemorySchema);

  const relatedMemories = await getRelatedMemories(diary.id);
  logger.info(
    `[${jobId}] 관련 메모리: ${JSON.stringify(relatedMemories, null, 2)}`,
  );

  const promptValue = await createMemoryPromptTemplate.invoke({
    user_text: diary.content,
    current_date: format(diary.date, "yyyy-MM-dd"),
    similar_memories: JSON.stringify(
      relatedMemories.map((memory) => ({
        date: format(memory.date, "yyyy-MM-dd"),
        content: memory.content,
      })),
      null,
      2,
    ),
  });

  const { memories } = await modelWithStructure.invoke(promptValue);
  logger.info(`[${jobId}] 추론한 메모리: ${JSON.stringify(memories, null, 2)}`);

  const newMemories = await addNewMemories(diaryId, userId, memories);

  try {
    const result = await createMemoryEmbedding(newMemories);

    logger.info(
      `[${jobId}] createMemory 작업 완료: diaryId: ${diaryId}, vectorCounts: ${result.embeddings.length}`,
    );
    return result;
  } catch (error) {
    const memoryIds = newMemories.map((memory) => memory.id);

    await prisma.memory.deleteMany({
      where: {
        id: { in: memoryIds },
      },
    });

    await prisma.embedding.deleteMany({
      where: {
        memoryId: { in: memoryIds },
      },
    });
    logger.error(
      `[${jobId}] createMemory 작업 중 에러로 메모리 생성이 롤백됨. 에러: ${error}`,
    );
    throw new Error(
      `createMemory 작업 중 에러로 메모리 생성이 롤백됨. 에러: ${error}`,
    );
  }
}

async function addNewMemories(
  diaryId: string,
  userId: string,
  memories: CreateMemorySchema[],
) {
  const results = await prisma.$transaction(
    memories.map((memory) =>
      prisma.memory.create({
        data: {
          content: memory,
          userId,
          diaryId,
        },
      }),
    ),
  );

  return results;
}

async function createMemoryEmbedding(memories: Memory[]) {
  const embeddings = await prisma.$transaction(
    memories.map((memory) =>
      prisma.embedding.create({
        data: {
          content: memory.content,
          memoryId: memory.id,
        },
      }),
    ),
  );

  await vectorStore.addModels(embeddings);

  return { memories, embeddings };
}

async function getRelatedMemories(diaryId: string) {
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
}
