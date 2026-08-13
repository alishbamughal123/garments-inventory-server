
const prisma = require("../../config/db");

/*
|--------------------------------------------------------------------------
| CREATE SALE
|--------------------------------------------------------------------------
*/

const createSale = async (payload, userId) => {
  const {
    customerId,
    subtotal,
    discount = 0,
    tax = 0,
    grandTotal,
    paymentMethod,
    notes,
    items,
  } = payload;

  const invoiceNumber = `INV-${Date.now()}`;

  const result = await prisma.$transaction(async (tx) => {
    let effectiveUserId = userId;
    if (!effectiveUserId) {
      const defaultUser = await tx.user.findFirst();
      effectiveUserId = defaultUser?.id;
    }

    if (!effectiveUserId) {
      throw new Error("No active user found to perform sale transaction");
    }

    /*
    |--------------------------------------------------------------------------
    | STOCK VALIDATION
    |--------------------------------------------------------------------------
    */

    for (const item of items) {
      const product = await tx.product.findUnique({
        where: { id: item.productId },
      });

      if (!product) {
        throw new Error("Product not found");
      }

      if (product.stockQuantity < item.quantity) {
        throw new Error(`${product.productName} is out of stock`);
      }
    }

    /*
    |--------------------------------------------------------------------------
    | CREATE SALE
    |--------------------------------------------------------------------------
    */

    const sale = await tx.sale.create({
      data: {
        invoiceNumber,
        customerId,
        subtotal,
        discount,
        tax,
        grandTotal,
        paymentMethod,
        notes,
      },
    });

    /*
    |--------------------------------------------------------------------------
    | CREATE SALE ITEMS & STOCK OUT TRANSACTIONS
    |--------------------------------------------------------------------------
    */

    for (const item of items) {
      await tx.saleItem.create({
        data: {
          saleId: sale.id,
          productId: item.productId,
          quantity: item.quantity,
          price: Number(item.unitPrice),
          total: Number(item.quantity) * Number(item.unitPrice),
        },
      });

      const product = await tx.product.findUnique({
        where: { id: item.productId },
      });

      const prevStock = product ? product.stockQuantity : 0;
      const newStock = prevStock - item.quantity;

      await tx.product.update({
        where: { id: item.productId },
        data: {
          stockQuantity: newStock,
        },
      });

      await tx.inventoryTransaction.create({
        data: {
          transactionType: "STOCK_OUT",
          quantity: item.quantity,
          previousStock: prevStock,
          newStock: newStock,
          productId: item.productId,
          performedById: effectiveUserId,
        },
      });
    }

    /*
    |--------------------------------------------------------------------------
    | UPDATE CUSTOMER DATA
    |--------------------------------------------------------------------------
    */

    if (customerId) {
      const customer = await tx.customer.findUnique({
        where: { id: customerId },
      });

      if (customer) {
        await tx.customer.update({
          where: { id: customerId },
          data: {
            totalOrders: customer.totalOrders + 1,
            totalSpent: customer.totalSpent + grandTotal,
          },
        });
      }
    }

    return sale;
  });

  return result;
};

/*
|--------------------------------------------------------------------------
| GET ALL SALES
|--------------------------------------------------------------------------
*/

const getSales = async () => {
  try {
    const sales = await prisma.sale.findMany({
      include: {
        customer: true,
        saleItems: {
          include: {
            product: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return sales;
  } catch (error) {
    console.log("GET SALES ERROR:", error);
    throw error;
  }
};

/*
|--------------------------------------------------------------------------
| GET SINGLE SALE
|--------------------------------------------------------------------------
*/

const getSaleById = async (id) => {
  const sale = await prisma.sale.findUnique({
    where: { id },
    include: {
      customer: true,
      saleItems: {
        include: {
          product: true,
        },
      },
    },
  });

  if (!sale) {
    throw new Error("Sale not found");
  }

  return sale;
};

/*
|--------------------------------------------------------------------------
| DELETE SALE
|--------------------------------------------------------------------------
*/

const deleteSale = async (id, userId) => {
  const sale = await prisma.sale.findUnique({
    where: { id },
    include: {
      saleItems: true,
      customer: true,
    },
  });

  if (!sale) {
    throw new Error("Sale not found");
  }

  return await prisma.$transaction(async (tx) => {
    let effectiveUserId = userId;
    if (!effectiveUserId) {
      const defaultUser = await tx.user.findFirst();
      effectiveUserId = defaultUser?.id;
    }

    if (!effectiveUserId) {
      throw new Error("No active user found to perform stock reversion");
    }

    // 1. REVERT STOCK FOR EACH ITEM
    for (const item of sale.saleItems) {
      const product = await tx.product.findUnique({
        where: { id: item.productId },
      });

      const prevStock = product ? product.stockQuantity : 0;
      const newStock = prevStock + item.quantity;

      await tx.product.update({
        where: { id: item.productId },
        data: {
          stockQuantity: newStock,
        },
      });

      await tx.inventoryTransaction.create({
        data: {
          transactionType: "ADJUSTMENT",
          quantity: item.quantity,
          previousStock: prevStock,
          newStock: newStock,
          notes: `Reversion from deleted sale ${sale.invoiceNumber}`,
          productId: item.productId,
          performedById: effectiveUserId,
        },
      });
    }

    // 2. REVERT CUSTOMER TOTALS
    if (sale.customerId && sale.customer) {
      await tx.customer.update({
        where: { id: sale.customerId },
        data: {
          totalOrders: Math.max(0, sale.customer.totalOrders - 1),
          totalSpent: Math.max(0, sale.customer.totalSpent - sale.grandTotal),
        },
      });
    }

    // 3. DELETE SALE ITEMS FIRST
    await tx.saleItem.deleteMany({
      where: { saleId: id },
    });

    // 4. DELETE SALE
    return await tx.sale.delete({
      where: { id },
    });
  });
};

/*
|--------------------------------------------------------------------------
| UPDATE SALE (BASIC)
|--------------------------------------------------------------------------
*/

const updateSale = async (id, payload) => {
  const sale = await prisma.sale.findUnique({
    where: { id },
  });

  if (!sale) {
    throw new Error("Sale not found");
  }

  return await prisma.sale.update({
    where: { id },
    data: {
      notes: payload.notes,
      paymentMethod: payload.paymentMethod,
    },
  });
};

module.exports = {
  createSale,
  getSales,
  getSaleById,
  deleteSale,
  updateSale,
};

