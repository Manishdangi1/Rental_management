-- CreateEnum
CREATE TYPE "DiscountType" AS ENUM ('PERCENTAGE', 'FIXED_AMOUNT');

-- AlterTable
ALTER TABLE "pricelist_items" ADD COLUMN     "bulkDiscount" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "bulkDiscountAmount" DOUBLE PRECISION,
ADD COLUMN     "bulkThreshold" INTEGER,
ADD COLUMN     "discountType" "DiscountType" NOT NULL DEFAULT 'PERCENTAGE',
ADD COLUMN     "seasonalMultiplier" DOUBLE PRECISION,
ADD COLUMN     "validFrom" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "validTo" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "products" ADD COLUMN     "basePrice" DOUBLE PRECISION,
ADD COLUMN     "damagePolicy" TEXT,
ADD COLUMN     "insuranceAmount" DOUBLE PRECISION,
ADD COLUMN     "insuranceRequired" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isSeasonal" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "peakSeasonEnd" TIMESTAMP(3),
ADD COLUMN     "peakSeasonStart" TIMESTAMP(3),
ADD COLUMN     "rentalInstructions" TEXT,
ADD COLUMN     "returnRequirements" TEXT,
ADD COLUMN     "setupRequirements" TEXT;

-- CreateTable
CREATE TABLE "product_availability" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "available" INTEGER NOT NULL,
    "reserved" INTEGER NOT NULL DEFAULT 0,
    "rented" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_availability_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "product_availability_productId_date_key" ON "product_availability"("productId", "date");

-- AddForeignKey
ALTER TABLE "product_availability" ADD CONSTRAINT "product_availability_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;
