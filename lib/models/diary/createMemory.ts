import { ChatVertexAI } from "@langchain/google-vertexai";
import { Memory } from "@prisma/client";
import { format } from "date-fns";

import { vectorStore } from "~/lib/langchain";
import { diary as Diary } from "~/lib/models/diary";
import {
  createMemoryPromptTemplate,
  CreateMemorySchema,
  createMemorySchema,
} from "~/lib/prompts";
import { prisma } from "~/utils/db";
import { logger } from "~/utils/logger";
import { createQueue } from "~/utils/queueFactory";
import { singleton } from "~/utils/singleton";

import type { Job } from "bullmq";

interface Data {
  diaryId: string;
}

async function processMemory(job: Job<Data>) {
  logger.info(`Job ${job.name}#${job.id} 메모리 생성 진행`);

  const diary = await Diary.getDiaryById(job.data.diaryId);

  if (!diary) {
    throw new Error(`다이어리 없음: ${job.data.diaryId}`);
  }

  const model = new ChatVertexAI({
    model: "gemini-2.5-flash-preview-04-17",
    temperature: 0.9,
    maxReasoningTokens: 0,
  });

  const modelWithStructure = model.withStructuredOutput(createMemorySchema);

  const relatedMemories = (await Diary.getRelatedMemories(diary.id)).map(
    (memory) => ({
      id: memory.memoryId,
      content: memory.content,
    }),
  );

  const promptValue = await createMemoryPromptTemplate.invoke({
    user_text: diary.content,
    current_date: format(diary.date, "yyyy-MM-dd"),
    similar_memories: JSON.stringify(relatedMemories, null, 2),
  });

  const { memories } = await modelWithStructure.invoke(promptValue);

  const newMemories = await processNewMemories(job.data.diaryId, memories);
  const updateMemories = await processUpdateMemories(memories);
  await processDeleteMemories(memories);

  const result = await createMemoryEmbedding(
    job.data.diaryId,
    newMemories,
    updateMemories,
  );

  return result;
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
          diaryId: diaryId,
        },
      }),
    ),
  );

  return results;
}

async function processUpdateMemories(memories: CreateMemorySchema[]) {
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
        where: { id: memory.id! },
        data: {
          content: memory.content!,
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
        where: { id: memory.id! },
      }),
      prisma.embedding.deleteMany({
        where: { memoryId: memory.id! },
      }),
    ]),
  );

  return results;
}

async function createMemoryEmbedding(
  diaryId: string,
  newMemories: Memory[],
  updateMemories: Memory[],
) {
  // UPDATE의 경우는 embedding을 삭제하고 새로 생성해야 함
  await prisma.$transaction(
    updateMemories.map((memory) =>
      prisma.embedding.deleteMany({
        where: { memoryId: memory.id! },
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

  try {
    await vectorStore.addModels(embeddings);

    return { memories, embeddings };
  } catch (vectorError) {
    logger.error("벡터 변환 중 오류 발생:", vectorError);

    const vectorIds = embeddings.map((doc) => doc.id);
    await prisma.embedding.deleteMany({
      where: {
        id: { in: vectorIds },
      },
    });
    await prisma.memory.deleteMany({
      where: {
        id: { in: memories.map((memory) => memory.id) },
      },
    });

    throw new Error(`벡터 변환 실패로 메모리 생성이 롤백됨: ${vectorError}`);
  }
}

export const createMemoryQueue = singleton("createMemoryQueue", () =>
  createQueue<Data>("createMemory", processMemory),
);
