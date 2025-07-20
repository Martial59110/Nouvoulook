/*
  Warnings:

  - You are about to drop the column `image1` on the `history` table. All the data in the column will be lost.
  - You are about to drop the column `image2` on the `history` table. All the data in the column will be lost.
  - You are about to drop the column `image3` on the `history` table. All the data in the column will be lost.
  - You are about to drop the column `textContent` on the `history` table. All the data in the column will be lost.
  - You are about to drop the column `textContent2` on the `history` table. All the data in the column will be lost.
  - You are about to drop the column `textContent3` on the `history` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "history" DROP COLUMN "image1",
DROP COLUMN "image2",
DROP COLUMN "image3",
DROP COLUMN "textContent",
DROP COLUMN "textContent2",
DROP COLUMN "textContent3";

-- AlterTable
ALTER TABLE "timeline_items" ADD COLUMN     "color" TEXT NOT NULL DEFAULT '#E23E57',
ADD COLUMN     "icon" TEXT NOT NULL DEFAULT 'bi-star-fill';

-- CreateTable
CREATE TABLE "history_sections" (
    "id" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "image_url" TEXT,
    "text_content" TEXT,
    "history_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "history_sections_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "history_sections" ADD CONSTRAINT "history_sections_history_id_fkey" FOREIGN KEY ("history_id") REFERENCES "history"("id") ON DELETE CASCADE ON UPDATE CASCADE;
