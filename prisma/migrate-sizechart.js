const prisma = require("../src/config/db");

// Size chart data structure requested by user for articles 10105, 10106, 10116
const SIZE_CHART_10105_10106_10116 = {
  title: "Size chart for article 10105, 10106 and 10116",
  applicableStyles: ["10105", "10106", "10116"],
  unit: "cm",
  sizes: [
    { key: "XS", label: "X-SMALL", colorBadge: "yellow", colorHex: "#eab308", textHex: "#854d0e" },
    { key: "S", label: "SMALL", colorBadge: "green", colorHex: "#22c55e", textHex: "#14532d" },
    { key: "M", label: "MEDIUM", colorBadge: "medium blue", colorHex: "#3b82f6", textHex: "#1e3a8a" },
    { key: "L", label: "LARGE", colorBadge: "red", colorHex: "#ef4444", textHex: "#7f1d1d" },
    { key: "XL", label: "X-LARGE", colorBadge: "black", colorHex: "#1e293b", textHex: "#ffffff" },
    { key: "2XL", label: "2X-LARGE", colorBadge: "violet", colorHex: "#8b5cf6", textHex: "#ffffff" }
  ],
  measurements: [
    {
      code: "A",
      name: "Chest Width",
      norwegianName: "Brystvidde",
      tolerance: "± 1",
      values: {
        XS: "54.5",
        S: "56.5",
        M: "59",
        L: "61.5",
        XL: "64",
        "2XL": "66.5"
      }
    },
    {
      code: "B",
      name: "Width down",
      norwegianName: "Bunnvidde",
      tolerance: "± 1",
      values: {
        XS: "56.5",
        S: "58.5",
        M: "61.5",
        L: "64.5",
        XL: "67.5",
        "2XL": "70.5"
      }
    },
    {
      code: "C",
      name: "Height neck opening at the back",
      norwegianName: "Halsåpning høyde bak",
      tolerance: "± 0.5",
      values: {
        XS: "3",
        S: "3",
        M: "3",
        L: "3",
        XL: "3",
        "2XL": "3"
      }
    },
    {
      code: "D",
      name: "Height v-neck-opening at the front",
      norwegianName: "V-hals åpning foran",
      tolerance: "± 0.75",
      values: {
        XS: "14",
        S: "15",
        M: "16",
        L: "16.5",
        XL: "17",
        "2XL": "17.5"
      }
    },
    {
      code: "E",
      name: "Back length from neck opening",
      norwegianName: "Rygglengde fra hals",
      tolerance: "± 1",
      values: {
        XS: "74",
        S: "75",
        M: "77",
        L: "79",
        XL: "80",
        "2XL": "81"
      }
    },
    {
      code: "F",
      name: "Sleeve length from neck opening",
      norwegianName: "Ermelengde fra hals",
      tolerance: "± 1",
      values: {
        XS: "42",
        S: "44",
        M: "46",
        L: "48",
        XL: "50",
        "2XL": "52"
      }
    },
    {
      code: "G",
      name: "Width neckopening",
      norwegianName: "Halsvidde",
      tolerance: "± 0.75",
      values: {
        XS: "16",
        S: "16.5",
        M: "17",
        L: "17.5",
        XL: "18",
        "2XL": "18.5"
      }
    },
    {
      code: "H",
      name: "Sleeve Width",
      norwegianName: "Ermevidde",
      tolerance: "± 0.5",
      values: {
        XS: "20",
        S: "21",
        M: "22",
        L: "23",
        XL: "23.5",
        "2XL": "24.5"
      }
    },
    {
      code: "I",
      name: "Distance chest pocket from side seam",
      norwegianName: "Avstand brystlomme fra sidesøm",
      tolerance: "—",
      values: {
        XS: "approx. 7",
        S: "approx. 8",
        M: "approx. 9",
        L: "approx. 10",
        XL: "approx. 11",
        "2XL": "approx. 12"
      }
    }
  ]
};

// Map size string from database (e.g. "XS", "S", "X-SMALL", "2XL") to standardized size key
const normalizeSizeKey = (sizeStr) => {
  if (!sizeStr) return null;
  const s = String(sizeStr).trim().toUpperCase();
  if (s === "XS" || s === "X-SMALL" || s === "EXTRA SMALL") return "XS";
  if (s === "S" || s === "SMALL") return "S";
  if (s === "M" || s === "MEDIUM" || s === "MED") return "M";
  if (s === "L" || s === "LARGE") return "L";
  if (s === "XL" || s === "X-LARGE" || s === "EXTRA LARGE") return "XL";
  if (s === "2XL" || s === "XXL" || s === "2X-LARGE" || s === "DOUBLE XL") return "2XL";
  return s;
};

// Generates size-specific single measurements object for a given size key
const getSingleSizeMeasurements = (sizeKey, chart) => {
  const normalizedKey = normalizeSizeKey(sizeKey);
  const sizeMeta = chart.sizes.find((s) => s.key === normalizedKey);

  const breakdown = {};
  chart.measurements.forEach((m) => {
    breakdown[m.code] = {
      name: m.name,
      norwegianName: m.norwegianName,
      value: m.values[normalizedKey] || "—",
      tolerance: m.tolerance,
    };
  });

  return {
    size: sizeMeta ? sizeMeta.label : sizeKey,
    sizeKey: normalizedKey || sizeKey,
    colorBadge: sizeMeta ? sizeMeta.colorBadge : "standard",
    colorHex: sizeMeta ? sizeMeta.colorHex : "#3b82f6",
    unit: chart.unit,
    measurements: breakdown,
  };
};

async function main() {
  console.log("=== STARTING SIZE CHART MIGRATION & SEEDING ===");

  // 1. Ensure table and columns exist in PostgreSQL
  console.log("1. Ensuring Database Columns & Table...");
  await prisma.$executeRawUnsafe(`
    ALTER TABLE "Product" 
    ADD COLUMN IF NOT EXISTS "sizeChart" JSONB,
    ADD COLUMN IF NOT EXISTS "sizeChartMeasurements" JSONB;
  `);

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "SizeChart" (
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
    );
    CREATE INDEX IF NOT EXISTS "SizeChart_styleNumber_idx" ON "SizeChart"("styleNumber");
  `);
  console.log("-> Database Schema updated successfully!");

  // 2. Insert or update SizeChart records for styles 10105, 10106, 10116
  console.log("2. Seeding SizeChart model for styles: 10105, 10106, 10116...");
  const stylesToSeed = ["10105", "10106", "10116"];

  for (const styleNo of stylesToSeed) {
    const id = `sizechart-${styleNo}`;
    const chartJson = JSON.stringify(SIZE_CHART_10105_10106_10116);
    const applicableStylesJson = JSON.stringify(SIZE_CHART_10105_10106_10116.applicableStyles);
    const sizesJson = JSON.stringify(SIZE_CHART_10105_10106_10116.sizes);
    const measurementsJson = JSON.stringify(SIZE_CHART_10105_10106_10116.measurements);

    await prisma.$executeRawUnsafe(`
      INSERT INTO "SizeChart" ("id", "styleNumber", "title", "applicableStyles", "sizes", "measurements", "unit", "updatedAt")
      VALUES ($1, $2, $3, $4::jsonb, $5::jsonb, $6::jsonb, 'cm', CURRENT_TIMESTAMP)
      ON CONFLICT ("styleNumber") DO UPDATE SET
        "title" = EXCLUDED."title",
        "applicableStyles" = EXCLUDED."applicableStyles",
        "sizes" = EXCLUDED."sizes",
        "measurements" = EXCLUDED."measurements",
        "unit" = EXCLUDED."unit",
        "updatedAt" = CURRENT_TIMESTAMP;
    `, id, styleNo, SIZE_CHART_10105_10106_10116.title, applicableStylesJson, sizesJson, measurementsJson);

    console.log(`-> SizeChart record ensured for Style #${styleNo}`);
  }

  // 3. Update all Product variants in database for styles 10105, 10106, 10116
  console.log("3. Updating individual Product variants in database...");
  const products = await prisma.product.findMany({
    where: {
      OR: [
        { baseStyleNumber: { in: stylesToSeed } },
        { styleNumber: { startsWith: "10105" } },
        { styleNumber: { startsWith: "10106" } },
        { styleNumber: { startsWith: "10116" } },
        { sku: { startsWith: "10105" } },
        { sku: { startsWith: "10106" } },
        { sku: { startsWith: "10116" } },
      ],
    },
  });

  console.log(`Found ${products.length} products to populate with size chart data.`);

  let updatedCount = 0;
  for (const prod of products) {
    const singleSpec = getSingleSizeMeasurements(prod.size, SIZE_CHART_10105_10106_10116);
    const chartJson = JSON.stringify(SIZE_CHART_10105_10106_10116);
    const singleSpecJson = JSON.stringify(singleSpec);

    await prisma.$executeRawUnsafe(`
      UPDATE "Product"
      SET "sizeChart" = $1::jsonb,
          "sizeChartMeasurements" = $2::jsonb,
          "updatedAt" = CURRENT_TIMESTAMP
      WHERE "id" = $3;
    `, chartJson, singleSpecJson, prod.id);

    updatedCount++;
  }

  console.log(`-> Successfully updated ${updatedCount} products with full size chart & single size measurements!`);
  console.log("=== SIZE CHART MIGRATION COMPLETE! ===");
}

if (require.main === module) {
  main()
    .then(async () => {
      await prisma.$disconnect();
      process.exit(0);
    })
    .catch(async (e) => {
      console.error("Migration error:", e);
      await prisma.$disconnect();
      process.exit(1);
    });
}

module.exports = {
  SIZE_CHART_10105_10106_10116,
  getSingleSizeMeasurements,
  normalizeSizeKey,
};
