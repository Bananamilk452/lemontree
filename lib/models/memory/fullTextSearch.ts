import { memoryFullTextSearch } from "@prisma/client/sql";

import { prisma } from "~/utils/db";

export async function fullTextSearch(
  userId: string,
  searchTerm: string,
  options: {
    limit: number;
    page: number;
  },
) {
  const searchResult = await prisma.$queryRawTyped(
    memoryFullTextSearch(userId, searchTerm, options.limit, options.page),
  );

  return searchResult;
}
