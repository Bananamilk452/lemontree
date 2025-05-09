/*
  Warnings:

  - You are about to drop the `_diary_memory` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_diary_memory" DROP CONSTRAINT "_diary_memory_A_fkey";

-- DropForeignKey
ALTER TABLE "_diary_memory" DROP CONSTRAINT "_diary_memory_B_fkey";

-- AlterTable
ALTER TABLE "memory" ADD COLUMN     "diaryId" TEXT;

-- DropTable
DROP TABLE "_diary_memory";

-- AddForeignKey
ALTER TABLE "memory" ADD CONSTRAINT "memory_diaryId_fkey" FOREIGN KEY ("diaryId") REFERENCES "diary"("id") ON DELETE SET NULL ON UPDATE CASCADE;
