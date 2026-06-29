-- AlterTable
ALTER TABLE "products" ADD COLUMN     "dosage_form_id" UUID;

-- CreateTable
CREATE TABLE "dosage_forms" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "dosage_forms_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "dosage_forms_name_key" ON "dosage_forms"("name");

-- CreateIndex
CREATE INDEX "dosage_forms_name_idx" ON "dosage_forms"("name");

-- CreateIndex
CREATE INDEX "dosage_forms_is_active_idx" ON "dosage_forms"("is_active");

-- CreateIndex
CREATE INDEX "products_dosage_form_id_idx" ON "products"("dosage_form_id");

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_dosage_form_id_fkey" FOREIGN KEY ("dosage_form_id") REFERENCES "dosage_forms"("id") ON DELETE SET NULL ON UPDATE CASCADE;
