const { z } = require("zod");

const createProductSchema = z.object({
  productName: z.string().min(2),

  categoryId: z.string(),

  brand: z.string().optional(),

  color: z.string(),

  size: z.string(),

  fabric: z.string().optional(),

  purchasePrice: z.number(),

  salePrice: z.number(),

  stockQuantity: z.number().min(0),

  minStockAlert: z.number().optional(),

  description: z.string().optional(),

  supplierBarcode: z.string().optional(),
});

module.exports = {
  createProductSchema,
};