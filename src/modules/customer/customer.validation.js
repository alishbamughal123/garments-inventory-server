
const { z } = require("zod");

const createCustomerSchema =
  z.object({
    fullName: z
      .string()
      .min(2),

    phoneNumber:
      z.string().min(5),

    email: z
      .string()
      .email()
      .optional()
      .or(z.literal("")),

    address:
      z.string().optional(),

    city:
      z.string().optional(),

    notes:
      z.string().optional(),

    customerType:
      z.enum([
        "REGULAR",
        "WHOLESALE",
        "VIP",
      ]),
  });

module.exports = {
  createCustomerSchema,
};
