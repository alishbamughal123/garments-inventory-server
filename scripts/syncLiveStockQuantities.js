process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
const { Pool } = require('pg');
require('dotenv').config();

// Exact packing list stock quantities per SKU (169 SKUs, 7,870 Total Pieces)
const skuStockMap = {
  // 1. Style 10101 (Black T-Shirt, 14 ctns, 651 pcs)
  "10101-XS-B": 40,
  "10101-S-B": 103,
  "10101-M-B": 49,
  "10101-L-B": 144,
  "10101-XL-B": 157,
  "10101-2XL-B": 91,
  "10101-3XL-B": 67,

  // 2. Style 10102 (Black Polo shirt, 22 ctns, 635 pcs)
  "10102-XS-B": 67,
  "10102-S-B": 76,
  "10102-M-B": 6,
  "10102-L-B": 111,
  "10102-XL-B": 203,
  "10102-2XL-B": 112,
  "10102-3XL-B": 60,

  // 3. Style 10125 (Black T-Shirt, 9 ctns, 400 pcs)
  "10125-M-B": 90,
  "10125-L-B": 130,
  "10125-XL-B": 130,
  "10125-2XL-B": 50,

  // 4. Style 10126 (Black Polo shirt, 14 ctns, 400 pcs)
  "10126-M-B": 90,
  "10126-L-B": 130,
  "10126-XL-B": 130,
  "10126-2XL-B": 50,

  // 5. Style 10115 (Apron, 41 ctns, 1971 pcs)
  "10115-1-B": 1721,
  "10115-1-LG": 250,

  // 6. Style 10106 (Scrub unisex, 6 ctns, 224 pcs)
  // White (68 pcs)
  "10106-XS-W": 6,
  "10106-S-W": 4,
  "10106-M-W": 11,
  "10106-L-W": 25,
  "10106-XL-W": 11,
  "10106-2XL-W": 11,
  // Navy (97 pcs)
  "10106-XS-N": 6,
  "10106-S-N": 17,
  "10106-M-N": 16,
  "10106-L-N": 37,
  "10106-XL-N": 16,
  "10106-2XL-N": 5,
  // Grey / Grå (59 pcs)
  "10106-XS-G": 3,
  "10106-S-G": 10,
  "10106-M-G": 10,
  "10106-L-G": 22,
  "10106-XL-G": 11,
  "10106-2XL-G": 3,

  // 7. Style 10103 (shirts White, 5 ctns, 153 pcs)
  "10103-35/36-W": 29,
  "10103-37/38-W": 36,
  "10103-39/40-W": 25,
  "10103-41/42-W": 23,
  "10103-43/44-W": 16,
  "10103-45/46-W": 9,
  "10103-47/48-W": 4,
  "10103-49/50-W": 6,
  "10103-51/52-W": 5,

  // 8. Style 10107 (Trouser unisex, 6 ctns, 196 pcs)
  // White (100 pcs)
  "10107-XS-W": 5,
  "10107-S-W": 17,
  "10107-M-W": 22,
  "10107-L-W": 27,
  "10107-XL-W": 22,
  "10107-2XL-W": 3,
  "10107-3XL-W": 4,
  // Navy (96 pcs)
  "10107-S-N": 11,
  "10107-M-N": 25,
  "10107-L-N": 32,
  "10107-XL-N": 19,
  "10107-2XL-N": 6,
  "10107-3XL-N": 3,

  // 9. Style 10108 (Trouser unisex, 6 ctns, 210 pcs)
  // White (63 pcs)
  "10108-XS-W": 3,
  "10108-S-W": 11,
  "10108-M-W": 11,
  "10108-L-W": 20,
  "10108-XL-W": 10,
  "10108-2XL-W": 8,
  // Navy (89 pcs)
  "10108-XS-N": 11,
  "10108-S-N": 16,
  "10108-M-N": 27,
  "10108-L-N": 27,
  "10108-XL-N": 5,
  "10108-2XL-N": 3,
  // Grey / Grå (58 pcs)
  "10108-XS-G": 3,
  "10108-S-G": 10,
  "10108-M-G": 10,
  "10108-L-G": 21,
  "10108-XL-G": 11,
  "10108-2XL-G": 3,

  // 10. Style 10105 (Scrub unisex White & Trouser unisex Navy, 6 ctns, 269 pcs)
  // Trouser Navy (147 pcs)
  "10105-XS-N": 6,
  "10105-S-N": 21,
  "10105-M-N": 25,
  "10105-L-N": 60,
  "10105-XL-N": 25,
  "10105-2XL-N": 6,
  "10105-3XL-N": 4,
  // Scrub White (122 pcs)
  "10105-XS-W": 11,
  "10105-S-W": 16,
  "10105-M-W": 21,
  "10105-L-W": 48,
  "10105-XL-W": 21,
  "10105-2XL-W": 3,
  "10105-3XL-W": 2,

  // 11. Style 10116 (Trouser unisex White, 3 ctns, 100 pcs)
  "10116-XS-W": 8,
  "10116-S-W": 14,
  "10116-M-W": 22,
  "10116-L-W": 22,
  "10116-XL-W": 24,
  "10116-2XL-W": 5,
  "10116-3XL-W": 5,

  // 12. Style 10109 (Coat White, 2 ctns, 24 pcs)
  "10109-XS-W": 5,
  "10109-S-W": 5,
  "10109-M-W": 5,
  "10109-L-W": 5,
  "10109-XL-W": 4,

  // 13. Style 10113 (Chef hat White, 1 ctn, 21 pcs)
  "10113-1-W": 21,

  // 14. Style 10114 (Chef hat White, 1 ctn, 21 pcs)
  "10114-1-W": 21,

  // 15. Style 20110 (Jackets White & Black, 50 ctns, 1425 pcs)
  // White (701 pcs)
  "20110-S-W": 73,
  "20110-M-W": 204,
  "20110-L-W": 184,
  "20110-XL-W": 113,
  "20110-2XL-W": 64,
  "20110-3XL-W": 23,
  "20110-4XL-W": 22,
  "20110-5XL-W": 18,
  // Black (724 pcs)
  "20110-S-B": 79,
  "20110-M-B": 212,
  "20110-L-B": 186,
  "20110-XL-B": 117,
  "20110-2XL-B": 66,
  "20110-3XL-B": 23,
  "20110-4XL-B": 23,
  "20110-5XL-B": 18,

  // 16. Style 20111 (Jackets White & Black, 19 ctns, 473 pcs)
  // White (240 pcs)
  "20111-S-W": 27,
  "20111-M-W": 75,
  "20111-L-W": 62,
  "20111-XL-W": 39,
  "20111-2XL-W": 21,
  "20111-3XL-W": 8,
  "20111-4XL-W": 8,
  // Black (233 pcs)
  "20111-S-B": 28,
  "20111-M-B": 65,
  "20111-L-B": 63,
  "20111-XL-B": 40,
  "20111-2XL-B": 23,
  "20111-3XL-B": 7,
  "20111-4XL-B": 7,

  // 17. Style 200120 (Trousers White & Black, 5 ctns, 101 pcs)
  // White (49 pcs)
  "200120-48-W": 20,
  "200120-52-W": 18,
  "200120-62-W": 11,
  // Black (52 pcs)
  "200120-48-B": 20,
  "200120-52-B": 21,
  "200120-62-B": 11,

  // 18. Style 200121 (Trousers Black and white Papi, 3 ctns, 52 pcs)
  "200121-48-BWP": 20,
  "200121-52-BWP": 21,
  "200121-62-BWP": 11,

  // 19. Style 200122 (Trousers Black and white Stri, 3 ctns, 50 pcs)
  "200122-48-BWS": 20,
  "200122-52-BWS": 19,
  "200122-62-BWS": 11,

  // 20. Style 200123 (Trousers White & Black, 4 ctns, 101 pcs)
  // White (53 pcs)
  "200123-44-W": 10,
  "200123-46-W": 11,
  "200123-48-W": 32,
  // Black (48 pcs)
  "200123-44-B": 9,
  "200123-46-B": 11,
  "200123-48-B": 28,

  // 21. Style 200124 (Trousers Black and white Papi, 2 ctns, 52 pcs)
  "200124-44-BWP": 10,
  "200124-46-BWP": 11,
  "200124-48-BWP": 31,

  // 22. Style 200125 (Trousers Black and white Stri, 2 ctns, 33 pcs)
  "200125-44-BWS": 8,
  "200125-46-BWS": 8,
  "200125-48-BWS": 17,

  // 23. Style 200126 (Trousers Black, 2 ctns, 50 pcs)
  "200126-42-B": 23,
  "200126-58-B": 27,

  // 24. Style 200128 (Apron Black, 3 ctns, 209 pcs)
  "200128-80X45-B": 209,

  // 25. Style 200127 (Trousers Black, 2 ctns, 49 pcs)
  "200127-XS-B": 38,
  "200127-5XL-B": 11,
};

async function updateDatabaseStock(dbUrl, dbName) {
  console.log(`\n======================================================`);
  console.log(`🔄 Updating stock quantities in ${dbName}...`);
  console.log(`======================================================`);

  const pool = new Pool({ connectionString: dbUrl, ssl: { rejectUnauthorized: false } });
  const client = await pool.connect();

  try {
    // Step 1: Set ALL products stockQuantity to 0 by default
    console.log(`1. Setting stockQuantity = 0 for ALL products in ${dbName}...`);
    const resetRes = await client.query('UPDATE "Product" SET "stockQuantity" = 0');
    console.log(`✓ Reset ${resetRes.rowCount} products to 0 stock.`);

    // Step 2: Apply the exact stock quantities for the 169 packing list items
    console.log(`2. Updating stock for ${Object.keys(skuStockMap).length} packing list SKUs...`);
    let updatedCount = 0;
    for (const [sku, qty] of Object.entries(skuStockMap)) {
      const updateRes = await client.query(
        'UPDATE "Product" SET "stockQuantity" = $1 WHERE sku = $2 OR "styleNumber" = $2',
        [qty, sku]
      );
      if (updateRes.rowCount > 0) {
        updatedCount += updateRes.rowCount;
      } else {
        console.warn(`⚠️ Warning: SKU ${sku} not found during update!`);
      }
    }
    console.log(`✓ Successfully updated ${updatedCount} product variants with packing list quantities.`);

    // Step 3: Verify Grand Total stockQuantity in database
    const sumRes = await client.query('SELECT SUM("stockQuantity") as total_stock, COUNT(*) as total_products, COUNT(*) FILTER (WHERE "stockQuantity" > 0) as active_stock_products, COUNT(*) FILTER (WHERE "stockQuantity" = 0) as zero_stock_products FROM "Product"');
    const totalStock = parseInt(sumRes.rows[0].total_stock, 10);
    const totalProducts = parseInt(sumRes.rows[0].total_products, 10);
    const activeProducts = parseInt(sumRes.rows[0].active_stock_products, 10);
    const zeroProducts = parseInt(sumRes.rows[0].zero_stock_products, 10);

    console.log(`\n--- Verification Results for ${dbName} ---`);
    console.log(`• Total Products in DB: ${totalProducts}`);
    console.log(`• Products with Stock > 0: ${activeProducts} (Expected: ${Object.keys(skuStockMap).length})`);
    console.log(`• Products with Stock = 0: ${zeroProducts}`);
    console.log(`• Grand Total Stock Quantity: ${totalStock.toLocaleString()} (Expected: 7,870)`);

    if (totalStock === 7870 && activeProducts === Object.keys(skuStockMap).length) {
      console.log(`\n🎉 SUCCESS: ${dbName} is 100% synchronized and verified! Grand total is exactly 7,870 pieces.`);
    } else {
      console.error(`\n❌ MISMATCH in ${dbName}: Expected total 7870, got ${totalStock}. Active products: ${activeProducts}`);
    }
  } finally {
    client.release();
    await pool.end();
  }
}

async function run() {
  const liveUrl = (process.env.DATABASE_URL || '').replace('/garments_dev', '/defaultdb');
  const devUrl = (process.env.DATABASE_URL || '').replace('/defaultdb', '/garments_dev');

  // Update Live Database (defaultdb)
  await updateDatabaseStock(liveUrl, 'Live DB (defaultdb)');

  // Also update Dev Database (garments_dev) to keep in sync
  await updateDatabaseStock(devUrl, 'Dev DB (garments_dev)');
}

run().catch(console.error);
