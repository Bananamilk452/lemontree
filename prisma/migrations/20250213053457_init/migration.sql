-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "vector";

-- CreateTable
CREATE TABLE "Diary" (
    "id" SERIAL NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "embedding" vector,
    "sentiment" TEXT,
    "summary" TEXT,
    "keywords" TEXT[],

    CONSTRAINT "Diary_pkey" PRIMARY KEY ("id")
);
