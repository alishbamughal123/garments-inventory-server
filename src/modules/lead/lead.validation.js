const { z } = require("zod");

const createLeadSchema =
  z.object({
    fullName: z.string(),

    phoneNumber: z.string(),

    email: z.string().optional(),

    companyName:
      z.string().optional(),

    designation:
      z.string().optional(),

    address:
      z.string().optional(),

    city:
      z.string().optional(),

    website:
      z.string().optional(),

    notes:
      z.string().optional(),

    expectedDealValue:
      z.number().default(0),

    source: z.enum([
      "WEBSITE",
      "FACEBOOK",
      "INSTAGRAM",
      "WHATSAPP",
      "REFERRAL",
      "WALK_IN",
      "TRADE_SHOW",
      "EXISTING_CUSTOMER",
      "OTHER",
    ]),
  });
  const createActivitySchema =
  z.object({
    activityType: z.enum([
      "CALL",
      "MEETING",
      "EMAIL",
      "NOTE",
      "FOLLOW_UP",
    ]),

    subject: z.string(),

    description:
      z.string().optional(),
  });

module.exports = {
  createLeadSchema,createActivitySchema
};