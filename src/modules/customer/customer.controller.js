
const {
  successResponse,
  errorResponse,
} = require("../../utils/responseHandler");

const {
  createCustomerSchema,
} = require("./customer.validation");

const {
  createCustomer,
  getCustomers,
  getCustomerById,
  updateCustomer,
  deleteCustomer,
} = require("./customer.service");

/*
|--------------------------------------------------------------------------
| CREATE CUSTOMER
|--------------------------------------------------------------------------
*/

const addCustomer = async (
  req,
  res
) => {
  try {
    const validatedData =
      createCustomerSchema.parse(
        req.body
      );

    const result =
      await createCustomer(
        validatedData
      );

    return successResponse(
      res,
      result,
      "Customer created successfully"
    );
  } catch (error) {
    return errorResponse(
      res,
      error.message
    );
  }
};

/*
|--------------------------------------------------------------------------
| GET ALL CUSTOMERS
|--------------------------------------------------------------------------
*/

const getAllCustomers =
  async (req, res) => {
    try {
      const search =
        req.query.search || "";

      const result =
        await getCustomers(search);

      return successResponse(
        res,
        result,
        "Customers fetched successfully"
      );
    } catch (error) {
      return errorResponse(
        res,
        error.message
      );
    }
  };

/*
|--------------------------------------------------------------------------
| GET SINGLE CUSTOMER
|--------------------------------------------------------------------------
*/

const getSingleCustomer =
  async (req, res) => {
    try {
      const result =
        await getCustomerById(
          req.params.id
        );

      return successResponse(
        res,
        result,
        "Customer fetched successfully"
      );
    } catch (error) {
      return errorResponse(
        res,
        error.message
      );
    }
  };

/*
|--------------------------------------------------------------------------
| UPDATE CUSTOMER
|--------------------------------------------------------------------------
*/

const editCustomer = async (
  req,
  res
) => {
  try {
    const validatedData =
      createCustomerSchema.parse(
        req.body
      );

    const result =
      await updateCustomer(
        req.params.id,
        validatedData
      );

    return successResponse(
      res,
      result,
      "Customer updated successfully"
    );
  } catch (error) {
    return errorResponse(
      res,
      error.message
    );
  }
};

/*
|--------------------------------------------------------------------------
| DELETE CUSTOMER
|--------------------------------------------------------------------------
*/

const removeCustomer =
  async (req, res) => {
    try {
      await deleteCustomer(
        req.params.id
      );

      return successResponse(
        res,
        null,
        "Customer deleted successfully"
      );
    } catch (error) {
      return errorResponse(
        res,
        error.message
      );
    }
  };

module.exports = {
  addCustomer,
  getAllCustomers,
  getSingleCustomer,
  editCustomer,
  removeCustomer,
};
