const prisma = require('../src/config/db');

async function syncSchema() {
  console.log('Synchronizing all tables and columns to garments_dev...');

  const queries = [
    // 1. Enums
    `DO $$ BEGIN CREATE TYPE "CustomerOrderStatus" AS ENUM ('PENDING', 'APPROVED', 'PROCESSING', 'SHIPPED', 'COMPLETED', 'CANCELLED'); EXCEPTION WHEN duplicate_object THEN null; END $$;`,
    `DO $$ BEGIN CREATE TYPE "TicketStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'); EXCEPTION WHEN duplicate_object THEN null; END $$;`,
    `DO $$ BEGIN CREATE TYPE "TicketPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT'); EXCEPTION WHEN duplicate_object THEN null; END $$;`,
    `DO $$ BEGIN CREATE TYPE "CustomerStatus" AS ENUM ('ACTIVE', 'INACTIVE'); EXCEPTION WHEN duplicate_object THEN null; END $$;`,

    // 2. Customer extra columns
    `ALTER TABLE "customers" ADD COLUMN IF NOT EXISTS "customerCode" TEXT;`,
    `ALTER TABLE "customers" ADD COLUMN IF NOT EXISTS "companyName" TEXT;`,
    `ALTER TABLE "customers" ADD COLUMN IF NOT EXISTS "designation" TEXT;`,
    `ALTER TABLE "customers" ADD COLUMN IF NOT EXISTS "alternatePhone" TEXT;`,
    `ALTER TABLE "customers" ADD COLUMN IF NOT EXISTS "passwordHash" TEXT;`,
    `ALTER TABLE "customers" ADD COLUMN IF NOT EXISTS "isPortalActive" BOOLEAN NOT NULL DEFAULT true;`,
    `ALTER TABLE "customers" ADD COLUMN IF NOT EXISTS "vatNumber" TEXT;`,
    `ALTER TABLE "customers" ADD COLUMN IF NOT EXISTS "website" TEXT;`,
    `ALTER TABLE "customers" ADD COLUMN IF NOT EXISTS "source" TEXT;`,
    `ALTER TABLE "customers" ADD COLUMN IF NOT EXISTS "status" "CustomerStatus" NOT NULL DEFAULT 'ACTIVE';`,
    `CREATE UNIQUE INDEX IF NOT EXISTS "customers_customerCode_key" ON "customers"("customerCode");`,

    // 3. Product extra columns
    `ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "baseStyleNumber" TEXT;`,
    `ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "styleNumber" TEXT;`,
    `ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "styleName" TEXT;`,
    `ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "itemName" TEXT;`,
    `ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "brand" TEXT;`,
    `ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "colorCode" TEXT;`,
    `ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "fabric" TEXT;`,
    `ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "fabricComposition" TEXT;`,
    `ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "fabricWeight" TEXT;`,
    `ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "weightInKg" DOUBLE PRECISION NOT NULL DEFAULT 0.0;`,
    `ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "washingInstructionsImageUrl" TEXT;`,
    `ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "washingInstructions" TEXT;`,
    `ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "isContracted" BOOLEAN NOT NULL DEFAULT false;`,
    `ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "logoOptions" JSONB;`,
    `ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "sizeChart" JSONB;`,
    `ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "sizeChartMeasurements" JSONB;`,

    // 4. InventoryTransaction extra columns
    `ALTER TABLE "InventoryTransaction" ADD COLUMN IF NOT EXISTS "customerId" TEXT REFERENCES "customers"("id") ON DELETE SET NULL;`,
    `ALTER TABLE "InventoryTransaction" ADD COLUMN IF NOT EXISTS "packagingWeightKg" DOUBLE PRECISION DEFAULT 0.2;`,
    `ALTER TABLE "InventoryTransaction" ADD COLUMN IF NOT EXISTS "totalWeightKg" DOUBLE PRECISION;`,

    // 5. SizeChart Table
    `CREATE TABLE IF NOT EXISTS "SizeChart" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "styleNumber" TEXT NOT NULL UNIQUE,
      "title" TEXT,
      "applicableStyles" JSONB,
      "sizes" JSONB NOT NULL,
      "measurements" JSONB NOT NULL,
      "unit" TEXT NOT NULL DEFAULT 'cm',
      "notes" TEXT,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    );`,

    // 6. Customer Contacts, Price, Access
    `CREATE TABLE IF NOT EXISTS "CustomerContact" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "customerId" TEXT NOT NULL REFERENCES "customers"("id") ON DELETE CASCADE,
      "name" TEXT NOT NULL,
      "title" TEXT,
      "email" TEXT,
      "phone" TEXT,
      "isPrimary" BOOLEAN NOT NULL DEFAULT false,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    );`,

    `CREATE TABLE IF NOT EXISTS "CustomerPrice" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "customerId" TEXT NOT NULL REFERENCES "customers"("id") ON DELETE CASCADE,
      "productId" TEXT NOT NULL REFERENCES "Product"("id") ON DELETE CASCADE,
      "customPrice" DECIMAL(10,2) NOT NULL,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "CustomerPrice_customerId_productId_key" UNIQUE ("customerId", "productId")
    );`,

    `CREATE TABLE IF NOT EXISTS "CustomerProductAccess" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "customerId" TEXT NOT NULL REFERENCES "customers"("id") ON DELETE CASCADE,
      "productId" TEXT NOT NULL REFERENCES "Product"("id") ON DELETE CASCADE,
      "isAllowed" BOOLEAN NOT NULL DEFAULT true,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "CustomerProductAccess_customerId_productId_key" UNIQUE ("customerId", "productId")
    );`,

    // 7. Customer Orders & Items
    `CREATE TABLE IF NOT EXISTS "CustomerOrder" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "orderNumber" TEXT NOT NULL UNIQUE,
      "customerId" TEXT NOT NULL REFERENCES "customers"("id"),
      "status" "CustomerOrderStatus" NOT NULL DEFAULT 'PENDING',
      "subtotal" DECIMAL(10,2) NOT NULL,
      "tax" DECIMAL(10,2) NOT NULL DEFAULT 0,
      "totalAmount" DECIMAL(10,2) NOT NULL,
      "garmentWeightKg" DOUBLE PRECISION NOT NULL DEFAULT 0,
      "packagingWeightKg" DOUBLE PRECISION NOT NULL DEFAULT 0.2,
      "totalParcelWeight" DOUBLE PRECISION NOT NULL DEFAULT 0.2,
      "notes" TEXT,
      "shippingAddress" TEXT,
      "fulfilledAt" TIMESTAMP(3),
      "fulfilledById" TEXT REFERENCES "User"("id"),
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    );`,

    `CREATE TABLE IF NOT EXISTS "CustomerOrderItem" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "orderId" TEXT NOT NULL REFERENCES "CustomerOrder"("id") ON DELETE CASCADE,
      "productId" TEXT NOT NULL REFERENCES "Product"("id"),
      "quantity" INTEGER NOT NULL,
      "unitPrice" DECIMAL(10,2) NOT NULL,
      "unitWeight" DOUBLE PRECISION NOT NULL DEFAULT 0,
      "totalPrice" DECIMAL(10,2) NOT NULL,
      "totalWeight" DOUBLE PRECISION NOT NULL DEFAULT 0,
      "selectedLogo" TEXT,
      "customNote" TEXT
    );`,

    // 8. Delivery Note
    `CREATE TABLE IF NOT EXISTS "DeliveryNote" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "deliveryNoteNumber" TEXT NOT NULL UNIQUE,
      "customerId" TEXT NOT NULL REFERENCES "customers"("id"),
      "orderId" TEXT UNIQUE REFERENCES "CustomerOrder"("id"),
      "transactionId" TEXT UNIQUE REFERENCES "InventoryTransaction"("id"),
      "garmentWeightKg" DOUBLE PRECISION NOT NULL DEFAULT 0,
      "packagingWeightKg" DOUBLE PRECISION NOT NULL DEFAULT 0.2,
      "totalParcelWeight" DOUBLE PRECISION NOT NULL DEFAULT 0.2,
      "notes" TEXT,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    );`,

    // 9. AuditLog
    `CREATE TABLE IF NOT EXISTS "AuditLog" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "action" TEXT NOT NULL,
      "entity" TEXT NOT NULL,
      "entityId" TEXT,
      "performedBy" TEXT NOT NULL,
      "details" TEXT,
      "ipAddress" TEXT,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    );`,

    // 10. SupportTicket
    `CREATE TABLE IF NOT EXISTS "SupportTicket" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "ticketNumber" TEXT NOT NULL UNIQUE,
      "subject" TEXT NOT NULL,
      "description" TEXT,
      "status" "TicketStatus" NOT NULL DEFAULT 'OPEN',
      "priority" "TicketPriority" NOT NULL DEFAULT 'MEDIUM',
      "category" TEXT,
      "customerId" TEXT REFERENCES "customers"("id"),
      "createdById" TEXT NOT NULL REFERENCES "User"("id"),
      "assignedToId" TEXT REFERENCES "User"("id"),
      "resolvedAt" TIMESTAMP(3),
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    );`
  ];

  for (const q of queries) {
    try {
      await prisma.$executeRawUnsafe(q);
    } catch (err) {
      console.warn('Sync warning:', err.message);
    }
  }

  console.log('✓ All tables and columns synchronized!');
  const ensureDefaultAdmin = require('../prisma/seed');
  await ensureDefaultAdmin();
  console.log('✓ Seeding complete!');
  process.exit(0);
}

syncSchema().catch(e => {
  console.error('Failed to sync:', e);
  process.exit(1);
});
