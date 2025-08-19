import {
  memoryFullTextSearchByAccuracy,
  memoryFullTextSearchByDate,
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
      memoryFullTextSearchByAccuracy(
        userId,
        searchTerm,
        options.take,
        options.skip,
      ),
    );

    return {
      memories: result,
      total: Number(result[0].total),
    };
  } else if (sort === "latest") {
    const result = await prisma.$queryRawTyped(
      memoryFullTextSearchByDate(
        userId,
        searchTerm,
        options.take,
        options.skip,
        "DESC",
      ),
    );

    return {
      memories: result,
      total: Number(result[0].total),
    };
  } else if (sort === "oldest") {
    const result = await prisma.$queryRawTyped(
      memoryFullTextSearchByDate(
        userId,
        searchTerm,
        options.take,
        options.skip,
        "ASC",
      ),
    );

    return {
      memories: result,
      total: Number(result[0].total),
    };
  } else {
    throw new Error(`Unknown sort option: ${options.sort}`);
  }
}
