const prisma = require("../../config/db");
const env = require("../../config/env");
const {
  logActivity,
} = require("../activity/activity.service");
const {
  sendEmail,
} = require("../email/email.service");

const reminderTaskInclude = {
  assignedUser: {
    select: {
      id: true,
      name: true,
      email: true,
      phoneNumber: true,
      role: true,
    },
  },
  customer: {
    select: {
      id: true,
      fullName: true,
      companyName: true,
      email: true,
      phoneNumber: true,
    },
  },
  lead: {
    select: {
      id: true,
      fullName: true,
      companyName: true,
      email: true,
      phoneNumber: true,
      status: true,
    },
  },
};

let workerInterval = null;
let workerRunning = false;

const formatDateTime = (value) =>
  new Date(value).toLocaleString(
    "en-US",
    {
      dateStyle: "medium",
      timeStyle: "short",
    }
  );

const createScheduledFor = (
  reminderDate,
  reminderTime
) => {
  const date = new Date(
    reminderDate
  );
  const [hours, minutes] =
    reminderTime
      .split(":")
      .map(Number);

  date.setHours(
    hours,
    minutes,
    0,
    0
  );

  return date;
};

const getTaskContactLabel = (
  task
) =>
  task.customer?.fullName ||
  task.lead?.fullName ||
  task.assignedUser?.name ||
  "team member";

const normalizeOptionalString = (
  value
) =>
  typeof value === "string" &&
  value.trim()
    ? value.trim()
    : null;

const ensureChannelHasRecipient = (
  channel,
  target
) => {
  if (
    channel === "EMAIL" &&
    !target.email
  ) {
    throw new Error(
      "Selected reminder recipient does not have an email address"
    );
  }

  if (
    channel === "SMS" &&
    !target.phone
  ) {
    throw new Error(
      "Selected reminder recipient does not have a phone number"
    );
  }

  if (
    channel ===
      "EMAIL_AND_SMS" &&
    (!target.email ||
      !target.phone)
  ) {
    throw new Error(
      "Selected reminder recipient must have both email address and phone number"
    );
  }
};

const resolveReminderTarget = (
  task,
  payload
) => {
  const customEmail =
    normalizeOptionalString(
      payload.recipientEmail
    );
  const customPhone =
    normalizeOptionalString(
      payload.recipientPhone
    );

  const targetMap = {
    ASSIGNED_USER: {
      label:
        task.assignedUser?.name ||
        "Assigned user",
      email:
        task.assignedUser?.email ||
        null,
      phone:
        task.assignedUser
          ?.phoneNumber || null,
    },
    CUSTOMER: {
      label:
        task.customer?.fullName ||
        "Customer",
      email:
        task.customer?.email ||
        null,
      phone:
        task.customer
          ?.phoneNumber || null,
    },
    LEAD: {
      label:
        task.lead?.fullName ||
        "Lead",
      email:
        task.lead?.email ||
        null,
      phone:
        task.lead
          ?.phoneNumber || null,
    },
    CUSTOM: {
      label:
        customEmail ||
        customPhone ||
        "Custom recipient",
      email: customEmail,
      phone: customPhone,
    },
  };

  const target =
    targetMap[
      payload.recipientType
    ];

  if (!target) {
    throw new Error(
      "Invalid reminder recipient type"
    );
  }

  ensureChannelHasRecipient(
    payload.channel,
    target
  );

  return target;
};

const buildReminderEmailPayload = (
  reminder
) => {
  const task = reminder.task;
  const contactLabel =
    getTaskContactLabel(task);
  const reminderLabel =
    formatDateTime(
      reminder.scheduledFor
    );
  const note =
    reminder.note?.trim() ||
    "No additional note was provided.";
  const taskDescription =
    task.description?.trim() ||
    "No task description provided.";

  const bodyText = [
    `Reminder for task: ${task.title}`,
    `Due date: ${formatDateTime(task.dueDate)}`,
    `Scheduled reminder: ${reminderLabel}`,
    `Assigned user: ${task.assignedUser?.name || "Unassigned"}`,
    `Related contact: ${contactLabel}`,
    "",
    "Task description:",
    taskDescription,
    "",
    "Reminder note:",
    note,
  ].join("\n");

  const bodyHtml = `
    <div style="font-family:Arial,sans-serif;line-height:1.6;color:#0f172a;">
      <h2 style="margin:0 0 12px;">Task Reminder</h2>
      <p><strong>Task:</strong> ${task.title}</p>
      <p><strong>Due date:</strong> ${formatDateTime(task.dueDate)}</p>
      <p><strong>Scheduled reminder:</strong> ${reminderLabel}</p>
      <p><strong>Assigned user:</strong> ${task.assignedUser?.name || "Unassigned"}</p>
      <p><strong>Related contact:</strong> ${contactLabel}</p>
      <p><strong>Task description:</strong><br />${taskDescription}</p>
      <p><strong>Reminder note:</strong><br />${note}</p>
    </div>
  `;

  return {
    customerId:
      task.customerId || null,
    leadId:
      task.leadId || null,
    toEmail:
      reminder.recipientEmail,
    subject: `Reminder: ${task.title}`,
    bodyText,
    bodyHtml,
  };
};

const getTwilioClient = () => {
  if (
    !env.twilioAccountSid ||
    !env.twilioAuthToken ||
    !env.twilioPhoneNumber
  ) {
    throw new Error(
      "Twilio SMS configuration is missing"
    );
  }

  // Lazy import keeps the server bootable until SMS is configured.
  const twilio =
    require("twilio");

  return twilio(
    env.twilioAccountSid,
    env.twilioAuthToken
  );
};

const sendSmsReminder = async (
  reminder
) => {
  const task = reminder.task;
  const client =
    getTwilioClient();
  const message = [
    `Task reminder: ${task.title}`,
    `Due: ${formatDateTime(task.dueDate)}`,
    reminder.note
      ? `Note: ${reminder.note}`
      : null,
  ]
    .filter(Boolean)
    .join(" | ");

  const result =
    await client.messages.create(
      {
        from: env.twilioPhoneNumber,
        to: reminder.recipientPhone,
        body: message,
      }
    );

  await logActivity({
    type: "FOLLOW_UP",
    subject: `SMS reminder sent for ${task.title}`,
    description: message,
    customerId:
      task.customerId,
    leadId: task.leadId,
    taskId: task.id,
    createdById:
      reminder.createdById,
    metadata: {
      action:
        "REMINDER_SMS_SENT",
      reminderId:
        reminder.id,
      recipientPhone:
        reminder.recipientPhone,
      providerMessageId:
        result.sid || null,
    },
  });

  return result.sid || null;
};

const markReminderResult = async ({
  reminderId,
  status,
  failureReason = null,
}) =>
  prisma.reminder.update({
    where: {
      id: reminderId,
    },
    data: {
      deliveryStatus: status,
      sentAt:
        status === "SENT" ||
        status === "PARTIAL"
          ? new Date()
          : null,
      failureReason,
      lastAttemptAt:
        new Date(),
    },
  });

const deliverReminder = async (
  reminder
) => {
  const failures = [];

  if (
    reminder.channel ===
      "EMAIL" ||
    reminder.channel ===
      "EMAIL_AND_SMS"
  ) {
    try {
      await sendEmail(
        buildReminderEmailPayload(
          reminder
        ),
        reminder.createdById
      );

      await logActivity({
        type: "FOLLOW_UP",
        subject: `Email reminder sent for ${reminder.task.title}`,
        description:
          reminder.note || null,
        customerId:
          reminder.task.customerId,
        leadId:
          reminder.task.leadId,
        taskId:
          reminder.task.id,
        createdById:
          reminder.createdById,
        metadata: {
          action:
            "REMINDER_EMAIL_SENT",
          reminderId:
            reminder.id,
          recipientEmail:
            reminder.recipientEmail,
        },
      });
    } catch (error) {
      failures.push(
        `Email: ${error.message}`
      );
    }
  }

  if (
    reminder.channel ===
      "SMS" ||
    reminder.channel ===
      "EMAIL_AND_SMS"
  ) {
    try {
      await sendSmsReminder(
        reminder
      );
    } catch (error) {
      failures.push(
        `SMS: ${error.message}`
      );
    }
  }

  if (failures.length === 0) {
    await markReminderResult({
      reminderId: reminder.id,
      status: "SENT",
    });
    return;
  }

  const partialAllowed =
    reminder.channel ===
    "EMAIL_AND_SMS";

  await markReminderResult({
    reminderId: reminder.id,
    status:
      partialAllowed &&
      failures.length === 1
        ? "PARTIAL"
        : "FAILED",
    failureReason:
      failures.join(" | "),
  });

  await logActivity({
    type: "FOLLOW_UP",
    subject: `Reminder delivery issue for ${reminder.task.title}`,
    description:
      failures.join(" | "),
    customerId:
      reminder.task.customerId,
    leadId:
      reminder.task.leadId,
    taskId:
      reminder.task.id,
    createdById:
      reminder.createdById,
    metadata: {
      action:
        "REMINDER_DELIVERY_FAILED",
      reminderId:
        reminder.id,
      channel:
        reminder.channel,
    },
  });
};

const fetchReminderForDelivery =
  (id) =>
    prisma.reminder.findUnique({
      where: { id },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
            phoneNumber: true,
          },
        },
        task: {
          include:
            reminderTaskInclude,
        },
      },
    });

const processReminderById = async (
  reminderId
) => {
  const claim =
    await prisma.reminder.updateMany(
      {
        where: {
          id: reminderId,
          deliveryStatus:
            "PENDING",
        },
        data: {
          deliveryStatus:
            "PROCESSING",
          lastAttemptAt:
            new Date(),
        },
      }
    );

  if (claim.count === 0) {
    return;
  }

  const reminder =
    await fetchReminderForDelivery(
      reminderId
    );

  if (!reminder) {
    return;
  }

  await deliverReminder(
    reminder
  );
};

const processDueReminders =
  async () => {
    if (workerRunning) {
      return;
    }

    workerRunning = true;

    try {
      const dueReminders =
        await prisma.reminder.findMany({
          where: {
            deliveryStatus:
              "PENDING",
            scheduledFor: {
              lte: new Date(),
            },
          },
          select: {
            id: true,
          },
          orderBy: {
            scheduledFor:
              "asc",
          },
          take: 25,
        });

      for (const reminder of dueReminders) {
        await processReminderById(
          reminder.id
        );
      }
    } catch (error) {
      console.error(
        "Reminder worker failed:",
        error.message
      );
    } finally {
      workerRunning = false;
    }
  };

const startReminderWorker =
  () => {
    if (
      !env.reminderWorkerEnabled ||
      workerInterval
    ) {
      return;
    }

    workerInterval =
      setInterval(
        processDueReminders,
        env.reminderWorkerIntervalMs
      );

    if (
      typeof workerInterval.unref ===
      "function"
    ) {
      workerInterval.unref();
    }

    processDueReminders();
  };

module.exports = {
  createScheduledFor,
  resolveReminderTarget,
  processDueReminders,
  startReminderWorker,
};
