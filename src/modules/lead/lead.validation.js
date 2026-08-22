const { z } = require("zod");

const createLeadSchema = z.object({
  fullName: z.string().trim().min(1, "Full name is required"),
  phoneNumber: z.string().trim().default("+47 22 00 00 00"),
  email: z.string().optional().nullable(),
  companyName: z.string().optional().nullable(),
  designation: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  website: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  expectedDealValue: z.union([z.number(), z.string().transform(v => parseFloat(v) || 0)]).default(0),

  rank: z.union([z.number(), z.string().transform(v => parseInt(v, 10))]).optional().nullable(),
  legalEntity: z.string().optional().nullable(),
  segment: z.string().optional().nullable(),
  priority: z.string().optional().nullable(),
  contactType: z.string().optional().nullable(),
  verificationStatus: z.string().optional().nullable(),
  revenueMnok: z.union([z.number(), z.string().transform(v => parseFloat(v))]).optional().nullable(),
  financialYear: z.string().optional().nullable(),
  revenueBasis: z.string().optional().nullable(),
  county: z.string().optional().nullable(),
  relevantStaff: z.string().optional().nullable(),
  relevantTextiles: z.string().optional().nullable(),
  healthcareNvk: z.string().optional().nullable(),

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
  ]).default("TRADE_SHOW"),
  status: z.enum([
    "NEW",
    "CONTACTED",
    "QUALIFIED",
    "PROPOSAL_SENT",
    "NEGOTIATION",
    "WON",
    "LOST",
  ]).default("NEW"),
});

const updateLeadSchema = createLeadSchema.partial();

const createActivitySchema = z.object({
  activityType: z.enum([
    "CALL",
    "MEETING",
    "EMAIL",
    "NOTE",
    "FOLLOW_UP",
  ]),
  subject: z.string(),
  description: z.string().optional(),
  startsAt: z.coerce.date().optional(),
  endsAt: z.coerce.date().optional(),
});

module.exports = {
  createLeadSchema,
  updateLeadSchema,
  createActivitySchema,
};
