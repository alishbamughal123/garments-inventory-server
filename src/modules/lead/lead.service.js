const prisma =
  require("../../config/db");
const {
  logActivity,
} = require("../activity/activity.service");
const {
  getPaginationParams,
  formatPaginationMeta,
} = require("../../utils/pagination.helper");

const createLead =
  async (
    payload,
    createdById
  ) => {
    return await prisma.lead.create({
      data: {
        ...payload,
        createdById,
      },
    });
  };

const getLeads = async (searchOrQuery = "") => {
  const query =
    typeof searchOrQuery === "object" && searchOrQuery !== null
      ? searchOrQuery
      : { search: searchOrQuery };

  const { page, limit, skip, take, isAll } = getPaginationParams(query, 25, 200);
  const search = (query.search || "").trim();

  const where = {};
  const conditions = [];

  if (search) {
    conditions.push({
      OR: [
        { fullName: { contains: search, mode: "insensitive" } },
        { companyName: { contains: search, mode: "insensitive" } },
        { phoneNumber: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { city: { contains: search, mode: "insensitive" } },
        { designation: { contains: search, mode: "insensitive" } },
        { address: { contains: search, mode: "insensitive" } },
        { notes: { contains: search, mode: "insensitive" } },
      ],
    });
  }

  if (query.status) {
    conditions.push({ status: query.status });
  }

  if (query.source) {
    conditions.push({ source: query.source });
  }

  if (query.priority) {
    conditions.push({ priority: query.priority });
  }

  if (query.segment) {
    conditions.push({ segment: { contains: query.segment, mode: "insensitive" } });
  }

  if (conditions.length > 0) {
    where.AND = conditions;
  }

  const orderBy = [
    { rank: "asc" },
    { createdAt: "desc" },
  ];

  if (isAll) {
    const leads = await prisma.lead.findMany({
      where,
      include: {
        assignedTo: true,
      },
      orderBy,
    });

    return {
      leads,
      pagination: formatPaginationMeta(leads.length, 1, leads.length || 1),
    };
  }

  const [total, leads] = await Promise.all([
    prisma.lead.count({ where }),
    prisma.lead.findMany({
      where,
      include: {
        assignedTo: true,
      },
      skip,
      take,
      orderBy,
    }),
  ]);

  return {
    leads,
    pagination: formatPaginationMeta(total, page, limit),
  };
};

const getLeadById =
  async (id) => {
    const lead =
      await prisma.lead.findUnique({
      where: { id },

      include: {
        activities: {
          orderBy: {
            createdAt: "desc",
          },
        },
        assignedTo: true,
        tasks: {
          include: {
            assignedUser: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true,
              },
            },
          },
          orderBy: {
            dueDate: "asc",
          },
        },
        crmActivities: {
          include: {
            createdBy: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true,
              },
            },
            task: {
              select: {
                id: true,
                title: true,
                status: true,
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
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        },
        emailConversations: {
          include: {
            messages: {
              orderBy: {
                createdAt: "desc",
              },
            },
          },
          orderBy: {
            lastMessageAt: "desc",
          },
        },
      },
    });

    if (!lead) {
      return null;
    }

    const activityTimeline = [
      ...lead.activities.map(
        (activity) => ({
          id: activity.id,
          type:
            activity.activityType,
          subject:
            activity.subject,
          description:
            activity.description,
          createdAt:
            activity.createdAt,
          source: "LEGACY_ACTIVITY",
        })
      ),
      ...lead.crmActivities.map(
        (activity) => ({
          ...activity,
          source: "ACTIVITY",
        })
      ),
    ].sort(
      (left, right) =>
        new Date(
          right.createdAt
        ) -
        new Date(
          left.createdAt
        )
    );

    return {
      ...lead,
      activityTimeline,
    };
  };

const updateLead =
  async (
    id,
    payload
  ) => {

    const {
      id: _id,
      createdAt,
      updatedAt,
      activities,
      assignedTo,
      ...updateData
    } = payload;

    return await prisma.lead.update({
      where: { id },

      data: updateData,
    });
  };

const deleteLead =
  async (id) => {
    return await prisma.lead.delete({
      where: { id },
    });
  };
const addLeadActivity =
  async (
    leadId,
    payload,
    userId
  ) => {
    const lead =
      await prisma.lead.findUnique({
        where: { id: leadId },
      });

    if (!lead) {
      throw new Error(
        "Lead not found"
      );
    }

    return prisma.$transaction(
      async (tx) => {
        const legacyActivity =
          await tx.leadActivity.create(
            {
              data: {
                leadId,

                activityType:
                  payload.activityType,

                subject:
                  payload.subject,

                description:
                  payload.description,

                createdById:
                  userId,
              },
            }
          );

        await logActivity({
          tx,
          type:
            payload.activityType ===
            "FOLLOW_UP"
              ? "FOLLOW_UP"
              : payload.activityType,
          subject:
            payload.subject,
          description:
            payload.description,
          leadId,
          startsAt:
            payload.startsAt,
          endsAt:
            payload.endsAt,
          createdById:
            userId,
        });

        return legacyActivity;
      }
    );
  };
  const getLeadActivities =
  async (leadId) => {
    return await prisma.leadActivity.findMany(
      {
        where: {
          leadId,
        },

        orderBy: {
          createdAt: "desc",
        },
      }
    );
  };
  const assignLead =
  async (
    leadId,
    newOwnerId,
    assignedById
  ) => {
    const lead =
      await prisma.lead.findUnique({
        where: { id: leadId },
      });

    if (!lead) {
      throw new Error(
        "Lead not found"
      );
    }

    await prisma.leadAssignmentHistory.create(
      {
        data: {
          leadId,

          previousOwnerId:
            lead.assignedToId,

          newOwnerId,

          assignedById,
        },
      }
    );

    return await prisma.lead.update({
      where: {
        id: leadId,
      },

      data: {
        assignedToId:
          newOwnerId,
      },
    });
  };
  const updateLeadStage =
  async (
    leadId,
    newStage,
    userId
  ) => {
    const lead =
      await prisma.lead.findUnique({
        where: { id: leadId },
      });

    if (!lead) {
      throw new Error(
        "Lead not found"
      );
    }

    await prisma.leadStageHistory.create(
      {
        data: {
          leadId,

          previousStage:
            lead.status,

          newStage,

          changedById:
            userId,
        },
      }
    );

    return await prisma.lead.update({
      where: {
        id: leadId,
      },

      data: {
        status: newStage,
      },
    });
  };
  const convertLeadToCustomer =
  async (
    leadId
  ) => {
    const lead =
      await prisma.lead.findUnique({
        where: { id: leadId },
      });

    if (!lead) {
      throw new Error(
        "Lead not found"
      );
    }

    const existingCustomer =
      await prisma.customer.findFirst(
        {
          where: {
            OR: [
              {
                phoneNumber:
                  lead.phoneNumber,
              },

              {
                email:
                  lead.email ||
                  undefined,
              },
            ],
          },
        }
      );

    if (existingCustomer) {
      throw new Error(
        "Customer already exists"
      );
    }

    const customer =
      await prisma.customer.create({
        data: {
          fullName:
            lead.fullName,

          companyName:
            lead.companyName,

          designation:
            lead.designation,

          phoneNumber:
            lead.phoneNumber,

          alternatePhone:
            lead.alternatePhone,

          email:
            lead.email,

          address:
            lead.address,

          city:
            lead.city,

          website:
            lead.website,

          source:
            lead.source,

          notes:
            lead.notes,
        },
      });

    await prisma.lead.update({
      where: {
        id: leadId,
      },

      data: {
        status: "WON",
      },
    });

    return customer;
  };
module.exports = {
  createLead,
  getLeads,
  getLeadById,
  updateLead,
  deleteLead,addLeadActivity,getLeadActivities ,assignLead,updateLeadStage,convertLeadToCustomer
};
