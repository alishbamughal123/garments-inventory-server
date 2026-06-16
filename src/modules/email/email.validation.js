const { z } = require("zod");

const optionalNullableString = z
  .string()
  .trim()
  .min(1)
  .optional()
  .nullable();

const sendEmailSchema = z.object({
  conversationId:
    optionalNullableString,
  customerId:
    optionalNullableString,
  leadId:
    optionalNullableString,
  toEmail: z
    .string()
    .email("Valid recipient email is required"),
  cc: z
    .string()
    .trim()
    .optional()
    .nullable(),
  bcc: z
    .string()
    .trim()
    .optional()
    .nullable(),
  subject: z
    .string()
    .trim()
    .min(1, "Subject is required"),
  bodyText: z
    .string()
    .trim()
    .min(1, "Email content is required"),
  bodyHtml: z
    .string()
    .trim()
    .optional()
    .nullable(),
});

const inboundEmailSchema = z.object({
  conversationId:
    optionalNullableString,
  threadKey:
    optionalNullableString,
  customerId:
    optionalNullableString,
  leadId:
    optionalNullableString,
  fromName:
    optionalNullableString,
  fromEmail: z
    .string()
    .email("Valid sender email is required"),
  toEmail: z
    .string()
    .email("Valid recipient email is required"),
  subject: z
    .string()
    .trim()
    .min(1, "Subject is required"),
  bodyText: z
    .string()
    .trim()
    .min(1, "Email content is required"),
  bodyHtml: z
    .string()
    .trim()
    .optional()
    .nullable(),
  providerMessageId:
    optionalNullableString,
});

const getEmailsQuerySchema =
  z.object({
    customerId: z
      .string()
      .trim()
      .optional(),
    leadId: z
      .string()
      .trim()
      .optional(),
    conversationId: z
      .string()
      .trim()
      .optional(),
  });

module.exports = {
  sendEmailSchema,
  inboundEmailSchema,
  getEmailsQuerySchema,
};
