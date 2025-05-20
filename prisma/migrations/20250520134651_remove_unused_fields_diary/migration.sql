/*
  Warnings:

  - You are about to drop the column `keywords` on the `diary` table. All the data in the column will be lost.
  - You are about to drop the column `sentiment` on the `diary` table. All the data in the column will be lost.
  - You are about to drop the column `summary` on the `diary` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "diary" DROP COLUMN "keywords",
DROP COLUMN "sentiment",
DROP COLUMN "summary";
