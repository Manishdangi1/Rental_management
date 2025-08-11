-- AlterTable
ALTER TABLE "rental_items" ADD COLUMN     "invoiceStatus" TEXT NOT NULL DEFAULT 'NOTHING_TO_INVOICE';

-- AlterTable
ALTER TABLE "rentals" ADD COLUMN     "invoiceStatus" TEXT NOT NULL DEFAULT 'NOTHING_TO_INVOICE';
