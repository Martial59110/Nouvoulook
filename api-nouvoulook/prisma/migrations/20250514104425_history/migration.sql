-- CreateTable
CREATE TABLE "history" (
    "id" TEXT NOT NULL,
    "image_url" TEXT NOT NULL,
    "text_content" TEXT NOT NULL,
    "text_content2" TEXT NOT NULL,
    "text_content3" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "timeline_items" (
    "id" TEXT NOT NULL,
    "year" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "history_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "timeline_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "timeline_items_history_id_idx" ON "timeline_items"("history_id");

-- AddForeignKey
ALTER TABLE "timeline_items" ADD CONSTRAINT "timeline_items_history_id_fkey" FOREIGN KEY ("history_id") REFERENCES "history"("id") ON DELETE CASCADE ON UPDATE CASCADE;
