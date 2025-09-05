import { embeddings } from "~/lib/langchain";
import {
  memorySemanticSearchByAccuracy,
  memorySemanticSearchByDate,
} from "~/prisma/generated/client/sql";
import { prisma } from "~/utils/db";

export async function semanticSearch(
  userId: string,
  searchTerm: string,
  options: {
    take: number;
    skip: number;
    sort?: "accuracy" | "latest" | "oldest";
  },
) {
  const searchTermVector = JSON.stringify(
    await embeddings.embedQuery(searchTerm),
  );

  const sort = options.sort || "accuracy";

  if (sort === "accuracy") {
    const result = await prisma.$queryRawTyped(
      memorySemanticSearchByAccuracy(
        userId,
        searchTermVector,
        options.take,
        options.skip,
      ),
    );

    return {
      memories: result,
      total: result[0] ? Number(result[0].total) : 0,
    };
  } else if (sort === "latest") {
    const result = await prisma.$queryRawTyped(
      memorySemanticSearchByDate(
        userId,
        searchTermVector,
        options.take,
        options.skip,
        "DESC",
      ),
    );

    return {
      memories: result,
      total: result[0] ? Number(result[0].total) : 0,
    };
  } else if (sort === "oldest") {
    const result = await prisma.$queryRawTyped(
      memorySemanticSearchByDate(
        userId,
        searchTermVector,
        options.take,
        options.skip,
        "ASC",
      ),
    );

    return {
      memories: result,
      total: result[0] ? Number(result[0].total) : 0,
    };
  } else {
    throw new Error(`Unknown sort option: ${sort}`);
  }
}
