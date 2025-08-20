import {
  diaryFullTextSearchByAccuracy,
  diaryFullTextSearchByDate,
} from "~/prisma/generated/client/sql";
import { prisma } from "~/utils/db";

export async function fullTextSearch(
  userId: string,
  searchTerm: string,
  options: {
    take: number;
    skip: number;
    sort?: "accuracy" | "latest" | "oldest";
  },
) {
  const sort = options.sort || "accuracy";

  if (sort === "accuracy") {
    const result = await prisma.$queryRawTyped(
      diaryFullTextSearchByAccuracy(
        userId,
        searchTerm,
        options.take,
        options.skip,
      ),
    );

    return {
      diaries: result,
      total: Number(result[0].total),
    };
  } else if (sort === "latest") {
    const result = await prisma.$queryRawTyped(
      diaryFullTextSearchByDate(
        userId,
        searchTerm,
        options.take,
        options.skip,
        "DESC",
      ),
    );

    return {
      diaries: result,
      total: Number(result[0].total),
    };
  } else if (sort === "oldest") {
    const result = await prisma.$queryRawTyped(
      diaryFullTextSearchByDate(
        userId,
        searchTerm,
        options.take,
        options.skip,
        "ASC",
      ),
    );

    return {
      diaries: result,
      total: Number(result[0].total),
    };
  }
}
