/*
  Warnings:

  - You are about to drop the column `invoice_number` on the `stock_ins` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "StockReferenceType" AS ENUM ('INVOICE', 'DELIVERY_RECEIPT', 'OFFICIAL_RECEIPT', 'PURCHASE_ORDER', 'MANUAL', 'OPENING_INVENTORY', 'DONATION', 'OTHER');

-- AlterTable
ALTER TABLE "stock_ins" DROP COLUMN "invoice_number",
ADD COLUMN     "reference_number" TEXT,
ADD COLUMN     "reference_type" "StockReferenceType";
