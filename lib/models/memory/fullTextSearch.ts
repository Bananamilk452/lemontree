import { memoryFullTextSearch } from "@prisma/client/sql";

import { prisma } from "~/utils/db";

export async function fullTextSearch(
  userId: string,
  searchTerm: string,
  options: {
    take: number;
    skip: number;
  },
) {
  const searchResult = await prisma.$queryRawTyped(
    memoryFullTextSearch(userId, searchTerm, options.take, options.skip),
  );

  return searchResult;
}
