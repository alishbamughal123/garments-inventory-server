-- Parcel and packaging weights were a constant 0.2 kg dummy on every record. Default to 0 and clear the dummy values.
ALTER TABLE "InventoryTransaction" ALTER COLUMN "packagingWeightKg" SET DEFAULT 0;
ALTER TABLE "CustomerOrder" ALTER COLUMN "packagingWeightKg" SET DEFAULT 0;
ALTER TABLE "CustomerOrder" ALTER COLUMN "totalParcelWeight" SET DEFAULT 0;
ALTER TABLE "DeliveryNote" ALTER COLUMN "packagingWeightKg" SET DEFAULT 0;
ALTER TABLE "DeliveryNote" ALTER COLUMN "totalParcelWeight" SET DEFAULT 0;
UPDATE "InventoryTransaction" SET "packagingWeightKg" = 0, "totalWeightKg" = NULL WHERE "packagingWeightKg" = 0.2 OR "totalWeightKg" IS NOT NULL;
UPDATE "CustomerOrder" SET "packagingWeightKg" = 0, "garmentWeightKg" = 0, "totalParcelWeight" = 0;
UPDATE "DeliveryNote" SET "packagingWeightKg" = 0, "garmentWeightKg" = 0, "totalParcelWeight" = 0;
