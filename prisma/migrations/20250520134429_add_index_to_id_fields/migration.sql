-- CreateIndex
CREATE INDEX "diary_userId_idx" ON "diary"("userId");

-- CreateIndex
CREATE INDEX "diary_date_idx" ON "diary"("date");

-- CreateIndex
CREATE INDEX "embedding_diaryId_idx" ON "embedding"("diaryId");

-- CreateIndex
CREATE INDEX "embedding_memoryId_idx" ON "embedding"("memoryId");

-- CreateIndex
CREATE INDEX "memory_userId_idx" ON "memory"("userId");

-- CreateIndex
CREATE INDEX "memory_diaryId_idx" ON "memory"("diaryId");
