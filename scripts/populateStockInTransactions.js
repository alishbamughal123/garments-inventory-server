process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

async function populateTransactionsForDb(dbUrl, dbName) {
  console.log(`\n======================================================`);
  console.log(`🚀 POPULATING CLEAN STOCK-IN TRANSACTIONS: ${dbName}`);
  console.log(`======================================================`);

  const pool = new Pool({ connectionString: dbUrl, ssl: { rejectUnauthorized: false } });
  const client = await pool.connect();

  try {
    // 1. Clear any old inventory transactions to ensure clean state
    await client.query('DELETE FROM "InventoryTransaction"');
    console.log(`✓ Cleared old transactions.`);

    // 2. Find admin user to associate transactions
    const userRes = await client.query('SELECT id, name, email FROM "User" WHERE role = \'ADMIN\' ORDER BY "createdAt" ASC LIMIT 1');
    const adminUser = userRes.rows[0] || (await client.query('SELECT id, name, email FROM "User" LIMIT 1')).rows[0];
    
    if (!adminUser) {
      throw new Error(`No user found in ${dbName}`);
    }
    console.log(`✓ Using Admin user: ${adminUser.name} (${adminUser.email})`);

    // 3. Fetch all products currently in stock (stockQuantity > 0)
    const prodRes = await client.query('SELECT id, sku, "productName", "styleNumber", "stockQuantity", "createdAt" FROM "Product" WHERE "stockQuantity" > 0 ORDER BY sku ASC');
    const inStockProducts = prodRes.rows;
    console.log(`✓ Found ${inStockProducts.length} in-stock products (variants) to record Stock In transactions for.`);

    let insertedCount = 0;
    let totalQty = 0;

    for (const prod of inStockProducts) {
      const qty = Number(prod.stockQuantity);
      totalQty += qty;

      const query = `
        INSERT INTO "InventoryTransaction" (
          id,
          "transactionType",
          quantity,
          "previousStock",
          "newStock",
          notes,
          "productId",
          "performedById",
          "packagingWeightKg",
          "createdAt"
        ) VALUES (
          gen_random_uuid(),
          'STOCK_IN',
          $1,
          0,
          $1,
          $2,
          $3,
          $4,
          0.2,
          $5
        )
      `;

      const note = `Initial Stock In from Packing List`;
      const date = prod.createdAt || new Date();

      await client.query(query, [qty, note, prod.id, adminUser.id, date]);
      insertedCount++;
    }

    // 4. Verify transaction counts
    const verifyRes = await client.query(`
      SELECT 
        COUNT(*) as total_txs,
        SUM(quantity) as total_tx_quantity,
        COUNT(DISTINCT "productId") as distinct_products
      FROM "InventoryTransaction"
      WHERE "transactionType" = 'STOCK_IN'
    `);

    const totalTxs = parseInt(verifyRes.rows[0].total_txs, 10);
    const totalTxQty = parseInt(verifyRes.rows[0].total_tx_quantity, 10);
    const distinctProds = parseInt(verifyRes.rows[0].distinct_products, 10);

    console.log(`\n--- Verification Results for ${dbName} ---`);
    console.log(`• Total Stock In Transactions Created: ${totalTxs}`);
    console.log(`• Distinct Products Represented: ${distinctProds}`);
    console.log(`• Total Transaction Pieces Logged: ${totalTxQty.toLocaleString()} (Expected: 7,870)`);

    if (totalTxs === inStockProducts.length && totalTxQty === 7870) {
      console.log(`🎉 SUCCESS: ${dbName} Transactions & Stock In History are 100% matched with active inventory (7,870 pieces)!`);
    } else {
      console.warn(`⚠️ Warning: Created ${totalTxs} transactions totaling ${totalTxQty} pcs.`);
    }

  } finally {
    client.release();
    await pool.end();
  }
}

async function main() {
  const envLivePath = 'D:/Inventory management (2)/Inventory management/server/.env.live';
  const envDevPath = 'D:/Inventory management (2)/Inventory management/server/.env';

  const envLive = fs.readFileSync(envLivePath, 'utf8');
  const envDev = fs.readFileSync(envDevPath, 'utf8');

  const liveUrl = envLive.match(/DATABASE_URL=["']?([^"'\r\n]+)["']?/)[1];
  const devUrl = envDev.match(/DATABASE_URL=["']?([^"'\r\n]+)["']?/)[1];

  // 1. Update Live Database
  await populateTransactionsForDb(liveUrl, 'LIVE DATABASE (defaultdb)');

  // 2. Update Dev Database
  await populateTransactionsForDb(devUrl, 'DEV DATABASE (garments_dev)');
}

main().catch(console.error);
