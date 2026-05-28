const prisma = require("../../config/db");

/*
|--------------------------------------------------------------------------
| FIND PRODUCT BY BARCODE
|--------------------------------------------------------------------------
*/

const findProductByBarcode = async (barcodeValue) => {
  const barcode = await prisma.barcode.findUnique({
    where: {
      barcodeValue,
    },

    include: {
      product: true,
    },
  });

  if (!barcode) {
    throw new Error("Barcode not found");
  }

  return barcode.product;
};

/*
|--------------------------------------------------------------------------
| STOCK IN
|--------------------------------------------------------------------------
*/

const stockIn = async (
  payload,
  userId
) => {
  // FIND PRODUCT
  const product =
    await findProductByBarcode(
      payload.barcode
    );

  const previousStock =
    product.stockQuantity;

  const newStock =
    previousStock +
    payload.quantity;

  /*
  |--------------------------------------------------------------------------
  | TRANSACTION
  |--------------------------------------------------------------------------
  */

  const updatedProduct =
    await prisma.$transaction(
      async (tx) => {
        // UPDATE STOCK
        const updated =
          await tx.product.update({
            where: {
              id: product.id,
            },

            data: {
              stockQuantity:
                newStock,
            },
          });

        // CREATE TRANSACTION
        await tx.inventoryTransaction.create(
          {
            data: {
              transactionType:
                "STOCK_IN",

              quantity:
                payload.quantity,

              previousStock,

              newStock,

              notes:
                payload.notes ||
                "Stock added",

              productId:
                product.id,

              performedById:
                userId,
            },
          }
        );

        return updated;
      }
    );

  return updatedProduct;
};

/*
|--------------------------------------------------------------------------
| STOCK OUT
|--------------------------------------------------------------------------
*/

const stockOut = async (
  payload,
  userId
) => {
  // FIND PRODUCT
  const product =
    await findProductByBarcode(
      payload.barcode
    );

  const previousStock =
    product.stockQuantity;

  /*
  |--------------------------------------------------------------------------
  | NEGATIVE STOCK VALIDATION
  |--------------------------------------------------------------------------
  */

  if (
    payload.quantity >
    previousStock
  ) {
    throw new Error(
      "Insufficient stock available"
    );
  }

  const newStock =
    previousStock -
    payload.quantity;

  /*
  |--------------------------------------------------------------------------
  | TRANSACTION
  |--------------------------------------------------------------------------
  */

  const updatedProduct =
    await prisma.$transaction(
      async (tx) => {
        // UPDATE STOCK
        const updated =
          await tx.product.update({
            where: {
              id: product.id,
            },

            data: {
              stockQuantity:
                newStock,
            },
          });

        // CREATE TRANSACTION
        await tx.inventoryTransaction.create(
          {
            data: {
              transactionType:
                "STOCK_OUT",

              quantity:
                payload.quantity,

              previousStock,

              newStock,

              notes:
                payload.notes ||
                "Stock deducted",

              productId:
                product.id,

              performedById:
                userId,
            },
          }
        );

        return updated;
      }
    );

  return updatedProduct;
};

/*
|--------------------------------------------------------------------------
| GET INVENTORY TRANSACTIONS
|--------------------------------------------------------------------------
*/

const getTransactions =
  async () => {
    const transactions =
      await prisma.inventoryTransaction.findMany(
        {
          include: {
            product: true,

           performedBy: {
  select: {
    id: true,
    name: true,
    email: true,
    role: true,
  },
}
          },

          orderBy: {
            createdAt: "desc",
          },
        }
      );

    return transactions;
  };

module.exports = {
  stockIn,
  stockOut,
  getTransactions,
};