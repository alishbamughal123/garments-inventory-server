const prisma = require("../../config/db");

const createdBySelect = {
  id: true,
  name: true,
  email: true,
  role: true,
};

const activityInclude = {
  createdBy: {
    select: createdBySelect,
  },
  customer: {
    select: {
      id: true,
      fullName: true,
      companyName: true,
    },
  },
  lead: {
    select: {
      id: true,
      fullName: true,
      companyName: true,
      status: true,
    },
  },
  task: {
    select: {
      id: true,
      title: true,
      status: true,
      dueDate: true,
    },
  },
  emailMessage: {
    select: {
      id: true,
      subject: true,
      direction: true,
      status: true,
      toEmail: true,
      fromEmail: true,
      openedAt: true,
      repliedAt: true,
      createdAt: true,
    },
  },
};

const assertEntityExists = async (
  model,
  id,
  errorMessage
) => {
  if (!id) {
    return null;
  }

  const entity =
    await prisma[model].findUnique({
      where: { id },
    });

  if (!entity) {
    throw new Error(
      errorMessage
    );
  }

  return entity;
};

const validateActivityRelations =
  async (payload) => {
    await Promise.all([
      assertEntityExists(
        "customer",
        payload.customerId,
        "Customer not found"
      ),
      assertEntityExists(
        "lead",
        payload.leadId,
        "Lead not found"
      ),
      assertEntityExists(
        "task",
        payload.taskId,
        "Task not found"
      ),
      assertEntityExists(
        "emailMessage",
        payload.emailMessageId,
        "Email message not found"
      ),
    ]);
  };

const normalizeActivityInput =
  (payload) => ({
    type: payload.type,
    subject: payload.subject,
    description:
      payload.description ||
      null,
    startsAt:
      payload.startsAt
        ? new Date(
            payload.startsAt
          )
        : null,
    endsAt: payload.endsAt
      ? new Date(
          payload.endsAt
        )
      : null,
    customerId:
      payload.customerId ||
      null,
    leadId:
      payload.leadId || null,
    taskId:
      payload.taskId || null,
    emailMessageId:
      payload.emailMessageId ||
      null,
    metadata:
      payload.metadata || null,
  });

const createActivity = async (
  payload,
  createdById
) => {
  await validateActivityRelations(
    payload
  );

  return prisma.activity.create({
    data: {
      ...normalizeActivityInput(
        payload
      ),
      createdById,
    },
    include: activityInclude,
  });
};

const logActivity = async ({
  type,
  subject,
  description,
  startsAt,
  endsAt,
  customerId,
  leadId,
  taskId,
  emailMessageId,
  metadata,
  createdById,
  tx,
}) => {
  const client =
    tx || prisma;

  return client.activity.create({
    data: {
      type,
      subject,
      description:
        description || null,
      startsAt: startsAt
        ? new Date(startsAt)
        : null,
      endsAt: endsAt
        ? new Date(endsAt)
        : null,
      customerId:
        customerId || null,
      leadId:
        leadId || null,
      taskId:
        taskId || null,
      emailMessageId:
        emailMessageId ||
        null,
      metadata:
        metadata || null,
      createdById,
    },
  });
};

const getActivities = async (
  filters = {}
) => {
  const where = {
    ...(filters.customerId
      ? {
          customerId:
            filters.customerId,
        }
      : {}),
    ...(filters.leadId
      ? {
          leadId:
            filters.leadId,
        }
      : {}),
    ...(filters.taskId
      ? {
          taskId:
            filters.taskId,
        }
      : {}),
    ...(filters.type
      ? { type: filters.type }
      : {}),
  };

  return prisma.activity.findMany({
    where,
    include: activityInclude,
    orderBy: {
      createdAt: "desc",
    },
  });
};

module.exports = {
  activityInclude,
  createActivity,
  getActivities,
  logActivity,
};
