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

/*
|--------------------------------------------------------------------------
| GET RETURN BY ID
|--------------------------------------------------------------------------
*/

const getReturnById = async (id) => {
  const returnRecord = await prisma.return.findUnique({
    where: { id },
    include: {
      product: true,
      processedBy: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
    },
  });

  if (!returnRecord) {
    throw new Error("Return record not found");
  }

  return returnRecord;
};

/*
|--------------------------------------------------------------------------
| DELETE RETURN
|--------------------------------------------------------------------------
*/

const deleteReturn = async (id) => {
  // First find the return to know if we need to adjust stock
  const returnRecord = await prisma.return.findUnique({
    where: { id },
    include: { product: true },
  });

  if (!returnRecord) {
    throw new Error("Return record not found");
  }

  return await prisma.$transaction(async (tx) => {
    // If it was usable, it added to stock, so we should subtract it back if we delete the record
    // This is optional depending on business logic, but usually deleting a return should revert its effects
    if (returnRecord.conditionStatus === "USABLE") {
      await tx.product.update({
        where: { id: returnRecord.productId },
        data: {
          stockQuantity: {
            decrement: returnRecord.returnQuantity,
          },
        },
      });
    }

    return await tx.return.delete({
      where: { id },
    });
  });
};

/*
|--------------------------------------------------------------------------
| UPDATE RETURN
|--------------------------------------------------------------------------
*/

const updateReturn = async (id, payload) => {
  const existingReturn = await prisma.return.findUnique({
    where: { id },
    include: { product: true },
  });

  if (!existingReturn) {
    throw new Error("Return record not found");
  }

  return await prisma.$transaction(async (tx) => {
    // Handle Stock Adjustment if Condition Status changes
    if (payload.conditionStatus && payload.conditionStatus !== existingReturn.conditionStatus) {
      // If it was USABLE and now it's not -> Subtract from stock
      if (existingReturn.conditionStatus === "USABLE" && payload.conditionStatus !== "USABLE") {
        await tx.product.update({
          where: { id: existingReturn.productId },
          data: {
            stockQuantity: {
              decrement: existingReturn.returnQuantity,
            },
          },
        });
      }
      // If it wasn't USABLE and now it is -> Add to stock
      else if (existingReturn.conditionStatus !== "USABLE" && payload.conditionStatus === "USABLE") {
        await tx.product.update({
          where: { id: existingReturn.productId },
          data: {
            stockQuantity: {
              increment: existingReturn.returnQuantity,
            },
          },
        });
      }
    }

    // Update the return record
    return await tx.return.update({
      where: { id },
      data: {
        returnReason: payload.returnReason,
        conditionStatus: payload.conditionStatus,
      },
    });
  });
};

module.exports = {
  processReturn,
  getReturns,
  getReturnById,
  deleteReturn,
  updateReturn,
};