const { z } = require("zod");

const createCategorySchema = z.object({
  name: z.string().min(2),

  description: z.string().optional(),
});

module.exports = {
  createCategorySchema,
};