/*
  Warnings:

  - The values [END_USER,MANAGER] on the enum `UserRole` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `emailVerificationExpiry` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `emailVerificationToken` on the `users" table. All the data in the column will be lost.
  - You are about to drop the column `resetToken` on the `users" table. All the data in the column will be lost.
  - You are about to drop the column `resetTokenExpiry` on the `users" table. All the data in the column will be lost.
  - A unique constraint covering the columns `[orderNumber]` on the table `rentals` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `productName` to the `rental_items` table without a default value. This is not possible if the table is not empty.
  - Added the required column `rentalType` to the `rental_items` table without a default value. This is not possible if the table is not empty.
  - Added the required column `customerName` to the `rentals" table without a default value. This is not possible if the table is not empty.
  - Added the required column `orderNumber` to the `rentals" table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
ALTER TYPE "RentalStatus" ADD VALUE 'DRAFT';

-- AlterEnum
BEGIN;
CREATE TYPE "UserRole_new" AS ENUM ('CUSTOMER', 'STAFF', 'ADMIN');
ALTER TABLE "users" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "users" ALTER COLUMN "role" TYPE "UserRole_new" USING ("role"::text::"UserRole_new");
ALTER TYPE "UserRole" RENAME TO "UserRole_old";
ALTER TYPE "UserRole_new" RENAME TO "UserRole";
DROP TYPE "UserRole_old";
ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'CUSTOMER';
COMMIT;

-- First add the columns as nullable
ALTER TABLE "rental_items" ADD COLUMN "endDate" TIMESTAMP(3),
ADD COLUMN "productName" TEXT,
ADD COLUMN "rentalType" TEXT,
ADD COLUMN "startDate" TIMESTAMP(3);

ALTER TABLE "rentals" ADD COLUMN "customerName" TEXT,
ADD COLUMN "orderNumber" TEXT,
ADD COLUMN "subtotal" DOUBLE PRECISION DEFAULT 0,
ADD COLUMN "tax" DOUBLE PRECISION DEFAULT 0;

-- Update existing data
UPDATE "rentals" SET 
  "orderNumber" = 'RO-' || EXTRACT(EPOCH FROM "createdAt")::text || '-' || LPAD(CAST(id AS text), 3, '0'),
  "customerName" = COALESCE(
    (SELECT CONCAT("firstName", ' ', "lastName") FROM "users" WHERE "users"."id" = "rentals"."customerId"),
    'Unknown Customer'
  ),
  "subtotal" = COALESCE("totalAmount", 0),
  "tax" = 0;

UPDATE "rental_items" SET 
  "productName" = COALESCE(
    (SELECT "name" FROM "products" WHERE "products"."id" = "rental_items"."productId"),
    'Unknown Product'
  ),
  "rentalType" = 'DAILY',
  "startDate" = NULL,
  "endDate" = NULL;

-- Now make the columns required
ALTER TABLE "rental_items" ALTER COLUMN "productName" SET NOT NULL,
ALTER COLUMN "rentalType" SET NOT NULL;

ALTER TABLE "rentals" ALTER COLUMN "customerName" SET NOT NULL,
ALTER COLUMN "orderNumber" SET NOT NULL;

-- Update other columns
ALTER TABLE "rentals" ALTER COLUMN "status" SET DEFAULT 'DRAFT',
ALTER COLUMN "startDate" DROP NOT NULL,
ALTER COLUMN "endDate" DROP NOT NULL,
ALTER COLUMN "totalAmount" SET DEFAULT 0,
ALTER COLUMN "securityDeposit" SET DEFAULT 0;

-- AlterTable
ALTER TABLE "users" DROP COLUMN "emailVerificationExpiry",
DROP COLUMN "emailVerificationToken",
DROP COLUMN "resetToken",
DROP COLUMN "resetTokenExpiry";

-- CreateIndex
CREATE UNIQUE INDEX "rentals_orderNumber_key" ON "rentals"("orderNumber");
