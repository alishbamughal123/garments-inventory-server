
const {
  successResponse,
  errorResponse,
  handleControllerError,
} = require("../../utils/responseHandler");

const {
  createSaleSchema,
} = require("./sale.validation");

const {
  createSale,
  getSales,
  getSaleById,
  deleteSale,
  updateSale,
} = require("./sale.service");

/*
|--------------------------------------------------------------------------
| CREATE SALE
|--------------------------------------------------------------------------
*/

const createSaleHandler = async (req, res) => {
  try {
    const validatedData = createSaleSchema.parse(req.body);

    const result = await createSale(validatedData, req.user?.id);

    return successResponse(res, result, "Sale created successfully");
  } catch (error) {
    return handleControllerError(res, error);
  }
};

/*
|--------------------------------------------------------------------------
| GET ALL SALES
|--------------------------------------------------------------------------
*/

const getAllSales = async (req, res) => {
  try {
    const result = await getSales();

    return successResponse(res, result, "Sales fetched successfully");
  } catch (error) {
    return handleControllerError(res, error);
  }
};

/*
|--------------------------------------------------------------------------
| GET SINGLE SALE
|--------------------------------------------------------------------------
*/

const getSingleSale = async (req, res) => {
  try {
    const result = await getSaleById(req.params.id);

    return successResponse(res, result, "Sale fetched successfully");
  } catch (error) {
    return handleControllerError(res, error);
  }
};

/*
|--------------------------------------------------------------------------
| DELETE SALE
|--------------------------------------------------------------------------
*/

const removeSale = async (req, res) => {
  try {
    await deleteSale(req.params.id, req.user?.id);
    return successResponse(res, null, "Sale deleted successfully");
  } catch (error) {
    return handleControllerError(res, error);
  }
};

/*
|--------------------------------------------------------------------------
| UPDATE SALE
|--------------------------------------------------------------------------
*/

const updateSaleHandler = async (req, res) => {
  try {
    const result = await updateSale(req.params.id, req.body);
    return successResponse(res, result, "Sale updated successfully");
  } catch (error) {
    return handleControllerError(res, error);
  }
};

module.exports = {
  createSaleHandler,
  getAllSales,
  getSingleSale,
  removeSale,
  updateSaleHandler,
};

