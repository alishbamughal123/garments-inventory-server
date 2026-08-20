const {
  successResponse,
  handleControllerError,
} = require("../../utils/responseHandler");

const {
  createCustomerSchema,
  updateCustomerSchema,
  customerInteractionSchema,
} = require("./customer.validation");

const customerService = require("./customer.service");

/*
|--------------------------------------------------------------------------
| CREATE CUSTOMER
|--------------------------------------------------------------------------
*/
const createCustomerHandler = async (req, res) => {
  try {
    const validatedData = createCustomerSchema.parse(req.body);
    const result = await customerService.createCustomer({
      ...validatedData,
      contacts: req.body.contacts,
      password: req.body.password,
      vatNumber: req.body.vatNumber
    });

    return successResponse(res, result, "Customer created successfully");
  } catch (error) {
    return handleControllerError(res, error);
  }
};

/*
|--------------------------------------------------------------------------
| GET CUSTOMERS
|--------------------------------------------------------------------------
*/
const getCustomersHandler = async (req, res) => {
  try {
    const result = await customerService.getCustomers(req.query);
    return successResponse(
      res,
      result.customers || result,
      "Customers fetched successfully",
      result.pagination
    );
  } catch (error) {
    return handleControllerError(res, error);
  }
};

/*
|--------------------------------------------------------------------------
| GET CUSTOMER BY ID
|--------------------------------------------------------------------------
*/
const getCustomerByIdHandler = async (req, res) => {
  try {
    const result = await customerService.getCustomerById(req.params.id);
    return successResponse(res, result, "Customer fetched successfully");
  } catch (error) {
    return handleControllerError(res, error);
  }
};

/*
|--------------------------------------------------------------------------
| UPDATE CUSTOMER
|--------------------------------------------------------------------------
*/
const updateCustomerHandler = async (req, res) => {
  try {
    const validatedData = updateCustomerSchema.parse(req.body);
    const result = await customerService.updateCustomer(req.params.id, {
      ...validatedData,
      password: req.body.password,
      vatNumber: req.body.vatNumber
    });

    return successResponse(res, result, "Customer updated successfully");
  } catch (error) {
    return handleControllerError(res, error);
  }
};

/*
|--------------------------------------------------------------------------
| DELETE CUSTOMER
|--------------------------------------------------------------------------
*/
const deleteCustomerHandler = async (req, res) => {
  try {
    const result = await customerService.deleteCustomer(req.params.id);
    return successResponse(res, result, "Customer deleted successfully");
  } catch (error) {
    return handleControllerError(res, error);
  }
};

/*
|--------------------------------------------------------------------------
| CONTACT HANDLERS
|--------------------------------------------------------------------------
*/
const addContactHandler = async (req, res) => {
  try {
    const result = await customerService.addContact(req.params.id, req.body);
    return successResponse(res, result, "Contact added successfully");
  } catch (error) {
    return handleControllerError(res, error);
  }
};

const deleteContactHandler = async (req, res) => {
  try {
    const result = await customerService.deleteContact(req.params.contactId);
    return successResponse(res, result, "Contact deleted successfully");
  } catch (error) {
    return handleControllerError(res, error);
  }
};

/*
|--------------------------------------------------------------------------
| CUSTOM PRICING HANDLER
|--------------------------------------------------------------------------
*/
const setCustomPricingHandler = async (req, res) => {
  try {
    const { prices } = req.body;
    const result = await customerService.setCustomPricing(req.params.id, prices);
    return successResponse(res, result, "Custom pricing saved successfully");
  } catch (error) {
    return handleControllerError(res, error);
  }
};

/*
|--------------------------------------------------------------------------
| CATALOG ACCESS HANDLER
|--------------------------------------------------------------------------
*/
const setProductAccessHandler = async (req, res) => {
  try {
    const { accessList } = req.body;
    const result = await customerService.setProductAccess(req.params.id, accessList);
    return successResponse(res, result, "Product access restrictions updated");
  } catch (error) {
    return handleControllerError(res, error);
  }
};

/*
|--------------------------------------------------------------------------
| B2B PORTAL PASSWORD HANDLER
|--------------------------------------------------------------------------
*/
const setPortalAccessHandler = async (req, res) => {
  try {
    const { password, isPortalActive } = req.body;
    const result = await customerService.setPortalAccess(req.params.id, password, isPortalActive);
    return successResponse(res, result, "Customer portal credentials updated");
  } catch (error) {
    return handleControllerError(res, error);
  }
};

/*
|--------------------------------------------------------------------------
| GDPR HANDLERS
|--------------------------------------------------------------------------
*/
const exportGDPRHandler = async (req, res) => {
  try {
    const data = await customerService.exportGDPRData(req.params.id);
    return successResponse(res, data, "GDPR Customer data exported");
  } catch (error) {
    return handleControllerError(res, error);
  }
};

const anonymizeGDPRHandler = async (req, res) => {
  try {
    const result = await customerService.anonymizeGDPRData(req.params.id);
    return successResponse(res, result, "Customer data anonymized per GDPR");
  } catch (error) {
    return handleControllerError(res, error);
  }
};

/*
|--------------------------------------------------------------------------
| INTERACTIONS HANDLERS
|--------------------------------------------------------------------------
*/
const addInteractionHandler = async (req, res) => {
  try {
    const result = await customerService.addInteraction(
      req.params.id,
      customerInteractionSchema.parse(req.body),
      req.user.id
    );
    return successResponse(res, result, "Interaction added successfully");
  } catch (error) {
    return handleControllerError(res, error);
  }
};

const getInteractionsHandler = async (req, res) => {
  try {
    const result = await customerService.getCustomerInteractions(req.params.id);
    return successResponse(res, result, "Interactions fetched successfully");
  } catch (error) {
    return handleControllerError(res, error);
  }
};

module.exports = {
  createCustomerHandler,
  getCustomersHandler,
  getCustomerByIdHandler,
  updateCustomerHandler,
  deleteCustomerHandler,
  addContactHandler,
  deleteContactHandler,
  setCustomPricingHandler,
  setProductAccessHandler,
  setPortalAccessHandler,
  exportGDPRHandler,
  anonymizeGDPRHandler,
  addInteractionHandler,
  getInteractionsHandler,
};
