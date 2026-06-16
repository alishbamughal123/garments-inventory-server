-- CreateEnum
CREATE TYPE "ReminderChannel" AS ENUM ('EMAIL', 'SMS', 'EMAIL_AND_SMS');

-- CreateEnum
CREATE TYPE "ReminderRecipientType" AS ENUM ('ASSIGNED_USER', 'CUSTOMER', 'LEAD', 'CUSTOM');

-- CreateEnum
CREATE TYPE "ReminderDeliveryStatus" AS ENUM ('PENDING', 'PROCESSING', 'SENT', 'FAILED', 'PARTIAL');

-- AlterTable
ALTER TABLE "User" ADD COLUMN "phoneNumber" TEXT;

-- AlterTable
ALTER TABLE "Reminder"
ADD COLUMN "scheduledFor" TIMESTAMP(3),
ADD COLUMN "channel" "ReminderChannel" NOT NULL DEFAULT 'EMAIL',
ADD COLUMN "recipientType" "ReminderRecipientType" NOT NULL DEFAULT 'ASSIGNED_USER',
ADD COLUMN "recipientEmail" TEXT,
ADD COLUMN "recipientPhone" TEXT,
ADD COLUMN "deliveryStatus" "ReminderDeliveryStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN "sentAt" TIMESTAMP(3),
ADD COLUMN "lastAttemptAt" TIMESTAMP(3),
ADD COLUMN "failureReason" TEXT;

-- Backfill
UPDATE "Reminder"
SET "scheduledFor" = (
  date_trunc('day', "reminderDate") +
  "reminderTime"::time
)
WHERE "scheduledFor" IS NULL;

-- AlterTable
ALTER TABLE "Reminder"
ALTER COLUMN "scheduledFor" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "User_phoneNumber_key" ON "User"("phoneNumber");

-- CreateIndex
CREATE INDEX "Reminder_scheduledFor_idx" ON "Reminder"("scheduledFor");

-- CreateIndex
CREATE INDEX "Reminder_deliveryStatus_idx" ON "Reminder"("deliveryStatus");
