import { ChatVertexAI } from "@langchain/google-vertexai";
import { format } from "date-fns";
import { createAgent, providerStrategy, tool } from "langchain";
import z from "zod";

import { vectorStore } from "~/lib/langchain";
import {
  createMemorySchema,
  CreateMemorySchema,
  createMemorySystemPrompt,
} from "~/lib/prompts";
import { Memory } from "~/prisma/generated/client";
import { getRelatedMemories as getRelatedMemoriesQuery } from "~/prisma/generated/client/sql";
import { prisma } from "~/utils/db";
import { ApplicationError, NotFoundError } from "~/utils/error";

import { semanticSearch } from "../memory/semanticSearch";

const getMemoriesByDate = tool(
  async ({ date }) => {
    const parsedDate = new Date(
      Date.UTC(
        parseInt(date.slice(0, 4)),
        parseInt(date.slice(5, 7)) - 1,
        parseInt(date.slice(8, 10)),
      ),
    );

    const memories = await prisma.memory.findMany({
      where: {
        diary: {
          date: parsedDate,
        },
      },
    });

    return memories.map((memory) => memory.content).join("\n");
  },
  {
    name: "get_memories_by_date",
    description:
      "주어진 날짜에 기록된 모든 메모리를 반환합니다. 입력은 'date' 필드를 포함하는 객체여야 하며, 'date'는 'YYYY-MM-DD' 형식의 문자열입니다. 출력은 해당 날짜에 기록된 메모리의 배열입니다.",
    schema: z.object({
      date: z.string().refine((val) => /^\d{4}-\d{2}-\d{2}$/.test(val), {
        message: "date must be in YYYY-MM-DD format",
      }),
    }),
  },
);

const createSearchMemoriesTool = (userId: string) => {
  return tool(
    async ({ query, page }: { query: string; page: number }) => {
      const searchResult = await semanticSearch(userId, query, {
        take: 5,
        skip: (page - 1) * 5,
        sort: "accuracy",
      });

      return searchResult.memories
        .map((memory) => `내용: ${memory.content} 유사도: ${memory.score}`)
        .join("\n");
    },
    {
      name: "search_memories",
      description:
        "주어진 쿼리와 관련된 메모리를 Semantic Search합니다. 한번에 최대 5개가 출력되며, 입력은 'query'와 'page' 필드를 반드시 포함하는 객체여야 합니다. 'query'는 검색할 문자열이고, 'page'는 1부터 시작하는 결과의 페이지 번호입니다. 출력은 관련 메모리의 배열입니다.",
      schema: z.object({
        query: z.string(),
        page: z.number().min(1).default(1),
      }),
    },
  );
};

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

  const searchMemories = createSearchMemoriesTool(userId);
  const agent = createAgent({
    model,
    tools: [getMemoriesByDate, searchMemories],
    systemPrompt: createMemorySystemPrompt,
    responseFormat: providerStrategy(createMemorySchema),
  });

  const relatedMemories = await getRelatedMemories(diary.id);
  const similarMemories = JSON.stringify(
    relatedMemories.map((memory) => ({
      date: format(memory.date, "yyyy-MM-dd"),
      content: memory.content,
    })),
    null,
    2,
  );

  const { structuredResponse } = await agent.invoke({
    messages: [
      {
        role: "user",
        content: `user_text: ${diary.content}
current_date: ${format(diary.date, "yyyy-MM-dd")}
similar_memories: ${similarMemories}`,
      },
    ],
  });

  const newMemories = await addNewMemories(
    diaryId,
    userId,
    structuredResponse.memories,
  );

  try {
    const result = await createMemoryEmbedding(newMemories);
    return result;
  } catch (error) {
    const memoryIds = newMemories.map((memory) => memory.id);

    await prisma.memory.deleteMany({
      where: {
        id: { in: memoryIds },
      },
    });

    console.error("createMemoryEmbedding error:", error);
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
