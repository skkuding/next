/*
  Warnings:

  - You are about to drop the column `has_email_authenticated` on the `user` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "user" DROP COLUMN "has_email_authenticated";
