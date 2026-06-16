const { z } = require("zod");

const taskStatusEnum = z.enum([
  "PENDING",
  "IN_PROGRESS",
  "COMPLETED",
  "CANCELLED",
  "OVERDUE",
]);

const taskPriorityEnum = z.enum([
  "LOW",
  "MEDIUM",
  "HIGH",
  "URGENT",
]);

const calendarViewEnum = z.enum([
  "DAILY",
  "WEEKLY",
  "MONTHLY",
]);

const reminderChannelEnum = z.enum([
  "EMAIL",
  "SMS",
  "EMAIL_AND_SMS",
]);

const reminderRecipientTypeEnum =
  z.enum([
    "ASSIGNED_USER",
    "CUSTOMER",
    "LEAD",
    "CUSTOM",
  ]);

const optionalNullableString = z
  .string()
  .trim()
  .min(1)
  .optional()
  .nullable();

const createTaskSchema = z.object({
  title: z.string().trim().min(1, "Task title is required"),
  description: z.string().trim().optional().nullable(),
  priority: taskPriorityEnum.default("MEDIUM"),
  status: taskStatusEnum.default("PENDING"),
  dueDate: z.coerce.date(),
  assignedUserId: optionalNullableString,
  customerId: optionalNullableString,
  leadId: optionalNullableString,
});

const updateTaskSchema = createTaskSchema
  .partial()
  .refine(
    (payload) => Object.keys(payload).length > 0,
    "At least one field is required for update"
  );

const assignTaskSchema = z.object({
  assignedUserId: optionalNullableString,
  note: z.string().trim().optional().nullable(),
});

const createReminderSchema = z.object({
  reminderDate: z.coerce.date(),
  reminderTime: z
    .string()
    .trim()
    .regex(
      /^([01]\d|2[0-3]):([0-5]\d)$/,
      "Reminder time must be in HH:mm format"
    ),
  channel:
    reminderChannelEnum.default(
      "EMAIL"
    ),
  recipientType:
    reminderRecipientTypeEnum.default(
      "ASSIGNED_USER"
    ),
  recipientEmail: z
    .string()
    .trim()
    .email(
      "Recipient email must be valid"
    )
    .optional()
    .nullable(),
  recipientPhone: z
    .string()
    .trim()
    .min(
      7,
      "Recipient phone must be valid"
    )
    .optional()
    .nullable(),
  note: z.string().trim().optional().nullable(),
}).superRefine(
  (payload, context) => {
    if (
      payload.recipientType !==
      "CUSTOM"
    ) {
      return;
    }

    if (
      payload.channel ===
        "EMAIL" &&
      !payload.recipientEmail
    ) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["recipientEmail"],
        message:
          "Custom email recipient is required for email reminders",
      });
    }

    if (
      payload.channel ===
        "SMS" &&
      !payload.recipientPhone
    ) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["recipientPhone"],
        message:
          "Custom phone recipient is required for SMS reminders",
      });
    }

    if (
      payload.channel ===
        "EMAIL_AND_SMS"
    ) {
      if (!payload.recipientEmail) {
        context.addIssue({
          code:
            z.ZodIssueCode.custom,
          path: [
            "recipientEmail",
          ],
          message:
            "Custom email recipient is required for combined reminders",
        });
      }

      if (!payload.recipientPhone) {
        context.addIssue({
          code:
            z.ZodIssueCode.custom,
          path: [
            "recipientPhone",
          ],
          message:
            "Custom phone recipient is required for combined reminders",
        });
      }
    }
  }
);

const getTasksQuerySchema = z.object({
  title: z.string().trim().optional(),
  customer: z.string().trim().optional(),
  customerId: z.string().trim().optional(),
  lead: z.string().trim().optional(),
  leadId: z.string().trim().optional(),
  status: taskStatusEnum.optional(),
  priority: taskPriorityEnum.optional(),
  assignedUserId: z.string().trim().optional(),
  dueDate: z.coerce.date().optional(),
  dueDateFrom: z.coerce.date().optional(),
  dueDateTo: z.coerce.date().optional(),
  view: calendarViewEnum.optional(),
  date: z.coerce.date().optional(),
  includeSummary: z
    .enum(["true", "false"])
    .optional()
    .transform((value) => value !== "false"),
});

module.exports = {
  createTaskSchema,
  updateTaskSchema,
  assignTaskSchema,
  createReminderSchema,
  getTasksQuerySchema,
  taskStatusEnum,
  taskPriorityEnum,
  reminderChannelEnum,
  reminderRecipientTypeEnum,
};
