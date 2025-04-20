/*
  Warnings:

  - Added the required column `content` to the `Vector` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Vector" ADD COLUMN     "content" TEXT NOT NULL;
