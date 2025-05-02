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

export async function createMemory(diaryId: string) {
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
    temperature: 0.9,
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
        id: memory.memoryId,
        content: memory.content,
      })),
      null,
      2,
    ),
  });

  const { memories } = await modelWithStructure.invoke(promptValue);
  logger.info(`[${jobId}] 추론한 메모리: ${JSON.stringify(memories, null, 2)}`);

  try {
    const newMemories = await processNewMemories(diaryId, memories);
    const updateMemories = await processUpdateMemories(diaryId, memories);
    await processDeleteMemories(memories);

    const result = await createMemoryEmbedding(newMemories, updateMemories);

    logger.info(
      `[${jobId}] createMemory 작업 완료: diaryId: ${diaryId}, vectorCounts: ${result.embeddings.length}`,
    );
    return result;
  } catch (error) {
    const memoryIds = memories
      .map((memory) => memory.id)
      .filter((id): id is string => typeof id === "string");

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

async function processNewMemories(
  diaryId: string,
  memories: CreateMemorySchema[],
) {
  const newMemories = memories.filter((memory) => memory.operation === "NEW");

  if (newMemories.some((memory) => !memory.content)) {
    throw new Error("NEW 메모리의 content가 없습니다.");
  }

  const results = await prisma.$transaction(
    newMemories.map((memory) =>
      prisma.memory.create({
        data: {
          content: memory.content!,
          diaries: {
            connect: {
              id: diaryId,
            },
          },
        },
      }),
    ),
  );

  return results;
}

async function processUpdateMemories(
  diaryId: string,
  memories: CreateMemorySchema[],
) {
  const updateMemories = memories.filter(
    (memory) => memory.operation === "UPDATE",
  );

  if (updateMemories.some((memory) => !memory.id)) {
    throw new Error("UPDATE 메모리의 id가 없습니다.");
  }

  if (updateMemories.some((memory) => !memory.content)) {
    throw new Error("UPDATE 메모리의 content가 없습니다.");
  }

  const results = await prisma.$transaction(
    updateMemories.map((memory) =>
      prisma.memory.update({
        where: { id: memory.id },
        data: {
          content: memory.content,
          diaries: {
            connect: {
              id: diaryId,
            },
          },
        },
      }),
    ),
  );

  return results;
}

async function processDeleteMemories(memories: CreateMemorySchema[]) {
  const deleteMemories = memories.filter(
    (memory) => memory.operation === "DELETE",
  );

  if (deleteMemories.some((memory) => !memory.id)) {
    throw new Error("DELETE 메모리의 id가 없습니다.");
  }

  const results = await prisma.$transaction(
    deleteMemories.flatMap((memory) => [
      prisma.memory.delete({
        where: { id: memory.id },
      }),
      prisma.embedding.deleteMany({
        where: { memoryId: memory.id },
      }),
    ]),
  );

  return results;
}

async function createMemoryEmbedding(
  newMemories: Memory[],
  updateMemories: Memory[],
) {
  // UPDATE의 경우는 embedding을 삭제하고 새로 생성해야 함
  await prisma.$transaction(
    updateMemories.map((memory) =>
      prisma.embedding.deleteMany({
        where: { memoryId: memory.id },
      }),
    ),
  );

  const memories = [...newMemories, ...updateMemories];

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
