/*
  Warnings:

  - You are about to drop the `Diary` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Vector` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Vector" DROP CONSTRAINT "Vector_diaryId_fkey";

-- DropTable
DROP TABLE "Diary";

-- DropTable
DROP TABLE "Vector";

-- CreateTable
CREATE TABLE "diary" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "sentiment" TEXT,
    "summary" TEXT,
    "keywords" TEXT[],

    CONSTRAINT "diary_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "embedding" (
    "id" TEXT NOT NULL,
    "vector" vector(768),
    "content" TEXT NOT NULL,
    "diaryId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "embedding_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "embedding" ADD CONSTRAINT "embedding_diaryId_fkey" FOREIGN KEY ("diaryId") REFERENCES "diary"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
