const prisma = require("../../config/db");
const {
  logActivity,
} = require("../activity/activity.service");

const buildCustomerFilters = (
  search,
  customerType,
  status
) => {
  const filters = [];

  if (search) {
    filters.push({
      OR: [
        {
          fullName: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          companyName: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          phoneNumber: {
            contains: search,
          },
        },
        {
          email: {
            contains: search,
            mode: "insensitive",
          },
        },
      ],
    });
  }

  if (customerType) {
    filters.push({
      customerType,
    });
  }

  if (status) {
    filters.push({
      status,
    });
  }

  return filters.length > 0
    ? { AND: filters }
    : undefined;
};

/*
|--------------------------------------------------------------------------
| CREATE CUSTOMER
|--------------------------------------------------------------------------
*/

const createCustomer = async (payload) => {
  const existingCustomer =
    await prisma.customer.findFirst({
      where: {
        OR: [
          {
            phoneNumber:
              payload.phoneNumber,
          },
          {
            email:
              payload.email ||
              undefined,
          },
        ],
      },
    });

  if (existingCustomer) {
    throw new Error(
      "Customer already exists"
    );
  }

  return await prisma.customer.create({
    data: payload,
  });
};

/*
|--------------------------------------------------------------------------
| GET CUSTOMERS
|--------------------------------------------------------------------------
*/

const getCustomers = async (
  search = "",
  customerType,
  status
) => {
  const result =
    await prisma.customer.findMany({
      where: buildCustomerFilters(
        search,
        customerType,
        status
      ),
      select: {
        id: true,
        fullName: true,
        companyName: true,
        designation: true,
        phoneNumber: true,
        alternatePhone: true,
        email: true,
        website: true,
        source: true,
        status: true,
        address: true,
        city: true,
        notes: true,
        customerType: true,
        totalOrders: true,
        totalSpent: true,
        createdAt: true,
        updatedAt: true,
      },

      orderBy: {
        createdAt: "desc",
      },
    });

  return result;
};

/*
|--------------------------------------------------------------------------
| GET CUSTOMER BY ID
|--------------------------------------------------------------------------
*/

const getCustomerById =
  async (id) => {
    const customer =
      await prisma.customer.findUnique({
        where: { id },

        include: {
          sales: true,
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
          activities: {
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

          interactions: {
            orderBy: {
              createdAt: "desc",
            },
          },
        },
      });

    if (!customer) {
      throw new Error(
        "Customer not found"
      );
    }

    const activityTimeline = [
      ...customer.interactions.map(
        (interaction) => ({
          id: interaction.id,
          type: interaction.type,
          subject:
            interaction.subject,
          description:
            interaction.description,
          createdAt:
            interaction.createdAt,
          source: "LEGACY_INTERACTION",
        })
      ),
      ...customer.activities.map(
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
      ...customer,
      activityTimeline,
    };
  };

/*
|--------------------------------------------------------------------------
| UPDATE CUSTOMER
|--------------------------------------------------------------------------
*/

const updateCustomer =
  async (id, payload) => {
    const customer =
      await prisma.customer.findUnique({
        where: { id },
      });

    if (!customer) {
      throw new Error(
        "Customer not found"
      );
    }

    return await prisma.customer.update({
      where: { id },

      data: payload,
    });
  };

/*
|--------------------------------------------------------------------------
| DELETE CUSTOMER
|--------------------------------------------------------------------------
*/

const deleteCustomer =
  async (id) => {
    const customer =
      await prisma.customer.findUnique({
        where: { id },
      });

    if (!customer) {
      throw new Error(
        "Customer not found"
      );
    }

    return await prisma.customer.delete({
      where: { id },
    });
  };

/*
|--------------------------------------------------------------------------
| ADD INTERACTION
|--------------------------------------------------------------------------
*/

const addInteraction =
  async (
    customerId,
    payload,
    userId
  ) => {
    return prisma.$transaction(
      async (tx) => {
        const interaction =
          await tx.customerInteraction.create(
            {
              data: {
                customerId,

                type: payload.type,

                subject:
                  payload.subject,

                description:
                  payload.description,
              },
            }
          );

        await logActivity({
          tx,
          type:
            payload.type ===
            "FOLLOW_UP"
              ? "FOLLOW_UP"
              : payload.type,
          subject:
            payload.subject,
          description:
            payload.description,
          customerId,
          startsAt:
            payload.startsAt,
          endsAt: payload.endsAt,
          createdById: userId,
        });

        return interaction;
      }
    );
  };

/*
|--------------------------------------------------------------------------
| GET INTERACTIONS
|--------------------------------------------------------------------------
*/

const getCustomerInteractions =
  async (customerId) => {
    return await prisma.customerInteraction.findMany(
      {
        where: {
          customerId,
        },

        orderBy: {
          createdAt: "desc",
        },
      }
    );
  };

module.exports = {
  createCustomer,
  getCustomers,
  getCustomerById,
  updateCustomer,
  deleteCustomer,
  addInteraction,
  getCustomerInteractions,
};
