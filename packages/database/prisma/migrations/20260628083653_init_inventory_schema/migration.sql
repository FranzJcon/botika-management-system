-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'STAFF');

-- CreateEnum
CREATE TYPE "ProductStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'DISCONTINUED');

-- CreateEnum
CREATE TYPE "ProductType" AS ENUM ('MEDICINE', 'NON_MEDICINE');

-- CreateEnum
CREATE TYPE "StockInSourceType" AS ENUM ('MANUAL', 'EXCEL', 'CSV', 'OCR', 'WO_POS_MIGRATION');

-- CreateEnum
CREATE TYPE "StockInStatus" AS ENUM ('DRAFT', 'POSTED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "InventoryBatchStatus" AS ENUM ('AVAILABLE', 'DEPLETED', 'EXPIRED', 'DAMAGED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "StockLedgerMovementType" AS ENUM ('STOCK_IN', 'ADJUSTMENT_ADD', 'ADJUSTMENT_REMOVE', 'EXPIRED', 'DAMAGED', 'RETURN_TO_SUPPLIER', 'CORRECTION');

-- CreateEnum
CREATE TYPE "ImportJobStatus" AS ENUM ('UPLOADED', 'PROCESSING', 'NEEDS_REVIEW', 'REVIEWED', 'IMPORTED', 'FAILED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ImportItemReviewStatus" AS ENUM ('PENDING', 'MATCHED', 'NEEDS_REVIEW', 'APPROVED', 'REJECTED', 'IMPORTED');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "display_name" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'STAFF',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "categories" (
    "id" UUID NOT NULL,
    "parent_id" UUID,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_classifications" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_classifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "generic_drugs" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "generic_drugs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "products" (
    "id" UUID NOT NULL,
    "category_id" UUID,
    "classification_id" UUID,
    "generic_drug_id" UUID,
    "sku" TEXT,
    "name" TEXT NOT NULL,
    "generic_name" TEXT,
    "brand_name" TEXT,
    "dosage_form" TEXT,
    "strength" TEXT,
    "unit" TEXT NOT NULL DEFAULT 'piece',
    "product_type" "ProductType" NOT NULL DEFAULT 'NON_MEDICINE',
    "default_selling_price" DECIMAL(12,2),
    "reorder_level" DECIMAL(12,3) NOT NULL DEFAULT 0,
    "requires_prescription" BOOLEAN NOT NULL DEFAULT false,
    "requires_expiry_tracking" BOOLEAN NOT NULL DEFAULT false,
    "requires_lot_tracking" BOOLEAN NOT NULL DEFAULT false,
    "status" "ProductStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_aliases" (
    "id" UUID NOT NULL,
    "product_id" UUID NOT NULL,
    "alias" TEXT NOT NULL,
    "source" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "product_aliases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_barcodes" (
    "id" UUID NOT NULL,
    "product_id" UUID NOT NULL,
    "barcode" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "product_barcodes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "suppliers" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "contact_info" TEXT,
    "notes" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "suppliers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stock_ins" (
    "id" UUID NOT NULL,
    "supplier_id" UUID,
    "received_by_user_id" UUID NOT NULL,
    "import_job_id" UUID,
    "source_type" "StockInSourceType" NOT NULL,
    "invoice_number" TEXT,
    "received_date" DATE NOT NULL,
    "notes" TEXT,
    "status" "StockInStatus" NOT NULL DEFAULT 'DRAFT',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "stock_ins_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stock_in_items" (
    "id" UUID NOT NULL,
    "stock_in_id" UUID NOT NULL,
    "product_id" UUID NOT NULL,
    "quantity" DECIMAL(12,3) NOT NULL,
    "buying_price" DECIMAL(12,2) NOT NULL,
    "selling_price" DECIMAL(12,2),
    "expiration_date" DATE,
    "lot_number" TEXT,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "stock_in_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventory_batches" (
    "id" UUID NOT NULL,
    "product_id" UUID NOT NULL,
    "stock_in_item_id" UUID NOT NULL,
    "initial_quantity" DECIMAL(12,3) NOT NULL,
    "remaining_quantity" DECIMAL(12,3) NOT NULL,
    "buying_price" DECIMAL(12,2) NOT NULL,
    "selling_price" DECIMAL(12,2),
    "received_date" DATE NOT NULL,
    "expiration_date" DATE,
    "lot_number" TEXT,
    "status" "InventoryBatchStatus" NOT NULL DEFAULT 'AVAILABLE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "inventory_batches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stock_ledger_entries" (
    "id" UUID NOT NULL,
    "product_id" UUID NOT NULL,
    "inventory_batch_id" UUID,
    "movement_type" "StockLedgerMovementType" NOT NULL,
    "quantity_change" DECIMAL(12,3) NOT NULL,
    "buying_price" DECIMAL(12,2),
    "reference_type" TEXT,
    "reference_id" UUID,
    "occurred_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,

    CONSTRAINT "stock_ledger_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stock_adjustments" (
    "id" UUID NOT NULL,
    "adjusted_by_user_id" UUID NOT NULL,
    "reason" TEXT NOT NULL,
    "notes" TEXT,
    "adjusted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "stock_adjustments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stock_adjustment_items" (
    "id" UUID NOT NULL,
    "stock_adjustment_id" UUID NOT NULL,
    "product_id" UUID NOT NULL,
    "inventory_batch_id" UUID,
    "quantity_change" DECIMAL(12,3) NOT NULL,
    "notes" TEXT,

    CONSTRAINT "stock_adjustment_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "import_jobs" (
    "id" UUID NOT NULL,
    "created_by_user_id" UUID NOT NULL,
    "source_type" "StockInSourceType" NOT NULL,
    "status" "ImportJobStatus" NOT NULL DEFAULT 'UPLOADED',
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "import_jobs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "import_files" (
    "id" UUID NOT NULL,
    "import_job_id" UUID NOT NULL,
    "file_name" TEXT NOT NULL,
    "mime_type" TEXT,
    "storage_path" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "import_files_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "import_items" (
    "id" UUID NOT NULL,
    "import_job_id" UUID NOT NULL,
    "item_number" INTEGER NOT NULL,
    "raw_product_name" TEXT NOT NULL,
    "selected_product_id" UUID,
    "quantity" DECIMAL(12,3),
    "buying_price" DECIMAL(12,2),
    "selling_price" DECIMAL(12,2),
    "expiration_date" DATE,
    "lot_number" TEXT,
    "review_status" "ImportItemReviewStatus" NOT NULL DEFAULT 'PENDING',
    "raw_data" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "import_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "match_candidates" (
    "id" UUID NOT NULL,
    "import_item_id" UUID NOT NULL,
    "product_id" UUID NOT NULL,
    "score" DECIMAL(5,4) NOT NULL,
    "method" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "match_candidates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "classification_suggestions" (
    "id" UUID NOT NULL,
    "product_id" UUID,
    "import_item_id" UUID,
    "suggested_classification_id" UUID NOT NULL,
    "confidence" DECIMAL(5,4) NOT NULL,
    "model_name" TEXT NOT NULL,
    "model_version" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "classification_suggestions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "categories_parent_id_idx" ON "categories"("parent_id");

-- CreateIndex
CREATE INDEX "categories_name_idx" ON "categories"("name");

-- CreateIndex
CREATE UNIQUE INDEX "categories_parent_id_name_key" ON "categories"("parent_id", "name");

-- CreateIndex
CREATE UNIQUE INDEX "product_classifications_name_key" ON "product_classifications"("name");

-- CreateIndex
CREATE INDEX "product_classifications_name_idx" ON "product_classifications"("name");

-- CreateIndex
CREATE INDEX "product_classifications_is_active_idx" ON "product_classifications"("is_active");

-- CreateIndex
CREATE UNIQUE INDEX "generic_drugs_name_key" ON "generic_drugs"("name");

-- CreateIndex
CREATE INDEX "generic_drugs_name_idx" ON "generic_drugs"("name");

-- CreateIndex
CREATE INDEX "generic_drugs_is_active_idx" ON "generic_drugs"("is_active");

-- CreateIndex
CREATE UNIQUE INDEX "products_sku_key" ON "products"("sku");

-- CreateIndex
CREATE INDEX "products_category_id_idx" ON "products"("category_id");

-- CreateIndex
CREATE INDEX "products_classification_id_idx" ON "products"("classification_id");

-- CreateIndex
CREATE INDEX "products_generic_drug_id_idx" ON "products"("generic_drug_id");

-- CreateIndex
CREATE INDEX "products_name_idx" ON "products"("name");

-- CreateIndex
CREATE INDEX "products_generic_name_idx" ON "products"("generic_name");

-- CreateIndex
CREATE INDEX "products_brand_name_idx" ON "products"("brand_name");

-- CreateIndex
CREATE INDEX "product_aliases_alias_idx" ON "product_aliases"("alias");

-- CreateIndex
CREATE UNIQUE INDEX "product_aliases_product_id_alias_key" ON "product_aliases"("product_id", "alias");

-- CreateIndex
CREATE UNIQUE INDEX "product_barcodes_barcode_key" ON "product_barcodes"("barcode");

-- CreateIndex
CREATE INDEX "product_barcodes_product_id_idx" ON "product_barcodes"("product_id");

-- CreateIndex
CREATE INDEX "suppliers_is_active_idx" ON "suppliers"("is_active");

-- CreateIndex
CREATE UNIQUE INDEX "suppliers_name_key" ON "suppliers"("name");

-- CreateIndex
CREATE INDEX "stock_ins_supplier_id_idx" ON "stock_ins"("supplier_id");

-- CreateIndex
CREATE INDEX "stock_ins_received_by_user_id_idx" ON "stock_ins"("received_by_user_id");

-- CreateIndex
CREATE INDEX "stock_ins_received_date_idx" ON "stock_ins"("received_date");

-- CreateIndex
CREATE INDEX "stock_ins_source_type_status_idx" ON "stock_ins"("source_type", "status");

-- CreateIndex
CREATE UNIQUE INDEX "stock_ins_import_job_id_key" ON "stock_ins"("import_job_id");

-- CreateIndex
CREATE INDEX "stock_in_items_stock_in_id_idx" ON "stock_in_items"("stock_in_id");

-- CreateIndex
CREATE INDEX "stock_in_items_product_id_idx" ON "stock_in_items"("product_id");

-- CreateIndex
CREATE INDEX "stock_in_items_expiration_date_idx" ON "stock_in_items"("expiration_date");

-- CreateIndex
CREATE INDEX "inventory_batches_product_id_status_idx" ON "inventory_batches"("product_id", "status");

-- CreateIndex
CREATE INDEX "inventory_batches_stock_in_item_id_idx" ON "inventory_batches"("stock_in_item_id");

-- CreateIndex
CREATE INDEX "inventory_batches_received_date_idx" ON "inventory_batches"("received_date");

-- CreateIndex
CREATE INDEX "inventory_batches_expiration_date_idx" ON "inventory_batches"("expiration_date");

-- CreateIndex
CREATE INDEX "stock_ledger_entries_product_id_occurred_at_idx" ON "stock_ledger_entries"("product_id", "occurred_at");

-- CreateIndex
CREATE INDEX "stock_ledger_entries_inventory_batch_id_idx" ON "stock_ledger_entries"("inventory_batch_id");

-- CreateIndex
CREATE INDEX "stock_ledger_entries_movement_type_idx" ON "stock_ledger_entries"("movement_type");

-- CreateIndex
CREATE INDEX "stock_ledger_entries_reference_type_reference_id_idx" ON "stock_ledger_entries"("reference_type", "reference_id");

-- CreateIndex
CREATE INDEX "stock_adjustments_adjusted_by_user_id_idx" ON "stock_adjustments"("adjusted_by_user_id");

-- CreateIndex
CREATE INDEX "stock_adjustments_adjusted_at_idx" ON "stock_adjustments"("adjusted_at");

-- CreateIndex
CREATE INDEX "stock_adjustment_items_stock_adjustment_id_idx" ON "stock_adjustment_items"("stock_adjustment_id");

-- CreateIndex
CREATE INDEX "stock_adjustment_items_product_id_idx" ON "stock_adjustment_items"("product_id");

-- CreateIndex
CREATE INDEX "stock_adjustment_items_inventory_batch_id_idx" ON "stock_adjustment_items"("inventory_batch_id");

-- CreateIndex
CREATE INDEX "import_jobs_created_by_user_id_idx" ON "import_jobs"("created_by_user_id");

-- CreateIndex
CREATE INDEX "import_jobs_source_type_status_idx" ON "import_jobs"("source_type", "status");

-- CreateIndex
CREATE INDEX "import_files_import_job_id_idx" ON "import_files"("import_job_id");

-- CreateIndex
CREATE INDEX "import_items_import_job_id_idx" ON "import_items"("import_job_id");

-- CreateIndex
CREATE INDEX "import_items_selected_product_id_idx" ON "import_items"("selected_product_id");

-- CreateIndex
CREATE INDEX "import_items_review_status_idx" ON "import_items"("review_status");

-- CreateIndex
CREATE UNIQUE INDEX "import_items_import_job_id_item_number_key" ON "import_items"("import_job_id", "item_number");

-- CreateIndex
CREATE INDEX "match_candidates_product_id_idx" ON "match_candidates"("product_id");

-- CreateIndex
CREATE INDEX "match_candidates_score_idx" ON "match_candidates"("score");

-- CreateIndex
CREATE UNIQUE INDEX "match_candidates_import_item_id_product_id_key" ON "match_candidates"("import_item_id", "product_id");

-- CreateIndex
CREATE INDEX "classification_suggestions_product_id_idx" ON "classification_suggestions"("product_id");

-- CreateIndex
CREATE INDEX "classification_suggestions_import_item_id_idx" ON "classification_suggestions"("import_item_id");

-- CreateIndex
CREATE INDEX "classification_suggestions_suggested_classification_id_idx" ON "classification_suggestions"("suggested_classification_id");

-- CreateIndex
CREATE INDEX "classification_suggestions_confidence_idx" ON "classification_suggestions"("confidence");

-- AddForeignKey
ALTER TABLE "categories" ADD CONSTRAINT "categories_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_classification_id_fkey" FOREIGN KEY ("classification_id") REFERENCES "product_classifications"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_generic_drug_id_fkey" FOREIGN KEY ("generic_drug_id") REFERENCES "generic_drugs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_aliases" ADD CONSTRAINT "product_aliases_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_barcodes" ADD CONSTRAINT "product_barcodes_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_ins" ADD CONSTRAINT "stock_ins_supplier_id_fkey" FOREIGN KEY ("supplier_id") REFERENCES "suppliers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_ins" ADD CONSTRAINT "stock_ins_received_by_user_id_fkey" FOREIGN KEY ("received_by_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_ins" ADD CONSTRAINT "stock_ins_import_job_id_fkey" FOREIGN KEY ("import_job_id") REFERENCES "import_jobs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_in_items" ADD CONSTRAINT "stock_in_items_stock_in_id_fkey" FOREIGN KEY ("stock_in_id") REFERENCES "stock_ins"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_in_items" ADD CONSTRAINT "stock_in_items_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_batches" ADD CONSTRAINT "inventory_batches_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_batches" ADD CONSTRAINT "inventory_batches_stock_in_item_id_fkey" FOREIGN KEY ("stock_in_item_id") REFERENCES "stock_in_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_ledger_entries" ADD CONSTRAINT "stock_ledger_entries_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_ledger_entries" ADD CONSTRAINT "stock_ledger_entries_inventory_batch_id_fkey" FOREIGN KEY ("inventory_batch_id") REFERENCES "inventory_batches"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_adjustments" ADD CONSTRAINT "stock_adjustments_adjusted_by_user_id_fkey" FOREIGN KEY ("adjusted_by_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_adjustment_items" ADD CONSTRAINT "stock_adjustment_items_stock_adjustment_id_fkey" FOREIGN KEY ("stock_adjustment_id") REFERENCES "stock_adjustments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_adjustment_items" ADD CONSTRAINT "stock_adjustment_items_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_adjustment_items" ADD CONSTRAINT "stock_adjustment_items_inventory_batch_id_fkey" FOREIGN KEY ("inventory_batch_id") REFERENCES "inventory_batches"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "import_jobs" ADD CONSTRAINT "import_jobs_created_by_user_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "import_files" ADD CONSTRAINT "import_files_import_job_id_fkey" FOREIGN KEY ("import_job_id") REFERENCES "import_jobs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "import_items" ADD CONSTRAINT "import_items_import_job_id_fkey" FOREIGN KEY ("import_job_id") REFERENCES "import_jobs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "import_items" ADD CONSTRAINT "import_items_selected_product_id_fkey" FOREIGN KEY ("selected_product_id") REFERENCES "products"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "match_candidates" ADD CONSTRAINT "match_candidates_import_item_id_fkey" FOREIGN KEY ("import_item_id") REFERENCES "import_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "match_candidates" ADD CONSTRAINT "match_candidates_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "classification_suggestions" ADD CONSTRAINT "classification_suggestions_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "classification_suggestions" ADD CONSTRAINT "classification_suggestions_import_item_id_fkey" FOREIGN KEY ("import_item_id") REFERENCES "import_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "classification_suggestions" ADD CONSTRAINT "classification_suggestions_suggested_classification_id_fkey" FOREIGN KEY ("suggested_classification_id") REFERENCES "product_classifications"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
