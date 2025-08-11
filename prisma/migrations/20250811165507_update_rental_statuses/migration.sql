/*
  Warnings:

  - The values [PENDING,CONFIRMED,IN_PROGRESS,COMPLETED,CANCELLED,OVERDUE,DRAFT] on the enum `RentalStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "RentalStatus_new" AS ENUM ('QUOTATION', 'QUOTATION_SENT', 'PICKED_UP', 'RETURNED', 'RESERVED');
ALTER TABLE "rentals" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "rentals" ALTER COLUMN "status" TYPE "RentalStatus_new" USING ("status"::text::"RentalStatus_new");
ALTER TYPE "RentalStatus" RENAME TO "RentalStatus_old";
ALTER TYPE "RentalStatus_new" RENAME TO "RentalStatus";
DROP TYPE "RentalStatus_old";
ALTER TABLE "rentals" ALTER COLUMN "status" SET DEFAULT 'QUOTATION';
COMMIT;

-- AlterTable
ALTER TABLE "rentals" ALTER COLUMN "status" SET DEFAULT 'QUOTATION';
