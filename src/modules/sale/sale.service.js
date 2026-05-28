
const prisma =
  require("../../config/db");

/*
|--------------------------------------------------------------------------
| CREATE SALE
|--------------------------------------------------------------------------
*/

const createSale =
  async (payload,  userId) => {
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

    const invoiceNumber =
      `INV-${Date.now()}`;

    const result =
      await prisma.$transaction(
        async (tx) => {

          /*
          |--------------------------------------------------------------------------
          | STOCK VALIDATION
          |--------------------------------------------------------------------------
          */

          for (const item of items) {
            const product =
              await tx.product.findUnique(
                {
                  where: {
                    id: item.productId,
                  },
                }
              );

            if (!product) {
              throw new Error(
                "Product not found"
              );
            }

            if (
              product.stockQuantity <
              item.quantity
            ) {
              throw new Error(
                `${product.productName} is out of stock`
              );
            }
          }

          /*
          |--------------------------------------------------------------------------
          | CREATE SALE
          |--------------------------------------------------------------------------
          */

          const sale =
            await tx.sale.create({
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
          | CREATE SALE ITEMS
          |--------------------------------------------------------------------------
          */

          for (const item of items) {

        
await tx.saleItem.create({
  data: {
    saleId: sale.id,

    productId:
      item.productId,

    quantity:
      item.quantity,

   
price:
  Number(item.unitPrice),

total:
  Number(item.quantity) *
  Number(item.unitPrice),
  },
});



            /*
            |--------------------------------------------------------------------------
            | UPDATE PRODUCT STOCK
            |--------------------------------------------------------------------------
            */

            const product =
              await tx.product.findUnique(
                {
                  where: {
                    id: item.productId,
                  },
                }
              );

            await tx.product.update({
              where: {
                id: item.productId,
              },

              data: {
                stockQuantity:
                  product.stockQuantity -
                  item.quantity,
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
        "STOCK_OUT",

      quantity:
        item.quantity,

      previousStock:
        product.stockQuantity,

      newStock:
        product.stockQuantity -
        item.quantity,

      productId:
        item.productId,

      performedById:
        userId,
    },
  }
);


          }

          /*
          |--------------------------------------------------------------------------
          | UPDATE CUSTOMER DATA
          |--------------------------------------------------------------------------
          */

          if (customerId) {
            const customer =
              await tx.customer.findUnique(
                {
                  where: {
                    id: customerId,
                  },
                }
              );

            if (customer) {
              await tx.customer.update(
                {
                  where: {
                    id: customerId,
                  },

                  data: {
                    totalOrders:
                      customer.totalOrders +
                      1,

                    totalSpent:
                      customer.totalSpent +
                      grandTotal,
                  },
                }
              );
            }
          }

          return sale;
        }
      );

    return result;
  };

/*
|--------------------------------------------------------------------------
| GET ALL SALES
|--------------------------------------------------------------------------
*/

const getSales = async () => {
  try {

    const sales =
      await prisma.sale.findMany({
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

    console.log(
      "GET SALES ERROR:",
      error
    );

    throw error;
  }
};

/*
|--------------------------------------------------------------------------
| GET SINGLE SALE
|--------------------------------------------------------------------------
*/

const getSaleById =
  async (id) => {
    const sale =
      await prisma.sale.findUnique(
        {
          where: { id },

          include: {
            customer: true,

            saleItems: {
              include: {
                product: true,
              },
            },
          },
        }
      );

    if (!sale) {
      throw new Error(
        "Sale not found"
      );
    }

    return sale;
  };

module.exports = {
  createSale,
  getSales,
  getSaleById,
};
