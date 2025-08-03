import { PrismaVectorStore } from "@langchain/community/vectorstores/prisma";
import { VertexAIEmbeddings } from "@langchain/google-vertexai";
import { Embedding, Prisma } from "@prisma/client";

import { prisma } from "~/utils/db";

export const embeddings = new VertexAIEmbeddings({
  model: "gemini-embedding-001",
});

export const vectorStore = PrismaVectorStore.withModel<Embedding>(
  prisma,
).create(embeddings, {
  prisma: Prisma,
  // @ts-expect-error Embedding 테이블이 embedding으로 매핑되어있음
  tableName: "embedding",
  vectorColumnName: "vector",
  columns: {
    id: PrismaVectorStore.IdColumn,
    content: PrismaVectorStore.ContentColumn,
  },
});
