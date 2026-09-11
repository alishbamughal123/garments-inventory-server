const prisma = require("../../config/db");

const getDashboardData = async () => {
  const [totalProducts, products, recentTransactions, recentReturns] =
    await Promise.all([
      prisma.product.count(),
      prisma.product.findMany({
        select: {
          id: true,
          productName: true,
          sku: true,
          stockQuantity: true,
          minStockAlert: true,
          purchasePrice: true,
          salePrice: true,
          imageUrl: true,
        },
      }),
      prisma.inventoryTransaction.findMany({
        take: 5,
        orderBy: {
          createdAt: "desc",
        },
        select: {
          id: true,
          transactionType: true,
          quantity: true,
          previousStock: true,
          newStock: true,
          createdAt: true,
          referenceNumber: true,
          notes: true,
          product: {
            select: {
              id: true,
              productName: true,
              sku: true,
              imageUrl: true,
            },
          },
        },
      }),
      prisma.return.findMany({
        take: 5,
        orderBy: {
          createdAt: "desc",
        },
        select: {
          id: true,
          returnQuantity: true,
          returnReason: true,
          conditionStatus: true,
          createdAt: true,
          product: {
            select: {
              id: true,
              productName: true,
              sku: true,
              imageUrl: true,
            },
          },
        },
      }),
    ]);

  let totalStock = 0;
  let inventoryValue = 0;
  let potentialRevenue = 0;
  let potentialProfit = 0;
  let healthyStock = 0;
  let lowStock = 0;
  let outOfStock = 0;
  const lowStockProducts = [];

  for (const item of products) {
    const qty = item.stockQuantity || 0;
    const minAlert = item.minStockAlert || 5;
    const purchase = Number(item.purchasePrice || 0);
    const sale = Number(item.salePrice || 0);

    totalStock += qty;
    inventoryValue += purchase * qty;
    potentialRevenue += sale * qty;
    potentialProfit += (sale - purchase) * qty;

    if (qty === 0) {
      outOfStock++;
      lowStockProducts.push(item);
    } else if (qty <= minAlert) {
      lowStock++;
      lowStockProducts.push(item);
    } else {
      healthyStock++;
    }
  }

  const topLowStockProducts = lowStockProducts
    .sort((a, b) => (a.stockQuantity || 0) - (b.stockQuantity || 0))
    .slice(0, 5);

  return {
    totalProducts,
    totalStock,
    lowStockItems: lowStock,
    outOfStockItems: outOfStock,
    inventoryValue: Number(inventoryValue.toFixed(2)),
    potentialRevenue: Number(potentialRevenue.toFixed(2)),
    healthyProducts: healthyStock,
    stockHealth: {
      healthyStock,
      lowStock,
      outOfStock,
    },
    topLowStockProducts,
    recentTransactions,
    recentReturns,
  };
};

module.exports = {
  getDashboardData,
};