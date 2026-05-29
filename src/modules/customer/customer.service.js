const prisma = require("../../config/db");

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

  console.log(
    "FIRST CUSTOMER =>",
    result[0]
  );

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

    return customer;
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
    payload
  ) => {
    return await prisma.customerInteraction.create(
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
