
const {
  successResponse,
  errorResponse,
} = require("../../utils/responseHandler");

const {
  createCustomerSchema,
  updateCustomerSchema,
} = require("./customer.validation");

const {
  createCustomer,
  getCustomers,
  getCustomerById,
  updateCustomer,
  deleteCustomer,
  addInteraction,
  getCustomerInteractions,
} = require("./customer.service");

/*
|--------------------------------------------------------------------------
| CREATE CUSTOMER
|--------------------------------------------------------------------------
*/

const createCustomerHandler =
  async (req, res) => {
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
| GET CUSTOMERS
|--------------------------------------------------------------------------
*/

const getCustomersHandler =
  async (req, res) => {
    try {
      const {
        search,
        customerType,
        status,
      } = req.query;

      const result =
        await getCustomers(
          search,
          customerType,
          status
        );

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
| GET CUSTOMER BY ID
|--------------------------------------------------------------------------
*/

const getCustomerByIdHandler =
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

const updateCustomerHandler =
  async (req, res) => {
    try {
      const validatedData =
        updateCustomerSchema.parse(
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

const deleteCustomerHandler =
  async (req, res) => {
    try {
      const result =
        await deleteCustomer(
          req.params.id
        );

      return successResponse(
        res,
        result,
        "Customer deleted successfully"
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
| ADD INTERACTION
|--------------------------------------------------------------------------
*/

const addInteractionHandler =
  async (req, res) => {
    try {
      const result =
        await addInteraction(
          req.params.id,
          req.body
        );

      return successResponse(
        res,
        result,
        "Interaction added successfully"
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
| GET INTERACTIONS
|--------------------------------------------------------------------------
*/

const getInteractionsHandler =
  async (req, res) => {
    try {
      const result =
        await getCustomerInteractions(
          req.params.id
        );

      return successResponse(
        res,
        result,
        "Interactions fetched successfully"
      );
    } catch (error) {
      return errorResponse(
        res,
        error.message
      );
    }
  };

module.exports = {
  createCustomerHandler,
  getCustomersHandler,
  getCustomerByIdHandler,
  updateCustomerHandler,
  deleteCustomerHandler,
  addInteractionHandler,
  getInteractionsHandler,
};
