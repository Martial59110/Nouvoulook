/*
  Warnings:

  - You are about to drop the column `image_url` on the `history` table. All the data in the column will be lost.
  - You are about to drop the column `text_content` on the `history` table. All the data in the column will be lost.
  - You are about to drop the column `text_content2` on the `history` table. All the data in the column will be lost.
  - You are about to drop the column `text_content3` on the `history` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "history" DROP COLUMN "image_url",
DROP COLUMN "text_content",
DROP COLUMN "text_content2",
DROP COLUMN "text_content3",
ADD COLUMN     "image1" TEXT,
ADD COLUMN     "image2" TEXT,
ADD COLUMN     "image3" TEXT,
ADD COLUMN     "imageUrl" TEXT,
ADD COLUMN     "textContent" TEXT,
ADD COLUMN     "textContent2" TEXT,
ADD COLUMN     "textContent3" TEXT;
