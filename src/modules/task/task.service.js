const prisma = require("../../config/db");
const {
  logActivity,
} = require("../activity/activity.service");
const {
  createScheduledFor,
  resolveReminderTarget,
} = require("./task-reminder.service");
const {
  getPaginationParams,
  formatPaginationMeta,
} = require("../../utils/pagination.helper");

const terminalStatuses = [
  "COMPLETED",
  "CANCELLED",
];

const openStatuses = [
  "PENDING",
  "IN_PROGRESS",
  "OVERDUE",
];

const userSelect = {
  id: true,
  name: true,
  email: true,
  phoneNumber: true,
  role: true,
};

const customerSelect = {
  id: true,
  fullName: true,
  companyName: true,
  phoneNumber: true,
  email: true,
};

const leadSelect = {
  id: true,
  fullName: true,
  companyName: true,
  phoneNumber: true,
  email: true,
  status: true,
};

const taskListInclude = {
  assignedUser: {
    select: userSelect,
  },
  createdBy: {
    select: userSelect,
  },
  customer: {
    select: customerSelect,
  },
  lead: {
    select: leadSelect,
  },
  reminders: {
    include: {
      createdBy: {
        select: userSelect,
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  },
  assignmentHistory: {
    include: {
      assignedBy: {
        select: userSelect,
      },
      previousAssignedUser: {
        select: userSelect,
      },
      newAssignedUser: {
        select: userSelect,
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  },
};

const taskDetailInclude = {
  ...taskListInclude,
  activities: {
    include: {
      createdBy: {
        select: userSelect,
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  },
};

const getStartOfDay = (value) => {
  const date = new Date(value);
  date.setHours(0, 0, 0, 0);
  return date;
};

const getEndOfDay = (value) => {
  const date = new Date(value);
  date.setHours(23, 59, 59, 999);
  return date;
};

const addDays = (value, days) => {
  const date = new Date(value);
  date.setDate(date.getDate() + days);
  return date;
};

const getCalendarRange = (
  view,
  date
) => {
  if (!view || !date) {
    return null;
  }

  const baseDate =
    getStartOfDay(date);

  if (view === "DAILY") {
    return {
      rangeStart:
        getStartOfDay(baseDate),
      rangeEnd:
        getEndOfDay(baseDate),
    };
  }

  if (view === "WEEKLY") {
    const weekStart =
      new Date(baseDate);
    weekStart.setDate(
      baseDate.getDate() -
        baseDate.getDay()
    );

    const weekEnd =
      addDays(weekStart, 6);

    return {
      rangeStart:
        getStartOfDay(weekStart),
      rangeEnd:
        getEndOfDay(weekEnd),
    };
  }

  const monthStart =
    new Date(
      baseDate.getFullYear(),
      baseDate.getMonth(),
      1
    );

  const monthEnd = new Date(
    baseDate.getFullYear(),
    baseDate.getMonth() + 1,
    0
  );

  return {
    rangeStart:
      getStartOfDay(monthStart),
    rangeEnd:
      getEndOfDay(monthEnd),
  };
};

const isPastDue = (
  dueDate
) =>
  new Date(dueDate) <
  new Date();

const resolveTaskStatus = ({
  dueDate,
  status,
  currentStatus = "PENDING",
}) => {
  const baseStatus =
    status || currentStatus;

  if (
    terminalStatuses.includes(
      baseStatus
    )
  ) {
    return baseStatus;
  }

  if (isPastDue(dueDate)) {
    return "OVERDUE";
  }

  if (baseStatus === "OVERDUE") {
    return "PENDING";
  }

  return baseStatus;
};

const getEffectiveTaskStatus = (
  task
) => {
  if (
    !task ||
    terminalStatuses.includes(
      task.status
    )
  ) {
    return task?.status;
  }

  return isPastDue(
    task.dueDate
  )
    ? "OVERDUE"
    : task.status === "OVERDUE"
    ? "PENDING"
    : task.status;
};

const mapTaskForResponse = (
  task
) => ({
  ...task,
  status:
    getEffectiveTaskStatus(
      task
    ),
});

const buildTaskWhereClause = (
  filters
) => {
  const conditions = [];

  if (filters.title) {
    conditions.push({
      title: {
        contains:
          filters.title,
        mode: "insensitive",
      },
    });
  }

  if (filters.customer) {
    conditions.push({
      customer: {
        OR: [
          {
            fullName: {
              contains:
                filters.customer,
              mode:
                "insensitive",
            },
          },
          {
            companyName: {
              contains:
                filters.customer,
              mode:
                "insensitive",
            },
          },
        ],
      },
    });
  }

  if (filters.customerId) {
    conditions.push({
      customerId:
        filters.customerId,
    });
  }

  if (filters.lead) {
    conditions.push({
      lead: {
        OR: [
          {
            fullName: {
              contains:
                filters.lead,
              mode:
                "insensitive",
            },
          },
          {
            companyName: {
              contains:
                filters.lead,
              mode:
                "insensitive",
            },
          },
        ],
      },
    });
  }

  if (filters.leadId) {
    conditions.push({
      leadId:
        filters.leadId,
    });
  }

  if (filters.priority) {
    conditions.push({
      priority:
        filters.priority,
    });
  }

  if (
    filters.assignedUserId
  ) {
    conditions.push({
      assignedUserId:
        filters.assignedUserId,
    });
  }

  const dateRange = {};

  if (filters.dueDate) {
    dateRange.gte =
      getStartOfDay(
        filters.dueDate
      );
    dateRange.lte =
      getEndOfDay(
        filters.dueDate
      );
  }

  if (filters.dueDateFrom) {
    dateRange.gte =
      getStartOfDay(
        filters.dueDateFrom
      );
  }

  if (filters.dueDateTo) {
    dateRange.lte =
      getEndOfDay(
        filters.dueDateTo
      );
  }

  const calendarRange =
    getCalendarRange(
      filters.view,
      filters.date
    );

  if (calendarRange) {
    dateRange.gte =
      calendarRange.rangeStart;
    dateRange.lte =
      calendarRange.rangeEnd;
  }

  if (
    Object.keys(dateRange)
      .length > 0
  ) {
    conditions.push({
      dueDate: dateRange,
    });
  }

  if (filters.status) {
    if (filters.status === "OVERDUE") {
      conditions.push({
        dueDate: {
          lt: new Date(),
        },
        status: {
          in: openStatuses,
        },
      });
    } else if (
      filters.status ===
        "PENDING" ||
      filters.status ===
        "IN_PROGRESS"
    ) {
      conditions.push({
        status:
          filters.status,
        dueDate: {
          gte: new Date(),
        },
      });
    } else {
      conditions.push({
        status:
          filters.status,
      });
    }
  }

  return conditions.length > 0
    ? { AND: conditions }
    : undefined;
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

const validateTaskRelations =
  async (payload) => {
    await assertEntityExists(
      "user",
      payload.assignedUserId,
      "Assigned user not found"
    );

    await assertEntityExists(
      "customer",
      payload.customerId,
      "Customer not found"
    );

    await assertEntityExists(
      "lead",
      payload.leadId,
      "Lead not found"
    );
  };

const buildTaskActivityHistory =
  (task) => {
    const activityHistory = [
      {
        type: "TASK_CREATED",
        message:
          "Task created",
        createdAt:
          task.createdAt,
        actor:
          task.createdBy,
      },
    ];

    for (const entry of task.assignmentHistory) {
      activityHistory.push({
        type: "TASK_ASSIGNED",
        message:
          entry.newAssignedUser
            ? `Task assigned to ${entry.newAssignedUser.name}`
            : "Task unassigned",
        createdAt:
          entry.createdAt,
        actor:
          entry.assignedBy,
        meta: {
          previousAssignedUser:
            entry.previousAssignedUser,
          newAssignedUser:
            entry.newAssignedUser,
          note: entry.note,
        },
      });
    }

    for (const reminder of task.reminders) {
      activityHistory.push({
        type: "REMINDER_CREATED",
        message:
          "Reminder scheduled",
        createdAt:
          reminder.createdAt,
        actor:
          reminder.createdBy,
        meta: {
          reminderDate:
            reminder.reminderDate,
          reminderTime:
            reminder.reminderTime,
          channel:
            reminder.channel,
          recipientType:
            reminder.recipientType,
          deliveryStatus:
            reminder.deliveryStatus,
          note: reminder.note,
        },
      });
    }

    for (const activity of task.activities) {
      activityHistory.push({
        type: activity.type,
        message:
          activity.subject,
        createdAt:
          activity.createdAt,
        actor:
          activity.createdBy,
        meta:
          activity.metadata ||
          null,
      });
    }

    if (task.completedAt) {
      activityHistory.push({
        type: "TASK_COMPLETED",
        message:
          "Task completed",
        createdAt:
          task.completedAt,
        actor:
          task.assignedUser ||
          task.createdBy,
      });
    }

    if (
      task.updatedAt &&
      task.updatedAt.getTime() !==
        task.createdAt.getTime()
    ) {
      activityHistory.push({
        type: "TASK_UPDATED",
        message:
          "Task updated",
        createdAt:
          task.updatedAt,
        actor:
          task.assignedUser ||
          task.createdBy,
      });
    }

    return activityHistory.sort(
      (left, right) =>
        new Date(
          right.createdAt
        ) -
        new Date(
          left.createdAt
        )
    );
  };

const buildTaskSummary =
  async () => {
    const todayStart =
      getStartOfDay(
        new Date()
      );
    const todayEnd =
      getEndOfDay(new Date());

    const [
      totalTasks,
      pendingTasks,
      completedTasks,
      overdueTasks,
      tasksDueToday,
      highPriorityTasks,
    ] = await Promise.all([
      prisma.task.count(),
      prisma.task.count({
        where: {
          status: "PENDING",
          dueDate: {
            gte: new Date(),
          },
        },
      }),
      prisma.task.count({
        where: {
          status: "COMPLETED",
        },
      }),
      prisma.task.count({
        where: {
          dueDate: {
            lt: new Date(),
          },
          status: {
            in: openStatuses,
          },
        },
      }),
      prisma.task.count({
        where: {
          dueDate: {
            gte: todayStart,
            lte: todayEnd,
          },
          status: {
            in: openStatuses,
          },
        },
      }),
      prisma.task.count({
        where: {
          priority: {
            in: [
              "HIGH",
              "URGENT",
            ],
          },
          status: {
            notIn:
              terminalStatuses,
          },
        },
      }),
    ]);

    return {
      totalTasks,
      pendingTasks,
      completedTasks,
      overdueTasks,
      tasksDueToday,
      highPriorityTasks,
    };
  };

const createTask = async (
  payload,
  createdById
) => {
  await validateTaskRelations(
    payload
  );

  const dueDate = new Date(
    payload.dueDate
  );
  const status =
    resolveTaskStatus({
      dueDate,
      status: payload.status,
    });

  return prisma.$transaction(
    async (tx) => {
      const task =
        await tx.task.create({
          data: {
            title:
              payload.title,
            description:
              payload.description ||
              null,
            priority:
              payload.priority,
            status,
            dueDate,
            completedAt:
              status ===
              "COMPLETED"
                ? new Date()
                : null,
            assignedUserId:
              payload.assignedUserId ||
              null,
            customerId:
              payload.customerId ||
              null,
            leadId:
              payload.leadId || null,
            createdById,
          },
        });

      if (
        payload.assignedUserId
      ) {
        await tx.taskAssignmentHistory.create(
          {
            data: {
              taskId: task.id,
              previousAssignedUserId:
                null,
              newAssignedUserId:
                payload.assignedUserId,
              assignedById:
                createdById,
              note: "Initial assignment",
            },
          }
        );
      }

      await logActivity({
        tx,
        type: "TASK",
        subject:
          payload.title,
        description:
          payload.description,
        customerId:
          payload.customerId,
        leadId: payload.leadId,
        taskId: task.id,
        createdById,
        metadata: {
          action: "TASK_CREATED",
          status,
          priority:
            payload.priority,
        },
      });

      return tx.task.findUnique({
        where: {
          id: task.id,
        },
        include: taskDetailInclude,
      });
    }
  );
};

const getTasks = async (filters = {}) => {
  const where = buildTaskWhereClause(filters);
  const isCalendarView = Boolean(filters.view);
  const { page, limit, skip, take, isAll } = getPaginationParams(filters, 25, 200);

  const shouldFetchAll = isCalendarView || isAll;

  let tasks;
  let total;

  if (shouldFetchAll) {
    tasks = await prisma.task.findMany({
      where,
      include: taskListInclude,
      orderBy: [
        {
          dueDate: "asc",
        },
        {
          createdAt: "desc",
        },
      ],
    });
    total = tasks.length;
  } else {
    [total, tasks] = await Promise.all([
      prisma.task.count({ where }),
      prisma.task.findMany({
        where,
        include: taskListInclude,
        skip,
        take,
        orderBy: [
          {
            dueDate: "asc",
          },
          {
            createdAt: "desc",
          },
        ],
      }),
    ]);
  }

  const normalizedTasks = tasks.map(mapTaskForResponse);

  const summary =
    filters.includeSummary === false ? null : await buildTaskSummary();

  const pagination = shouldFetchAll
    ? formatPaginationMeta(total, 1, total || 1)
    : formatPaginationMeta(total, page, limit);

  return {
    items: normalizedTasks,
    summary,
    pagination,
    filters: {
      ...filters,
      calendarRange: getCalendarRange(filters.view, filters.date),
    },
  };
};

const getTaskById = async (
  id
) => {
  const task =
    await prisma.task.findUnique({
      where: { id },
      include: taskDetailInclude,
    });

  if (!task) {
    throw new Error(
      "Task not found"
    );
  }

  return {
    ...mapTaskForResponse(
      task
    ),
    activityHistory:
      buildTaskActivityHistory(
        task
      ),
    reminderHistory:
      task.reminders,
  };
};

const updateTask = async (
  id,
  payload,
  updatedById
) => {
  const existingTask =
    await prisma.task.findUnique({
      where: { id },
    });

  if (!existingTask) {
    throw new Error(
      "Task not found"
    );
  }

  await validateTaskRelations(
    payload
  );

  const dueDate =
    payload.dueDate
      ? new Date(
          payload.dueDate
        )
      : existingTask.dueDate;

  const status =
    resolveTaskStatus({
      dueDate,
      status: payload.status,
      currentStatus:
        existingTask.status,
    });

  return prisma.$transaction(
    async (tx) => {
      await tx.task.update({
          where: { id },
          data: {
            title:
              payload.title ??
              undefined,
            description:
              payload.description !==
              undefined
                ? payload.description ||
                  null
                : undefined,
            priority:
              payload.priority ??
              undefined,
            status,
            dueDate,
            completedAt:
              status ===
              "COMPLETED"
                ? existingTask.completedAt ||
                  new Date()
                : null,
            assignedUserId:
              payload.assignedUserId !==
              undefined
                ? payload.assignedUserId ||
                  null
                : undefined,
            customerId:
              payload.customerId !==
              undefined
                ? payload.customerId ||
                  null
                : undefined,
            leadId:
              payload.leadId !==
              undefined
                ? payload.leadId ||
                  null
                : undefined,
          },
        });

      if (
        payload.assignedUserId !==
          undefined &&
        payload.assignedUserId !==
          existingTask.assignedUserId
      ) {
        await tx.taskAssignmentHistory.create(
          {
            data: {
              taskId: id,
              previousAssignedUserId:
                existingTask.assignedUserId,
              newAssignedUserId:
                payload.assignedUserId ||
                null,
              assignedById:
                updatedById,
              note: "Assignment updated from task edit",
            },
          }
        );
      }

      await logActivity({
        tx,
        type: "TASK",
        subject:
          payload.title ||
          existingTask.title,
        description:
          payload.description ??
          existingTask.description,
        customerId:
          payload.customerId ??
          existingTask.customerId,
        leadId:
          payload.leadId ??
          existingTask.leadId,
        taskId: id,
        createdById:
          updatedById,
        metadata: {
          action: "TASK_UPDATED",
          status,
          priority:
            payload.priority ||
            existingTask.priority,
        },
      });

      return tx.task.findUnique({
        where: { id },
        include: taskDetailInclude,
      });
    }
  );
};

const deleteTask = async (
  id
) => {
  const task =
    await prisma.task.findUnique({
      where: { id },
    });

  if (!task) {
    throw new Error(
      "Task not found"
    );
  }

  return prisma.task.delete({
    where: { id },
  });
};

const assignTask = async (
  taskId,
  assignedUserId,
  assignedById,
  note
) => {
  const task =
    await prisma.task.findUnique({
      where: { id: taskId },
    });

  if (!task) {
    throw new Error(
      "Task not found"
    );
  }

  await assertEntityExists(
    "user",
    assignedUserId,
    "Assigned user not found"
  );

  return prisma.$transaction(
    async (tx) => {
      await tx.taskAssignmentHistory.create(
        {
          data: {
            taskId,
            previousAssignedUserId:
              task.assignedUserId,
            newAssignedUserId:
              assignedUserId ||
              null,
            assignedById,
            note:
              note ||
              (assignedUserId
                ? "Task assigned"
                : "Task unassigned"),
          },
        }
      );

      await logActivity({
        tx,
        type: "TASK",
        subject: task.title,
        description:
          note ||
          "Task assignment updated",
        customerId:
          task.customerId,
        leadId: task.leadId,
        taskId,
        createdById:
          assignedById,
        metadata: {
          action:
            assignedUserId
              ? "TASK_ASSIGNED"
              : "TASK_UNASSIGNED",
          previousAssignedUserId:
            task.assignedUserId,
          newAssignedUserId:
            assignedUserId,
        },
      });

      const nextStatus =
        resolveTaskStatus({
          dueDate:
            task.dueDate,
          currentStatus:
            task.status,
        });

      return tx.task.update({
        where: { id: taskId },
        data: {
          assignedUserId:
            assignedUserId ||
            null,
          status: nextStatus,
        },
        include: taskDetailInclude,
      });
    }
  );
};

const addReminder = async (
  taskId,
  payload,
  createdById
) => {
  const task =
    await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        assignedUser: {
          select: userSelect,
        },
        customer: {
          select: customerSelect,
        },
        lead: {
          select: leadSelect,
        },
      },
    });

  if (!task) {
    throw new Error(
      "Task not found"
    );
  }

  return prisma.$transaction(
    async (tx) => {
      const reminderTarget =
        resolveReminderTarget(
          task,
          payload
        );
      const scheduledFor =
        createScheduledFor(
          payload.reminderDate,
          payload.reminderTime
        );
      const reminder =
        await tx.reminder.create({
          data: {
            taskId,
            reminderDate:
              new Date(
                payload.reminderDate
              ),
            reminderTime:
              payload.reminderTime,
            scheduledFor,
            note:
              payload.note || null,
            channel:
              payload.channel,
            recipientType:
              payload.recipientType,
            recipientEmail:
              reminderTarget.email,
            recipientPhone:
              reminderTarget.phone,
            createdById,
          },
          include: {
            createdBy: {
              select: userSelect,
            },
            task: {
              select: {
                id: true,
                title: true,
                dueDate: true,
                status: true,
              },
            },
          },
        });

      await logActivity({
        tx,
        type: "FOLLOW_UP",
        subject:
          `Reminder scheduled for ${task.title}`,
        description:
          payload.note ||
          null,
        customerId:
          task.customerId,
        leadId:
          task.leadId,
        taskId,
        createdById,
        metadata: {
          action:
            "REMINDER_CREATED",
          reminderDate:
            payload.reminderDate,
          reminderTime:
            payload.reminderTime,
          scheduledFor,
          channel:
            payload.channel,
          recipientType:
            payload.recipientType,
          recipientEmail:
            reminderTarget.email,
          recipientPhone:
            reminderTarget.phone,
        },
      });

      return reminder;
    }
  );
};

module.exports = {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
  assignTask,
  addReminder,
};
