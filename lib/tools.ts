import { format } from "date-fns";
import { tool } from "langchain";
import z from "zod";

import { stringToUTCDate } from "~/utils";
import { prisma } from "~/utils/db";

import { semanticSearch } from "./models/memory/semanticSearch";

export const createGetMemoriesByDateTool = (userId: string) => {
  return tool(
    async ({ date }) => {
      const parsedDate = stringToUTCDate(date);

      const memories = await prisma.memory.findMany({
        where: {
          diary: {
            date: parsedDate,
            userId: userId,
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
};

export const createSearchMemoriesTool = (userId: string) => {
  return tool(
    async ({ query, page }: { query: string; page: number }) => {
      const searchResult = await semanticSearch(userId, query, {
        take: 10,
        skip: (page - 1) * 10,
        sort: "accuracy",
      });

      return searchResult.memories
        .map((memory) => `내용: ${memory.content} 유사도: ${memory.score}`)
        .join("\n");
    },
    {
      name: "search_memories",
      description:
        "주어진 쿼리와 관련된 메모리를 Semantic Search합니다. 한번에 최대 10개가 출력되며, 입력은 'query'와 'page' 필드를 반드시 포함하는 객체여야 합니다. 'query'는 검색할 문자열이고, 'page'는 1부터 시작하는 결과의 페이지 번호입니다. 출력은 관련 메모리의 배열입니다.",
      schema: z.object({
        query: z.string(),
        page: z.number().min(1).default(1),
      }),
    },
  );
};

export const createGetDiariesByDateTool = (userId: string) => {
  return tool(
    async ({ startDate, endDate }) => {
      const start = stringToUTCDate(startDate);
      const end = stringToUTCDate(endDate);

      const diaries = await prisma.diary.findMany({
        where: {
          userId: userId,
          date: {
            gte: start,
            lte: end,
          },
        },
      });

      return (
        `총 갯수: ${diaries.length}\n` +
        diaries
          .map(
            (diary) =>
              `날짜: ${format(diary.date, "yyyy-MM-dd")}\n내용: ${diary.content}`,
          )
          .join("\n")
      );
    },
    {
      name: "get_diaries_by_date",
      description:
        '주어진 시작 날짜와 종료 날짜 사이에 작성된 모든 일기를 반환합니다. 입력은 "startDate"와 "endDate" 필드를 포함하는 객체여야 하며, 두 필드 모두 "YYYY-MM-DD" 형식의 문자열입니다. 출력은 해당 기간에 작성된 일기의 배열입니다.',
      schema: z.object({
        startDate: z.string().refine((val) => /^\d{4}-\d{2}-\d{2}$/.test(val), {
          message: "startDate must be in YYYY-MM-DD format",
        }),
        endDate: z.string().refine((val) => /^\d{4}-\d{2}-\d{2}$/.test(val), {
          message: "endDate must be in YYYY-MM-DD format",
        }),
      }),
    },
  );
};
