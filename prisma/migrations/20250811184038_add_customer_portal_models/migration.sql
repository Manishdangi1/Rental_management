/*
  Warnings:

  - You are about to drop the column `address` on the `deliveries` table. All the data in the column will be lost.
  - You are about to drop the column `completedAt` on the `deliveries` table. All the data in the column will be lost.
  - You are about to drop the column `contactName` on the `deliveries` table. All the data in the column will be lost.
  - You are about to drop the column `contactPhone` on the `deliveries` table. All the data in the column will be lost.
  - You are about to drop the column `notes` on the `deliveries` table. All the data in the column will be lost.
  - You are about to drop the column `scheduledAt` on the `deliveries` table. All the data in the column will be lost.
  - The `type` column on the `deliveries` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `status` column on the `deliveries` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `amount` on the `invoices` table. All the data in the column will be lost.
  - You are about to drop the column `paidAt` on the `invoices` table. All the data in the column will be lost.
  - The `status` column on the `invoices` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `channel` on the `notifications` table. All the data in the column will be lost.
  - You are about to drop the column `isRead` on the `notifications` table. All the data in the column will be lost.
  - You are about to drop the column `sentAt` on the `notifications` table. All the data in the column will be lost.
  - The `type` column on the `notifications` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `customerId` on the `payments` table. All the data in the column will be lost.
  - You are about to drop the column `stripeIntentId` on the `payments` table. All the data in the column will be lost.
  - The `status` column on the `payments` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - A unique constraint covering the columns `[trackingNumber]` on the table `deliveries` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[paymentNumber]` on the table `payments` will be added. If there are existing duplicate values, this will fail.
*/

-- First, create temporary columns to store existing data
ALTER TABLE "deliveries" ADD COLUMN "temp_type" TEXT;
ALTER TABLE "deliveries" ADD COLUMN "temp_status" TEXT;
ALTER TABLE "deliveries" ADD COLUMN "temp_scheduledAt" TIMESTAMP(3);

-- Copy existing data to temporary columns
UPDATE "deliveries" SET 
  "temp_type" = "type"::TEXT,
  "temp_status" = "status"::TEXT,
  "temp_scheduledAt" = "scheduledAt";

-- Create new tables with proper structure
CREATE TABLE "drivers" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "vehicle" TEXT NOT NULL,
    "licensePlate" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "drivers_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "addresses" (
    "id" TEXT NOT NULL,
    "street" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "zipCode" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'HOME',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "addresses_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "notification_settings" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "email" BOOLEAN NOT NULL DEFAULT true,
    "sms" BOOLEAN NOT NULL DEFAULT false,
    "push" BOOLEAN NOT NULL DEFAULT true,
    "rentalReminders" BOOLEAN NOT NULL DEFAULT true,
    "deliveryUpdates" BOOLEAN NOT NULL DEFAULT true,
    "paymentReminders" BOOLEAN NOT NULL DEFAULT true,
    "promotionalOffers" BOOLEAN NOT NULL DEFAULT false,
    "systemUpdates" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notification_settings_pkey" PRIMARY KEY ("id")
);

-- Create new deliveries table
CREATE TABLE "deliveries_new" (
    "id" TEXT NOT NULL,
    "rentalId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'SCHEDULED',
    "type" TEXT NOT NULL DEFAULT 'DELIVERY',
    "scheduledDate" TIMESTAMP(3) NOT NULL,
    "scheduledTime" TEXT NOT NULL,
    "actualDate" TIMESTAMP(3),
    "actualTime" TEXT,
    "driverId" TEXT,
    "addressId" TEXT,
    "specialInstructions" TEXT,
    "estimatedDuration" TEXT NOT NULL DEFAULT '2-3 hours',
    "trackingNumber" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "deliveries_new_pkey" PRIMARY KEY ("id")
);

-- Migrate data from old deliveries table to new one
INSERT INTO "deliveries_new" (
    "id", "rentalId", "status", "type", "scheduledDate", "scheduledTime", 
    "estimatedDuration", "trackingNumber", "createdAt", "updatedAt"
)
SELECT 
    "id", "rentalId", 
    COALESCE("temp_status", 'SCHEDULED'), 
    COALESCE("temp_type", 'DELIVERY'),
    COALESCE("temp_scheduledAt", CURRENT_TIMESTAMP), 
    '10:00 AM',
    '2-3 hours',
    'TRK-' || EXTRACT(EPOCH FROM CURRENT_TIMESTAMP)::TEXT || '-' || "id",
    "createdAt",
    CURRENT_TIMESTAMP
FROM "deliveries";

-- Drop old deliveries table and rename new one
DROP TABLE "deliveries";
ALTER TABLE "deliveries_new" RENAME TO "deliveries";

-- Create new invoices table
CREATE TABLE "invoices_new" (
    "id" TEXT NOT NULL,
    "invoiceNumber" TEXT NOT NULL,
    "rentalId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "issueDate" TIMESTAMP(3) NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "paidDate" TIMESTAMP(3),
    "subtotal" DOUBLE PRECISION NOT NULL,
    "tax" DOUBLE PRECISION NOT NULL,
    "discount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "total" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "paymentMethod" TEXT,
    "notes" TEXT,
    "terms" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "invoices_new_pkey" PRIMARY KEY ("id")
);

-- Migrate data from old invoices table to new one
INSERT INTO "invoices_new" (
    "id", "invoiceNumber", "rentalId", "customerId", "status", "issueDate", "dueDate",
    "subtotal", "tax", "total", "createdAt", "updatedAt"
)
SELECT 
    "id", 
    'INV-' || EXTRACT(EPOCH FROM CURRENT_TIMESTAMP)::TEXT || '-' || "id",
    "rentalId", 
    (SELECT "customerId" FROM "rentals" WHERE "id" = "invoices"."rentalId" LIMIT 1),
    'DRAFT',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP + INTERVAL '15 days',
    COALESCE("amount", 0),
    COALESCE("tax", 0),
    COALESCE("amount", 0) + COALESCE("tax", 0),
    "createdAt",
    CURRENT_TIMESTAMP
FROM "invoices";

-- Drop old invoices table and rename new one
DROP TABLE "invoices";
ALTER TABLE "invoices_new" RENAME TO "invoices";

-- Create new payments table
CREATE TABLE "payments_new" (
    "id" TEXT NOT NULL,
    "paymentNumber" TEXT NOT NULL,
    "invoiceId" TEXT NOT NULL,
    "rentalId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "method" TEXT NOT NULL,
    "methodDetails" JSONB,
    "transactionId" TEXT,
    "authorizationCode" TEXT,
    "processedDate" TIMESTAMP(3),
    "failureReason" TEXT,
    "refundReason" TEXT,
    "refundDate" TIMESTAMP(3),
    "securityDeposit" BOOLEAN NOT NULL DEFAULT false,
    "description" TEXT NOT NULL DEFAULT 'Payment for rental',
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payments_new_pkey" PRIMARY KEY ("id")
);

-- Migrate data from old payments table to new one
INSERT INTO "payments_new" (
    "id", "paymentNumber", "invoiceId", "rentalId", "amount", "status", "method",
    "description", "createdAt", "updatedAt"
)
SELECT 
    "id",
    'PAY-' || EXTRACT(EPOCH FROM CURRENT_TIMESTAMP)::TEXT || '-' || "id",
    (SELECT "id" FROM "invoices" WHERE "rentalId" = "payments"."rentalId" LIMIT 1),
    "rentalId",
    COALESCE("amount", 0),
    COALESCE("status"::TEXT, 'PENDING'),
    COALESCE("method"::TEXT, 'CREDIT_CARD'),
    COALESCE("description", 'Payment for rental'),
    "createdAt",
    CURRENT_TIMESTAMP
FROM "payments";

-- Drop old payments table and rename new one
DROP TABLE "payments";
ALTER TABLE "payments_new" RENAME TO "payments";

-- Update notifications table
ALTER TABLE "notifications" 
ADD COLUMN "actionText" TEXT,
ADD COLUMN "actionUrl" TEXT,
ADD COLUMN "category" TEXT NOT NULL DEFAULT 'SYSTEM',
ADD COLUMN "metadata" JSONB,
ADD COLUMN "priority" TEXT NOT NULL DEFAULT 'MEDIUM',
ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Update existing notifications
UPDATE "notifications" SET 
    "status" = CASE WHEN "isRead" THEN 'READ' ELSE 'UNREAD' END,
    "type" = CASE WHEN "type" = 'RENTAL_UPDATE' THEN 'INFO' 
                  WHEN "type" = 'DELIVERY_UPDATE' THEN 'INFO'
                  WHEN "type" = 'PAYMENT_UPDATE' THEN 'INFO'
                  WHEN "type" = 'SYSTEM_UPDATE' THEN 'INFO'
                  WHEN "type" = 'PROMOTIONAL' THEN 'INFO'
                  ELSE 'INFO' END,
    "createdAt" = COALESCE("sentAt", CURRENT_TIMESTAMP),
    "updatedAt" = CURRENT_TIMESTAMP;

-- Drop old columns from notifications
ALTER TABLE "notifications" 
DROP COLUMN "channel",
DROP COLUMN "isRead",
DROP COLUMN "sentAt";

-- Create indexes and constraints
CREATE UNIQUE INDEX "notification_settings_userId_key" ON "notification_settings"("userId");
CREATE UNIQUE INDEX "deliveries_trackingNumber_key" ON "deliveries"("trackingNumber");
CREATE UNIQUE INDEX "payments_paymentNumber_key" ON "payments"("paymentNumber");
CREATE UNIQUE INDEX "invoices_invoiceNumber_key" ON "invoices"("invoiceNumber");

-- Add foreign key constraints
ALTER TABLE "deliveries" ADD CONSTRAINT "deliveries_rentalId_fkey" FOREIGN KEY ("rentalId") REFERENCES "rentals"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "deliveries" ADD CONSTRAINT "deliveries_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "drivers"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "deliveries" ADD CONSTRAINT "deliveries_addressId_fkey" FOREIGN KEY ("addressId") REFERENCES "addresses"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "payments" ADD CONSTRAINT "payments_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "invoices"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "payments" ADD CONSTRAINT "payments_rentalId_fkey" FOREIGN KEY ("rentalId") REFERENCES "rentals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "invoices" ADD CONSTRAINT "invoices_rentalId_fkey" FOREIGN KEY ("rentalId") REFERENCES "rentals"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "notifications" ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "notification_settings" ADD CONSTRAINT "notification_settings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Drop temporary columns
ALTER TABLE "deliveries" DROP COLUMN "temp_type";
ALTER TABLE "deliveries" DROP COLUMN "temp_status";
ALTER TABLE "deliveries" DROP COLUMN "temp_scheduledAt";

-- Drop old enum types
DROP TYPE IF EXISTS "DeliveryStatus";
DROP TYPE IF EXISTS "DeliveryType";
DROP TYPE IF EXISTS "InvoiceStatus";
DROP TYPE IF EXISTS "NotificationChannel";
DROP TYPE IF EXISTS "NotificationType";
DROP TYPE IF EXISTS "PaymentMethod";
DROP TYPE IF EXISTS "PaymentStatus";
