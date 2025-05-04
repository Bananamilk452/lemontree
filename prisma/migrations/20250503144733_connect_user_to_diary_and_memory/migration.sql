/*
  Warnings:

  - Added the required column `userId` to the `diary` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `memory` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "diary" ADD COLUMN     "userId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "memory" ADD COLUMN     "userId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "diary" ADD CONSTRAINT "diary_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "memory" ADD CONSTRAINT "memory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
