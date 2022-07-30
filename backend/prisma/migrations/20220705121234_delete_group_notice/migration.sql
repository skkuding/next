/*
  Warnings:

  - You are about to drop the column `top_fixed` on the `notice` table. All the data in the column will be lost.
  - You are about to drop the `group_notice` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `group_id` to the `notice` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title` to the `notice` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "group_notice" DROP CONSTRAINT "group_notice_group_id_fkey";

-- DropForeignKey
ALTER TABLE "group_notice" DROP CONSTRAINT "group_notice_notice_id_fkey";

-- AlterTable
ALTER TABLE "notice" DROP COLUMN "top_fixed",
ADD COLUMN     "fixed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "group_id" INTEGER NOT NULL,
ADD COLUMN     "title" TEXT NOT NULL;

-- DropTable
DROP TABLE "group_notice";

-- AddForeignKey
ALTER TABLE "notice" ADD CONSTRAINT "notice_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "group"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
