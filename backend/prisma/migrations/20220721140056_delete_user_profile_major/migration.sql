/*
  Warnings:

  - You are about to drop the column `major` on the `user_profile` table. All the data in the column will be lost.
  - Made the column `real_name` on table `user_profile` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "user_profile" DROP COLUMN "major",
ALTER COLUMN "real_name" SET NOT NULL;
