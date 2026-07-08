/*
  Warnings:

  - Made the column `provider` on table `users` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "users" ALTER COLUMN "provider" SET NOT NULL;
