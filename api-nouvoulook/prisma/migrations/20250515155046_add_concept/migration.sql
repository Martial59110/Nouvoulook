-- CreateTable
CREATE TABLE "boutique" (
    "id" TEXT NOT NULL,
    "image_url" TEXT NOT NULL,
    "image1" TEXT,
    "image2" TEXT,
    "image3" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "boutique_pkey" PRIMARY KEY ("id")
);
