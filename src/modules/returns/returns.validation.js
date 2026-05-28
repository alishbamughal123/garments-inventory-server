const { z } = require("zod");

/*
|--------------------------------------------------------------------------
| RETURN VALIDATION
|--------------------------------------------------------------------------
*/

const returnSchema = z.object({
  barcode: z.string(),

  quantity: z.number().min(1),

  returnReason: z.string().optional(),

  conditionStatus: z.enum([
    "USABLE",
    "DAMAGED",
  ]),
});

module.exports = {
  returnSchema,
};