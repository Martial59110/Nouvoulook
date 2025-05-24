/*
  Warnings:

  - You are about to drop the column `history_id` on the `timeline_items` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "timeline_items" DROP CONSTRAINT "timeline_items_history_id_fkey";

-- DropIndex
DROP INDEX "timeline_items_history_id_idx";

-- AlterTable
ALTER TABLE "timeline_items" DROP COLUMN "history_id";
