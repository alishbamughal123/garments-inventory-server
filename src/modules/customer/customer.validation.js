
const { z } = require("zod");

/*
|--------------------------------------------------------------------------
| CREATE CUSTOMER
|--------------------------------------------------------------------------
*/

const createCustomerSchema = z.object({
  fullName: z.string().min(2),

  companyName: z.string().optional(),

  designation: z.string().optional(),

  phoneNumber: z.string().min(5),

  alternatePhone: z.string().optional(),

  email: z.string().email().optional(),

  address: z.string().optional(),

  city: z.string().optional(),

  website: z.string().optional(),

  source: z.string().optional(),

  notes: z.string().optional(),

  customerType: z
    .enum([
      "REGULAR",
      "WHOLESALE",
      "VIP",
    ])
    .optional(),

  status: z
    .enum([
      "ACTIVE",
      "INACTIVE",
    ])
    .optional(),
});

/*
|--------------------------------------------------------------------------
| UPDATE CUSTOMER
|--------------------------------------------------------------------------
*/

const updateCustomerSchema =
  createCustomerSchema.partial();

const customerInteractionSchema =
  z.object({
    type: z.enum([
      "CALL",
      "MEETING",
      "NOTE",
      "FOLLOW_UP",
    ]),
    subject: z
      .string()
      .min(1),
    description:
      z.string().optional(),
    startsAt: z.coerce
      .date()
      .optional(),
    endsAt: z.coerce
      .date()
      .optional(),
  });

module.exports = {
  createCustomerSchema,
  updateCustomerSchema,
  customerInteractionSchema,
};
