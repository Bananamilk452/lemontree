import { diarySemanticSearch } from "@prisma/client/sql";

import { embeddings } from "~/lib/langchain";
import { prisma } from "~/utils/db";

export async function semanticSearch(
  userId: string,
  searchTerm: string,
  options: {
    limit: number;
    page: number;
  },
) {
  const searchTermVector = await embeddings.embedQuery(searchTerm);

  const searchResult = await prisma.$queryRawTyped(
    diarySemanticSearch(
      userId,
      JSON.stringify(searchTermVector),
      options.limit,
      options.page,
    ),
  );

  return searchResult;
}
