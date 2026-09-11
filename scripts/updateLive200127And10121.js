const path = require("path");
const dotenv = require("dotenv");
dotenv.config({ path: path.join(__dirname, "../.env.live") });
if (!process.env.DATABASE_URL) {
  dotenv.config({ path: path.join(__dirname, "../.env") });
}

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const { Pool } = require("pg");
const { SIZE_CHART_10121 } = require("../src/modules/sizechart/sizechart.constants");

// Target DBs: defaultdb (live) and optionally garments_dev (dev)
const liveDbUrl = (process.env.DATABASE_URL || "").replace("/garments_dev", "/defaultdb");
const devDbUrl = (process.env.DATABASE_URL || "").replace("/defaultdb", "/garments_dev");

function getSingleSizeSpecs(sizeKey, chart) {
  if (!sizeKey) return null;
  const s = String(sizeKey).trim().toUpperCase();
  const matchedSize = chart.sizes.find(
    (sz) => sz.key.toUpperCase() === s || sz.label.toUpperCase().includes(s)
  ) || chart.sizes[0];

  const breakdown = {};
  chart.measurements.forEach((m) => {
    breakdown[m.code] = {
      name: m.name,
      norwegianName: m.norwegianName,
      value: m.values[matchedSize.key] || "—",
      tolerance: m.tolerance,
    };
  });

  return {
    size: matchedSize.label,
    sizeKey: matchedSize.key,
    colorBadge: matchedSize.colorBadge || "standard",
    colorHex: matchedSize.colorHex || "#3b82f6",
    unit: chart.unit,
    measurements: breakdown,
  };
}

async function updateDatabase(dbUrl, dbName) {
  console.log(`\n======================================================`);
  console.log(`SYNCING TO: ${dbName}`);
  console.log(`======================================================`);

  const pool = new Pool({
    connectionString: dbUrl,
    ssl: { rejectUnauthorized: false }
  });

  const client = await pool.connect();

  try {
    // -------------------------------------------------------------------
    // Task 1: Update Article 200127 specifications
    // -------------------------------------------------------------------
    console.log("\n[1] Updating Article 200127 specifications...");
    const update200127Res = await client.query(`
      UPDATE "Product"
      SET fabric = $1,
          "fabricComposition" = $2,
          "fabricWeight" = $3,
          "updatedAt" = CURRENT_TIMESTAMP
      WHERE "baseStyleNumber" = '200127'
         OR "styleNumber" LIKE '200127%'
         OR sku LIKE '200127%'
    `, ["8000", "65% Polyester 35% Cotton", "210 gsm"]);

    console.log(`✓ Updated ${update200127Res.rowCount} product variants for Article 200127.`);

    // Fetch and show updated 200127 records
    const check200127 = await client.query(`
      SELECT sku, "productName", "size", "color", fabric, "fabricComposition", "fabricWeight"
      FROM "Product"
      WHERE "baseStyleNumber" = '200127'
         OR "styleNumber" LIKE '200127%'
         OR sku LIKE '200127%'
      ORDER BY sku ASC
    `);
    console.log("Current 200127 data in DB:", JSON.stringify(check200127.rows, null, 2));

    // -------------------------------------------------------------------
    // Task 2: Add / Upsert Size Chart for Article 10121
    // -------------------------------------------------------------------
    console.log("\n[2] Upserting SizeChart for Article 10121...");
    const chartId = "sizechart-10121";
    const applicableStylesJson = JSON.stringify(SIZE_CHART_10121.applicableStyles);
    const sizesJson = JSON.stringify(SIZE_CHART_10121.sizes);
    const measurementsJson = JSON.stringify(SIZE_CHART_10121.measurements);

    await client.query(`
      INSERT INTO "SizeChart" ("id", "styleNumber", "title", "applicableStyles", "sizes", "measurements", "unit", "updatedAt")
      VALUES ($1, $2, $3, $4::jsonb, $5::jsonb, $6::jsonb, $7, CURRENT_TIMESTAMP)
      ON CONFLICT ("styleNumber") DO UPDATE SET
        "title" = EXCLUDED."title",
        "applicableStyles" = EXCLUDED."applicableStyles",
        "sizes" = EXCLUDED."sizes",
        "measurements" = EXCLUDED."measurements",
        "unit" = EXCLUDED."unit",
        "updatedAt" = CURRENT_TIMESTAMP
    `, [chartId, "10121", SIZE_CHART_10121.title, applicableStylesJson, sizesJson, measurementsJson, SIZE_CHART_10121.unit]);
    console.log("✓ SizeChart record ensured for Article 10121.");

    // Update 10121 products with sizeChart and sizeChartMeasurements JSON
    const products10121 = await client.query(`
      SELECT id, sku, "size"
      FROM "Product"
      WHERE "baseStyleNumber" = '10121'
         OR "styleNumber" LIKE '10121%'
         OR sku LIKE '10121%'
    `);

    console.log(`Found ${products10121.rows.length} product variants for Article 10121 to update with Size Chart JSON.`);

    const chartJson = JSON.stringify(SIZE_CHART_10121);
    for (const prod of products10121.rows) {
      const singleSpec = getSingleSizeSpecs(prod.size, SIZE_CHART_10121);
      const singleSpecJson = JSON.stringify(singleSpec);

      await client.query(`
        UPDATE "Product"
        SET "sizeChart" = $1::jsonb,
            "sizeChartMeasurements" = $2::jsonb,
            "updatedAt" = CURRENT_TIMESTAMP
        WHERE id = $3
      `, [chartJson, singleSpecJson, prod.id]);
    }
    console.log(`✓ Updated all ${products10121.rows.length} variants of 10121 with size chart JSON.`);

  } finally {
    client.release();
    await pool.end();
  }
}

async function run() {
  // Run on Live DB (defaultdb)
  await updateDatabase(liveDbUrl, "Live DB (defaultdb)");
  
  // Also run on Dev DB (garments_dev)
  try {
    await updateDatabase(devDbUrl, "Dev DB (garments_dev)");
  } catch (err) {
    console.warn("Dev DB sync skipped/failed:", err.message);
  }
}

run().catch((err) => {
  console.error("FATAL ERROR:", err);
  process.exit(1);
});
