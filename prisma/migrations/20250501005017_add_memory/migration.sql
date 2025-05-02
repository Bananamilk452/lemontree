-- DropForeignKey
ALTER TABLE "embedding" DROP CONSTRAINT "embedding_diaryId_fkey";

-- AlterTable
ALTER TABLE "embedding" ADD COLUMN     "memoryId" TEXT,
ALTER COLUMN "diaryId" DROP NOT NULL;

-- CreateTable
CREATE TABLE "memory" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "diaryId" TEXT NOT NULL,
    "embeddingId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "memory_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "embedding" ADD CONSTRAINT "embedding_diaryId_fkey" FOREIGN KEY ("diaryId") REFERENCES "diary"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "embedding" ADD CONSTRAINT "embedding_memoryId_fkey" FOREIGN KEY ("memoryId") REFERENCES "memory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "memory" ADD CONSTRAINT "memory_diaryId_fkey" FOREIGN KEY ("diaryId") REFERENCES "diary"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
