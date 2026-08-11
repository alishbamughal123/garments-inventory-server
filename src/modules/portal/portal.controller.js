const portalService = require("./portal.service");
const { successResponse, errorResponse, handleControllerError } = require("../../utils/responseHandler");

/*
|--------------------------------------------------------------------------
| B2B PORTAL LOGIN
|--------------------------------------------------------------------------
*/
const loginCustomer = async (req, res) => {
  try {
    const { emailOrPhone, email, phone, password } = req.body;
    const loginIdentifier = emailOrPhone || email || phone;
    if (!loginIdentifier || !password) {
      return errorResponse(res, "Email/phone and password are required.", 400);
    }
    const result = await portalService.portalLogin(loginIdentifier, password);
    return successResponse(res, result, "Login successful");
  } catch (error) {
    console.error("Portal Login Error:", error);
    return handleControllerError(res, error);
  }
};

/*
|--------------------------------------------------------------------------
| B2B PORTAL REGISTER (SIGN UP)
|--------------------------------------------------------------------------
*/
const registerCustomer = async (req, res) => {
  try {
    const result = await portalService.registerCustomer(req.body);
    return successResponse(res, result, "Customer registration successful!");
  } catch (error) {
    return handleControllerError(res, error);
  }
};

/*
|--------------------------------------------------------------------------
| B2B PORTAL GOOGLE AUTHENTICATION
|--------------------------------------------------------------------------
*/
const googleAuthCustomer = async (req, res) => {
  try {
    const { email, name, googleId } = req.body;
    const result = await portalService.googleAuthCustomer(email, name, googleId);
    return successResponse(res, result, "Google authentication successful!");
  } catch (error) {
    return handleControllerError(res, error);
  }
};

/*
|--------------------------------------------------------------------------
| GET B2B CATALOG
|--------------------------------------------------------------------------
*/
const getCatalog = async (req, res) => {
  try {
    const customerId = req.user?.id || req.query.customerId;
    const { search, categoryId } = req.query;
    if (!customerId) {
      return errorResponse(res, "Customer identification missing.");
    }
    const catalog = await portalService.getPortalCatalog(customerId, search, categoryId);
    return successResponse(res, catalog, "Catalog fetched successfully");
  } catch (error) {
    return errorResponse(res, error.message);
  }
};

/*
|--------------------------------------------------------------------------
| PLACE B2B ORDER
|--------------------------------------------------------------------------
*/
const placeOrder = async (req, res) => {
  try {
    const customerId = req.user.id;
    const result = await portalService.createPortalOrder(customerId, req.body);
    return successResponse(res, result, "Order placed successfully");
  } catch (error) {
    return errorResponse(res, error.message);
  }
};

/*
|--------------------------------------------------------------------------
| GET CUSTOMER PAST ORDERS
|--------------------------------------------------------------------------
*/
const getMyOrders = async (req, res) => {
  try {
    const customerId = req.user.id;
    const orders = await portalService.getCustomerOrders(customerId);
    return successResponse(res, orders, "Orders fetched successfully");
  } catch (error) {
    return errorResponse(res, error.message);
  }
};

/*
|--------------------------------------------------------------------------
| ADMIN: GET ALL B2B ORDERS
|--------------------------------------------------------------------------
*/
const getAllB2BOrders = async (req, res) => {
  try {
    const { status, customerId } = req.query;
    const orders = await portalService.getAllOrders(status, customerId);
    return successResponse(res, orders, "All B2B orders fetched");
  } catch (error) {
    return errorResponse(res, error.message);
  }
};

/*
|--------------------------------------------------------------------------
| ADMIN: FULFILL ORDER (Direct Stock Out Connection)
|--------------------------------------------------------------------------
*/
const fulfillB2BOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const result = await portalService.fulfillOrder(id, userId);
    return successResponse(res, result, "Order fulfilled and Stock Out completed successfully!");
  } catch (error) {
    return errorResponse(res, error.message);
  }
};

/*
|--------------------------------------------------------------------------
| ADMIN: UPDATE ORDER STATUS
|--------------------------------------------------------------------------
*/
const updateB2BOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.user.id;
    const result = await portalService.updateOrderStatus(id, status, userId);
    return successResponse(res, result, "Order status updated");
  } catch (error) {
    return errorResponse(res, error.message);
  }
};

module.exports = {
  loginCustomer,
  registerCustomer,
  googleAuthCustomer,
  getCatalog,
  placeOrder,
  getMyOrders,
  getAllB2BOrders,
  fulfillB2BOrder,
  updateB2BOrderStatus
};
