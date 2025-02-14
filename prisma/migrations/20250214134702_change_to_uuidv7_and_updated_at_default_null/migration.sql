/*
  Warnings:

  - The primary key for the `Diary` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE "Diary" DROP CONSTRAINT "Diary_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "updatedAt" DROP NOT NULL,
ALTER COLUMN "updatedAt" DROP DEFAULT,
ADD CONSTRAINT "Diary_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Diary_id_seq";
