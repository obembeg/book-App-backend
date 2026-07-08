/*
  Warnings:

  - You are about to drop the column `createdAt` on the `categories` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "books" ALTER COLUMN "price" DROP NOT NULL,
ALTER COLUMN "price" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "categories" DROP COLUMN "createdAt",
ADD COLUMN     "description" TEXT;
