const { z } = require("zod");

const isoDateString = z
  .string()
  .trim()
  .datetime({ offset: true })
  .or(z.string().trim().date());

const reportsQuerySchema = z
  .object({
    from: isoDateString.optional(),
    to: isoDateString.optional(),
    customerType: z
      .enum(["REGULAR", "WHOLESALE", "VIP"])
      .optional(),
    leadSource: z
      .enum([
        "WEBSITE",
        "FACEBOOK",
        "INSTAGRAM",
        "WHATSAPP",
        "REFERRAL",
        "WALK_IN",
        "TRADE_SHOW",
        "EXISTING_CUSTOMER",
        "OTHER",
      ])
      .optional(),
    leadStatus: z
      .enum([
        "NEW",
        "CONTACTED",
        "QUALIFIED",
        "PROPOSAL_SENT",
        "NEGOTIATION",
        "WON",
        "LOST",
      ])
      .optional(),
    limit: z.coerce
      .number()
      .int()
      .min(1)
      .max(20)
      .default(5)
      .optional(),
  })
  .superRefine((value, ctx) => {
    if (!value.from || !value.to) {
      return;
    }

    const from = new Date(value.from);
    const to = new Date(value.to);

    if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) {
      return;
    }

    if (from > to) {
      ctx.addIssue({
        code: "custom",
        message: "`from` date must be earlier than or equal to `to` date",
        path: ["from"],
      });
    }
  });

module.exports = {
  reportsQuerySchema,
};
