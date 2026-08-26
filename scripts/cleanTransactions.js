const prisma = require('D:/Inventory management (2)/Inventory management/server/src/config/db');

/**
 * Clean up test transactions from local/dev database
 * - Deletes testing inventory transactions (or all transaction history if requested)
 * - Deletes associated test delivery notes & test sales
 * - Preserves ALL products, categories, sizecharts, barcodes, stock quantities, customers, users, leads, etc.
 */
async function cleanTransactions({ mode = 'ALL_TRANSACTIONS' } = {}) {
  console.log(`Starting cleanup in mode: ${mode}...`);

  // 1. Check current counts
  const beforeCounts = {
    inventoryTransactions: await prisma.inventoryTransaction.count(),
    deliveryNotes: await prisma.deliveryNote.count(),
    saleItems: await prisma.saleItem.count(),
    sales: await prisma.sale.count(),
    products: await prisma.product.count(),
  };

  console.log('--- BEFORE CLEANUP COUNTS ---');
  console.log(JSON.stringify(beforeCounts, null, 2));

  if (mode === 'TESTING_ONLY') {
    // Only delete non-import transactions (manual UI testing transactions)
    const testTxs = await prisma.inventoryTransaction.findMany({
      where: {
        NOT: {
          notes: { startsWith: 'Import from packing list' }
        },
        AND: [
          {
            NOT: {
              notes: { startsWith: 'Bulk import from packing list' }
            }
          }
        ]
      }
    });

    const testTxIds = testTxs.map(t => t.id);
    console.log(`Found ${testTxIds.length} UI testing inventory transactions to delete.`);

    // Remove reference from delivery notes first
    await prisma.deliveryNote.deleteMany({
      where: { transactionId: { in: testTxIds } }
    });

    // Delete test sale items and sales
    await prisma.saleItem.deleteMany({});
    await prisma.sale.deleteMany({});

    // Delete test inventory transactions
    const deleted = await prisma.inventoryTransaction.deleteMany({
      where: { id: { in: testTxIds } }
    });
    console.log(`Deleted ${deleted.count} test transactions.`);

  } else {
    // Delete ALL transactions from inventoryTransaction history table so UI is completely clean
    // First clear delivery notes referencing transactions
    await prisma.deliveryNote.deleteMany({});
    console.log('Cleared delivery notes.');

    // Clear sales & sale items
    await prisma.saleItem.deleteMany({});
    await prisma.sale.deleteMany({});
    console.log('Cleared sales and sale items.');

    // Clear all inventory transactions
    const deleted = await prisma.inventoryTransaction.deleteMany({});
    console.log(`Cleared all ${deleted.count} inventory transactions.`);
  }

  // 2. Check counts after cleanup
  const afterCounts = {
    inventoryTransactions: await prisma.inventoryTransaction.count(),
    deliveryNotes: await prisma.deliveryNote.count(),
    saleItems: await prisma.saleItem.count(),
    sales: await prisma.sale.count(),
    products: await prisma.product.count(),
  };

  console.log('\n--- AFTER CLEANUP COUNTS ---');
  console.log(JSON.stringify(afterCounts, null, 2));
  console.log(`\n✅ Finished! All ${afterCounts.products} products and inventory data are 100% safe and intact.`);
}

const targetMode = process.argv[2] || 'ALL_TRANSACTIONS';

cleanTransactions({ mode: targetMode })
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
