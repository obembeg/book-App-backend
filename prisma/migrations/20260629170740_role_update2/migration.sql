/*
  Warnings:

  - You are about to drop the column `isAllowed` on the `books` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "books" DROP COLUMN "isAllowed";

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "isAllowed" BOOLEAN NOT NULL DEFAULT true;
