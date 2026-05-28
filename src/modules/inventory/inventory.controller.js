const {
  stockIn,
  stockOut,
  getTransactions,
} = require("./inventory.service");

const {
  successResponse,
  errorResponse,
} = require("../../utils/responseHandler");

const {
  stockInSchema,
  stockOutSchema,
} = require("./inventory.validation");

/*
|--------------------------------------------------------------------------
| STOCK IN
|--------------------------------------------------------------------------
*/

const addStock = async (
  req,
  res
) => {
  try {
    const validatedData =
      stockInSchema.parse(req.body);

    const result =
      await stockIn(
        validatedData,
        req.user.id
      );

    return successResponse(
      res,
      result,
      "Stock added successfully"
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
| STOCK OUT
|--------------------------------------------------------------------------
*/

const removeStock = async (
  req,
  res
) => {
  try {
    const validatedData =
      stockOutSchema.parse(req.body);

    const result =
      await stockOut(
        validatedData,
        req.user.id
      );

    return successResponse(
      res,
      result,
      "Stock deducted successfully"
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
| GET TRANSACTIONS
|--------------------------------------------------------------------------
*/

const getAllTransactions =
  async (req, res) => {
    try {
      const result =
        await getTransactions();

      return successResponse(
        res,
        result,
        "Transactions fetched successfully"
      );
    } catch (error) {
      return errorResponse(
        res,
        error.message
      );
    }
  };

module.exports = {
  addStock,
  removeStock,
  getAllTransactions,
};