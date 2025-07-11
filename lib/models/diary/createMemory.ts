import { ChatVertexAI } from "@langchain/google-vertexai";
import { Memory } from "@prisma/client";
import { getRelatedMemories as getRelatedMemoriesQuery } from "@prisma/client/sql";
import { format } from "date-fns";

import { vectorStore } from "~/lib/langchain";
import { createMemoryPromptTemplate, CreateMemorySchema } from "~/lib/prompts";
import { prisma } from "~/utils/db";
import { ApplicationError, NotFoundError } from "~/utils/error";
import { logger } from "~/utils/logger";

export async function createMemory(diaryId: string, userId: string) {
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
    throw new NotFoundError("일기를 찾을 수 없습니다.");
  }

  if (diary._count.embeddings <= 0) {
    throw new NotFoundError("임베딩을 찾을 수 없습니다.");
  }

  const model = new ChatVertexAI({
    model: "gemini-2.5-flash",
    temperature: 0.2,
    maxReasoningTokens: 0,
  });

  const relatedMemories = await getRelatedMemories(diary.id);
  logger.info(
    `[${diary.id}] 관련 메모리: ${JSON.stringify(relatedMemories, null, 2)}`,
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

  let rawMemories = (await model.invoke(promptValue)).text;
  rawMemories = rawMemories.replace("```json", "");
  rawMemories = rawMemories.replace("```", "");

  const { memories } = JSON.parse(rawMemories) as { memories: string[] };

  logger.info(
    `[${diary.id}] 추론한 메모리: ${JSON.stringify(memories, null, 2)}`,
  );

  const newMemories = await addNewMemories(diaryId, userId, memories);

  try {
    const result = await createMemoryEmbedding(newMemories);

    logger.info(
      `[${diary.id}] createMemory 작업 완료: diaryId: ${diaryId}, vectorCounts: ${result.embeddings.length}`,
    );
    return result;
  } catch (error) {
    const memoryIds = newMemories.map((memory) => memory.id);

    await prisma.memory.deleteMany({
      where: {
        id: { in: memoryIds },
      },
    });

    logger.error(
      `[${diary.id}] createMemory 작업 중 에러로 메모리 생성이 롤백됨. 에러: ${error}`,
    );
    throw new ApplicationError(
      "createMemory 작업 중 에러로 메모리 생성이 롤백됨",
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
