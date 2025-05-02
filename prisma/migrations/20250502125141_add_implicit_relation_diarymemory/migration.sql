/*
  Warnings:

  - You are about to drop the column `diaryId` on the `memory` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "memory" DROP CONSTRAINT "memory_diaryId_fkey";

-- AlterTable
ALTER TABLE "memory" DROP COLUMN "diaryId";

-- CreateTable
CREATE TABLE "_diary_memory" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_diary_memory_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_diary_memory_B_index" ON "_diary_memory"("B");

-- AddForeignKey
ALTER TABLE "_diary_memory" ADD CONSTRAINT "_diary_memory_A_fkey" FOREIGN KEY ("A") REFERENCES "diary"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_diary_memory" ADD CONSTRAINT "_diary_memory_B_fkey" FOREIGN KEY ("B") REFERENCES "memory"("id") ON DELETE CASCADE ON UPDATE CASCADE;
