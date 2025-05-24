-- DropForeignKey
ALTER TABLE "embedding" DROP CONSTRAINT "embedding_diaryId_fkey";

-- DropForeignKey
ALTER TABLE "embedding" DROP CONSTRAINT "embedding_memoryId_fkey";

-- DropForeignKey
ALTER TABLE "memory" DROP CONSTRAINT "memory_diaryId_fkey";

-- AddForeignKey
ALTER TABLE "embedding" ADD CONSTRAINT "embedding_diaryId_fkey" FOREIGN KEY ("diaryId") REFERENCES "diary"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "embedding" ADD CONSTRAINT "embedding_memoryId_fkey" FOREIGN KEY ("memoryId") REFERENCES "memory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "memory" ADD CONSTRAINT "memory_diaryId_fkey" FOREIGN KEY ("diaryId") REFERENCES "diary"("id") ON DELETE CASCADE ON UPDATE CASCADE;
