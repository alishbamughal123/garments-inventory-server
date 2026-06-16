const { z } = require("zod");

const activityTypeEnum = z.enum([
  "CALL",
  "EMAIL",
  "MEETING",
  "NOTE",
  "TASK",
  "FOLLOW_UP",
  "APPOINTMENT",
]);

const optionalNullableString = z
  .string()
  .trim()
  .min(1)
  .optional()
  .nullable();

const createActivitySchema = z.object({
  type: activityTypeEnum,
  subject: z
    .string()
    .trim()
    .min(1, "Subject is required"),
  description: z
    .string()
    .trim()
    .optional()
    .nullable(),
  startsAt: z.coerce
    .date()
    .optional()
    .nullable(),
  endsAt: z.coerce
    .date()
    .optional()
    .nullable(),
  customerId:
    optionalNullableString,
  leadId:
    optionalNullableString,
  taskId:
    optionalNullableString,
  emailMessageId:
    optionalNullableString,
});

const getActivitiesQuerySchema =
  z.object({
    customerId: z
      .string()
      .trim()
      .optional(),
    leadId: z
      .string()
      .trim()
      .optional(),
    taskId: z
      .string()
      .trim()
      .optional(),
    type: activityTypeEnum
      .optional(),
  });

module.exports = {
  activityTypeEnum,
  createActivitySchema,
  getActivitiesQuerySchema,
};
