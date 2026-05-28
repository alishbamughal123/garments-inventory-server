const { z } = require("zod");



const stockInSchema = z.object({
  barcode: z.string(),

  quantity: z.number().min(1),

  notes: z.string().optional(),
});



const stockOutSchema = z.object({
  barcode: z.string(),

  quantity: z.number().min(1),

  notes: z.string().optional(),
});

module.exports = {
  stockInSchema,
  stockOutSchema,
};