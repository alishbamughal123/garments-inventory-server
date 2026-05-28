const {
  processReturn,
  getReturns,
} = require("./returns.service");

const {
  successResponse,
  errorResponse,
} = require("../../utils/responseHandler");

const {
  returnSchema,
} = require("./returns.validation");

/*
|--------------------------------------------------------------------------
| PROCESS RETURN
|--------------------------------------------------------------------------
*/

const createReturn =
  async (req, res) => {
    try {
      const validatedData =
        returnSchema.parse(
          req.body
        );

      const result =
        await processReturn(
          validatedData,
          req.user.id
        );

      return successResponse(
        res,
        result,
        "Return processed successfully"
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
| GET RETURNS
|--------------------------------------------------------------------------
*/

const getAllReturns =
  async (req, res) => {
    try {
      const result =
        await getReturns();

      return successResponse(
        res,
        result,
        "Returns fetched successfully"
      );
    } catch (error) {
      return errorResponse(
        res,
        error.message
      );
    }
  };

module.exports = {
  createReturn,
  getAllReturns,
};