const { z } = require("zod");

const baseProductSchema =
  z.object({
    productName:
      z.string().min(2).optional(),
    categoryId: z.string(),
    baseStyleNumber:
      z.string().optional(),
    styleNumber:
      z.string().optional(),
    styleName:
      z.string().optional(),
    itemName:
      z.string().optional(),
    brand: z.string().optional(),
    color: z.string(),
    colorCode:
      z.string().optional(),
    size: z.string().optional(),
    fabric:
      z.string().optional(),
    fabricComposition:
      z.string().optional(),
    fabricWeight:
      z.string().optional(),
    purchasePrice:
      z.number(),
    salePrice:
      z.number(),
    stockQuantity:
      z.number().min(0),
    minStockAlert:
      z.number().optional(),
    description:
      z.string().optional(),
    supplierBarcode:
      z.string().optional(),
  })
    .refine(
      (data) =>
        !!(
          data.productName ||
          data.styleName ||
          data.itemName
        ),
      {
        message:
          "Provide a display name, style name, or item name",
        path: ["productName"],
      }
    );

const createProductSchema =
  baseProductSchema;

const updateProductSchema =
  baseProductSchema;

module.exports = {
  createProductSchema,
  updateProductSchema,
};
