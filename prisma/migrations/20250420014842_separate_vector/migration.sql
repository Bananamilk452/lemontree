/*
  Warnings:

  - You are about to drop the column `embedding` on the `Diary` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Diary" DROP COLUMN "embedding";

-- CreateTable
CREATE TABLE "Vector" (
    "id" TEXT NOT NULL,
    "vector" vector,
    "diaryId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "Vector_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Vector" ADD CONSTRAINT "Vector_diaryId_fkey" FOREIGN KEY ("diaryId") REFERENCES "Diary"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
