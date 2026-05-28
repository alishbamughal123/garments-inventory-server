

const prisma =
  require("../../config/db");

/*
|--------------------------------------------------------------------------
| CREATE CUSTOMER
|--------------------------------------------------------------------------
*/

const createCustomer =
  async (payload) => {
    const existingCustomer =
      await prisma.customer.findUnique(
        {
          where: {
            phoneNumber:
              payload.phoneNumber,
          },
        }
      );

    if (existingCustomer) {
      throw new Error(
        "Customer already exists"
      );
    }

    return prisma.customer.create({
      data: payload,
    });
  };

/*
|--------------------------------------------------------------------------
| GET ALL CUSTOMERS
|--------------------------------------------------------------------------
*/

const getCustomers =
  async (search = "") => {
    return prisma.customer.findMany(
      {
        where: {
          OR: [
            {
              fullName: {
                contains:
                  search,

                mode:
                  "insensitive",
              },
            },

            {
              phoneNumber: {
                contains:
                  search,
              },
            },
          ],
        },

        orderBy: {
          createdAt:
            "desc",
        },
      }
    );
  };

/*
|--------------------------------------------------------------------------
| GET SINGLE CUSTOMER
|--------------------------------------------------------------------------
*/

const getCustomerById =
  async (id) => {
    const customer =
      await prisma.customer.findUnique(
        {
          where: {
            id,
          },
        }
      );

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
  async (
    id,
    payload
  ) => {
    return prisma.customer.update(
      {
        where: {
          id,
        },

        data: payload,
      }
    );
  };

/*
|--------------------------------------------------------------------------
| DELETE CUSTOMER
|--------------------------------------------------------------------------
*/

const deleteCustomer =
  async (id) => {
    return prisma.customer.delete({
      where: {
        id,
      },
    });
  };

module.exports = {
  createCustomer,
  getCustomers,
  getCustomerById,
  updateCustomer,
  deleteCustomer,
};
