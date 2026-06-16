
const {
  successResponse,
  errorResponse,
} = require("../../utils/responseHandler");

const {
  createSaleSchema,
} = require("./sale.validation");

const {
  createSale,
  getSales,
  getSaleById,
  deleteSale,
} = require("./sale.service");

/*
|--------------------------------------------------------------------------
| CREATE SALE
|--------------------------------------------------------------------------
*/

const createSaleHandler =
  async (req, res) => {
     console.log(req.user);
    try {
      const validatedData =
        createSaleSchema.parse(
          req.body
        );

      const result =
        await createSale(
          validatedData,
           req.user.id
        );

      return successResponse(
        res,
        result,
        "Sale created successfully"
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
| GET ALL SALES
|--------------------------------------------------------------------------
*/

const getAllSales =
  async (req, res) => {
    try {
      const result =
        await getSales();

      return successResponse(
        res,
        result,
        "Sales fetched successfully"
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
| GET SINGLE SALE
|--------------------------------------------------------------------------
*/

const getSingleSale =
  async (req, res) => {
    try {
      const result =
        await getSaleById(
          req.params.id
        );

      return successResponse(
        res,
        result,
        "Sale fetched successfully"
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
| DELETE SALE
|--------------------------------------------------------------------------
*/

const removeSale = async (req, res) => {
  try {
    await deleteSale(req.params.id);
    return successResponse(res, null, "Sale deleted successfully");
  } catch (error) {
    return errorResponse(res, error.message);
  }
};

const updateSaleHandler = async (req, res) => {
  try {
    const result = await updateSale(req.params.id, req.body);
    return successResponse(res, result, "Sale updated successfully");
  } catch (error) {
    return errorResponse(res, error.message);
  }
};

module.exports = {
  createSaleHandler,
  getAllSales,
  getSingleSale,
  removeSale,
  updateSaleHandler,
};
