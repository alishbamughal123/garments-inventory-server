const prisma = require("../../config/db");

const getDashboardData =
  async () => {
    const totalProducts =
      await prisma.product.count();

    const products =
      await prisma.product.findMany();

    const totalStock =
      products.reduce(
        (sum, item) =>
          sum + item.stockQuantity,
        0
      );

    const lowStockProducts =
  products.filter(
    (item) =>
      item.stockQuantity <=
      item.minStockAlert
  );

const lowStockItems =
  lowStockProducts.length;
    const outOfStockItems =
      products.filter(
        (item) =>
          item.stockQuantity === 0
      ).length;

    const recentTransactions =
      await prisma.inventoryTransaction.findMany(
        {
          take: 5,
          orderBy: {
            createdAt: "desc",
          },
          include: {
            product: true,
          },
        }
      );

    const recentReturns =
      await prisma.return.findMany({
        take: 5,
        orderBy: {
          createdAt: "desc",
        },
        include: {
          product: true,
        },
      });
      const inventoryValue =
  products.reduce(
    (sum, item) =>
      sum +
      Number(item.purchasePrice) *
      item.stockQuantity,
    0
  );
  const potentialRevenue =
  products.reduce(
    (sum, item) =>
      sum +
      Number(item.salePrice) *
      item.stockQuantity,
    0
  );
  const potentialProfit =
  products.reduce(
    (sum, item) =>
      sum +
      (
        Number(item.salePrice) -
        Number(item.purchasePrice)
      ) *
      item.stockQuantity,
    0
  );
  const healthyStock =
  products.filter(
    (item) =>
      item.stockQuantity >
      item.minStockAlert
  ).length;

const lowStock =
  products.filter(
    (item) =>
      item.stockQuantity <=
        item.minStockAlert &&
      item.stockQuantity > 0
  ).length;

const outOfStock =
  products.filter(
    (item) =>
      item.stockQuantity === 0
  ).length;
  const topLowStockProducts =
  products
    .filter(
      (item) =>
        item.stockQuantity <=
        item.minStockAlert
    )
    .sort(
      (a, b) =>
        a.stockQuantity -
        b.stockQuantity
    )
    .slice(0, 5);

   return {
  totalProducts,
  totalStock,

  lowStockItems,
  outOfStockItems,

  inventoryValue,
  potentialRevenue,
 healthyProducts:
  healthyStock,

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