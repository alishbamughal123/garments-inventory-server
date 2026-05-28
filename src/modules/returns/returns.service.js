const prisma = require("../../config/db");

/*
|--------------------------------------------------------------------------
| FIND PRODUCT BY BARCODE
|--------------------------------------------------------------------------
*/

const findProductByBarcode =
  async (barcodeValue) => {
    const barcode =
      await prisma.barcode.findUnique({
        where: {
          barcodeValue,
        },

        include: {
          product: true,
        },
      });

    if (!barcode) {
      throw new Error(
        "Barcode not found"
      );
    }

    return barcode.product;
  };

/*
|--------------------------------------------------------------------------
| PROCESS RETURN
|--------------------------------------------------------------------------
*/

const processReturn =
  async (payload, userId) => {
    // FIND PRODUCT
    const product =
      await findProductByBarcode(
        payload.barcode
      );

    const previousStock =
      product.stockQuantity;

    /*
    |--------------------------------------------------------------------------
    | TRANSACTION
    |--------------------------------------------------------------------------
    */

    const result =
      await prisma.$transaction(
        async (tx) => {
          let updatedStock =
            previousStock;

          /*
          |--------------------------------------------------------------------------
          | RESTORE STOCK IF USABLE
          |--------------------------------------------------------------------------
          */

          if (
            payload.conditionStatus ===
            "USABLE"
          ) {
            updatedStock =
              previousStock +
              payload.quantity;

            // UPDATE STOCK
            await tx.product.update({
              where: {
                id: product.id,
              },

              data: {
                stockQuantity:
                  updatedStock,
              },
            });
          }

          /*
          |--------------------------------------------------------------------------
          | CREATE RETURN RECORD
          |--------------------------------------------------------------------------
          */

          const returnRecord =
            await tx.return.create({
              data: {
                returnQuantity:
                  payload.quantity,

                returnReason:
                  payload.returnReason,

                conditionStatus:
                  payload.conditionStatus,

                productId:
                  product.id,

                processedById:
                  userId,
              },
            });

          /*
          |--------------------------------------------------------------------------
          | CREATE INVENTORY TRANSACTION
          |--------------------------------------------------------------------------
          */

          await tx.inventoryTransaction.create(
            {
              data: {
                transactionType:
                  "RETURN",

                quantity:
                  payload.quantity,

                previousStock,

                newStock:
                  updatedStock,

                notes:
                  payload.returnReason ||
                  "Customer return",

                productId:
                  product.id,

                performedById:
                  userId,
              },
            }
          );

          return {
            returnRecord,

            stockRestored:
              payload.conditionStatus ===
              "USABLE",

            previousStock,

            newStock:
              updatedStock,
          };
        }
      );

    return result;
  };

/*
|--------------------------------------------------------------------------
| GET RETURNS
|--------------------------------------------------------------------------
*/

const getReturns = async () => {
  const returns =
    await prisma.return.findMany({
      include: {
        product: true,

        processedBy: {
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
    });

  return returns;
};

module.exports = {
  processReturn,
  getReturns,
};