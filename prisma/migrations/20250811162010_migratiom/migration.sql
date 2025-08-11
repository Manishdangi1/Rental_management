/*
  Warnings:

  - The values [STAFF] on the enum `UserRole` will be removed. If these variants are still used in the database, this will fail.
  - Made the column `subtotal` on table `rentals` required. This step will fail if there are existing NULL values in that column.
  - Made the column `tax` on table `rentals` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "UserRole_new" AS ENUM ('CUSTOMER', 'ADMIN');
ALTER TABLE "users" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "users" ALTER COLUMN "role" TYPE "UserRole_new" USING ("role"::text::"UserRole_new");
ALTER TYPE "UserRole" RENAME TO "UserRole_old";
ALTER TYPE "UserRole_new" RENAME TO "UserRole";
DROP TYPE "UserRole_old";
ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'CUSTOMER';
COMMIT;

-- AlterTable
ALTER TABLE "rentals" ALTER COLUMN "subtotal" SET NOT NULL,
ALTER COLUMN "tax" SET NOT NULL;
