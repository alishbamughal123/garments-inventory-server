process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
const { Pool } = require("pg");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.join(__dirname, "../.env.live") });
if (!process.env.DATABASE_URL) {
  dotenv.config({ path: path.join(__dirname, "../.env") });
}

const liveDbUrl = (process.env.DATABASE_URL || "").replace("/garments_dev", "/defaultdb");

const priceRules = [
  // 10101
  { baseStyle: "10101", colors: ["Black", "Sort"], usd: 3.81, nok: 45.72 },

  // 10102
  { baseStyle: "10102", colors: ["Black", "Sort"], usd: 4.93, nok: 59.16 },

  // 10125
  { baseStyle: "10125", colors: ["Black", "Sort"], usd: 4.19, nok: 50.28 },

  // 10126
  { baseStyle: "10126", colors: ["Black", "Sort"], usd: 5.31, nok: 63.72 },

  // 10115
  { baseStyle: "10115", colors: ["Black", "Sort"], usd: 2.56, nok: 30.72 },
  { baseStyle: "10115", colors: ["Light Grey", "Lys grå", "Grey", "Grå"], usd: 2.56, nok: 30.72 },

  // 10106
  { baseStyle: "10106", colors: ["White", "Hvit"], usd: 7.36, nok: 88.32 },
  { baseStyle: "10106", colors: ["Navy", "Marine", "Navy Blue", "Marineblå"], usd: 8.26, nok: 99.12 },
  { baseStyle: "10106", colors: ["Grey", "Grå", "Lys grå"], usd: 8.26, nok: 99.12 },

  // 10103
  { baseStyle: "10103", colors: ["White", "Hvit"], usd: 8.86, nok: 106.32 },

  // 10107
  { baseStyle: "10107", colors: ["White", "Hvit"], usd: 5.71, nok: 68.52 },
  { baseStyle: "10107", colors: ["Navy", "Marine", "Navy Blue", "Marineblå"], usd: 7.44, nok: 89.28 },

  // 10108
  { baseStyle: "10108", colors: ["White", "Hvit"], usd: 5.71, nok: 68.52 },
  { baseStyle: "10108", colors: ["Navy", "Marine", "Navy Blue", "Marineblå"], usd: 7.44, nok: 89.28 },
  { baseStyle: "10108", colors: ["Grey", "Grå", "Lys grå"], usd: 7.44, nok: 89.28 },

  // 10105
  { baseStyle: "10105", colors: ["Navy", "Marine", "Navy Blue", "Marineblå"], usd: 7.63, nok: 91.56 },
  { baseStyle: "10105", colors: ["White", "Hvit"], usd: 7.63, nok: 91.56 },

  // 10116
  { baseStyle: "10116", colors: ["White", "Hvit"], usd: 5.71, nok: 68.52 },

  // 10109
  { baseStyle: "10109", colors: ["White", "Hvit"], usd: 9.71, nok: 116.52 },

  // 10113
  { baseStyle: "10113", colors: ["White", "Hvit"], usd: 2.78, nok: 33.36 },

  // 10114
  { baseStyle: "10114", colors: ["White", "Hvit"], usd: 2.78, nok: 33.36 },

  // 20110
  { baseStyle: "20110", colors: ["White", "Hvit"], usd: 9.72, nok: 116.64 },
  { baseStyle: "20110", colors: ["Black", "Sort"], usd: 11.02, nok: 132.24 },

  // 20111
  { baseStyle: "20111", colors: ["White", "Hvit"], usd: 8.66, nok: 103.92 },
  { baseStyle: "20111", colors: ["Black", "Sort"], usd: 10.13, nok: 121.56 },

  // 200120
  { baseStyle: "200120", colors: ["White", "Hvit"], usd: 8.36, nok: 100.32 },
  { baseStyle: "200120", colors: ["Black", "Sort"], usd: 10.13, nok: 121.56 },

  // 200123
  { baseStyle: "200123", colors: ["White", "Hvit"], usd: 10.08, nok: 120.96 },
  { baseStyle: "200123", colors: ["Black", "Sort"], usd: 9.53, nok: 114.36 },

  // 200126
  { baseStyle: "200126", colors: ["Black", "Sort"], usd: 9.30, nok: 111.60 },

  // 200128
  { baseStyle: "200128", colors: ["Black", "Sort"], usd: 2.48, nok: 29.76 },

  // 200127
  { baseStyle: "200127", colors: ["Black", "Sort"], usd: 9.18, nok: 110.16 },

  // 200121
  { baseStyle: "200121", colors: ["Black and white Papi", "Pepita", "Black/white papeta", "Black/White Pepita"], usd: 12.00, nok: 144.00 },

  // 200122
  { baseStyle: "200122", colors: ["Black and white Stri", "Stripe (B/W)", "Black/White Stripes", "Black/white papeta"], usd: 11.31, nok: 135.72 },

  // 200124
  { baseStyle: "200124", colors: ["Black/White Pepita", "Pepita", "Black and white Papi", "Black/white papeta"], usd: 11.22, nok: 134.64 },

  // 200125
  { baseStyle: "200125", colors: ["Black and white Stri", "Black/White Stripes", "Stripe (B/W)", "Black/white papeta"], usd: 9.54, nok: 114.48 }
];

async function applyCostPricesLive() {
  console.log("=== CONNECTING TO LIVE PRODUCTION DATABASE (defaultdb) ===");
  console.log("Target DB:", liveDbUrl.replace(/:[^:@]+@/, ":****@"));

  const pool = new Pool({
    connectionString: liveDbUrl,
    ssl: { rejectUnauthorized: false }
  });

  const client = await pool.connect();
  let totalUpdated = 0;
  const updateSummary = [];

  try {
    for (const rule of priceRules) {
      // Find matching products
      const selectQuery = `
        SELECT id, sku, "productName", color, "purchasePrice"
        FROM "Product"
        WHERE ("baseStyleNumber" = $1 OR "styleNumber" LIKE $2 OR sku LIKE $2)
          AND color = ANY($3)
      `;
      const selectRes = await client.query(selectQuery, [
        rule.baseStyle,
        `${rule.baseStyle}%`,
        rule.colors
      ]);

      if (selectRes.rows.length > 0) {
        const ids = selectRes.rows.map(r => r.id);
        const updateQuery = `
          UPDATE "Product"
          SET "purchasePrice" = $1, "updatedAt" = NOW()
          WHERE id = ANY($2)
        `;
        await client.query(updateQuery, [rule.nok, ids]);

        totalUpdated += ids.length;
        updateSummary.push({
          baseStyle: rule.baseStyle,
          colors: rule.colors.join(", "),
          usdPrice: `$${rule.usd.toFixed(2)}`,
          usdWith20: `$${(rule.usd * 1.2).toFixed(3)}`,
          costPriceNOK: `NOK ${rule.nok.toFixed(2)}`,
          matchedVariants: ids.length
        });
      } else {
        console.warn(`[WARNING] No live products matched for BaseStyle: ${rule.baseStyle}, Colors: [${rule.colors.join(", ")}]`);
      }
    }

    console.table(updateSummary);
    console.log(`\n🎉 SUCCESS: Total live variants updated with exact cost prices: ${totalUpdated}`);

    // Verify verification summary on live DB
    const verifyRes = await client.query(`
      SELECT 
        COUNT(*) as total_products,
        COUNT(*) FILTER (WHERE "purchasePrice" > 0) as priced_products,
        COUNT(*) FILTER (WHERE "purchasePrice" = 0) as zero_cost_products
      FROM "Product"
    `);

    console.log("\n--- LIVE DATABASE VERIFICATION SUMMARY ---");
    console.log(`• Total Products in Live DB: ${verifyRes.rows[0].total_products}`);
    console.log(`• Products with Cost Price > 0: ${verifyRes.rows[0].priced_products} (Expected: 316)`);
    console.log(`• Products Left Unpriced (= 0): ${verifyRes.rows[0].zero_cost_products} (Expected: 309)`);

  } finally {
    client.release();
    await pool.end();
  }
}

applyCostPricesLive().catch(err => {
  console.error("Error executing live update:", err);
  process.exit(1);
});
