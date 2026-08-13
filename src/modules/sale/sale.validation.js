
const { z } = require("zod");

const createSaleSchema = z.object({
  customerId: z.string().optional().nullable(),

  subtotal: z.number(),

  discount: z.number().optional(),

  tax: z.number().optional(),

  grandTotal: z.number(),

  paymentMethod: z.string().min(1, "Payment method is required"),

  notes: z.string().optional().nullable(),

  items: z.array(
    z.object({
      productId: z.string(),

      quantity: z.number().min(1),

      unitPrice: z.number(),

      totalPrice: z.number().optional(),
    })
  ),
});

module.exports = {
  createSaleSchema,
};

