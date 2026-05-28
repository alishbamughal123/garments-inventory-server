
const { z } = require("zod");

const createSaleSchema =
  z.object({
  
customerId:
  z.string().optional().nullable(),


    subtotal:
      z.number(),

    discount:
      z.number().optional(),

    tax:
      z.number().optional(),

    grandTotal:
      z.number(),

    paymentMethod:
      z.enum([
        "CASH",
        "CARD",
        "BANK_TRANSFER",
        "JAZZCASH",
        "EASYPAISA",
      ]),

    notes:
      z.string().optional(),

    items: z.array(
      z.object({
        productId:
          z.string(),

        quantity:
          z.number(),

        unitPrice:
          z.number(),

        totalPrice:
          z.number(),
      })
    ),
  });

module.exports = {
  createSaleSchema,
};
