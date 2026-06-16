const {
  processReturn,
  getReturns,
  getReturnById,
  deleteReturn,
  updateReturn,
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

/*
|--------------------------------------------------------------------------
| GET RETURN BY ID
|--------------------------------------------------------------------------
*/

const getReturn = async (req, res) => {
  try {
    const result = await getReturnById(req.params.id);
    return successResponse(res, result, "Return fetched successfully");
  } catch (error) {
    return errorResponse(res, error.message);
  }
};

/*
|--------------------------------------------------------------------------
| UPDATE RETURN
|--------------------------------------------------------------------------
*/

const modifyReturn = async (req, res) => {
  try {
    const result = await updateReturn(req.params.id, req.body);
    return successResponse(res, result, "Return updated successfully");
  } catch (error) {
    return errorResponse(res, error.message);
  }
};

/*
|--------------------------------------------------------------------------
| DELETE RETURN
|--------------------------------------------------------------------------
*/

const removeReturn = async (req, res) => {
  try {
    await deleteReturn(req.params.id);
    return successResponse(res, null, "Return deleted successfully");
  } catch (error) {
    return errorResponse(res, error.message);
  }
};

module.exports = {
  createReturn,
  getAllReturns,
  getReturn,
  modifyReturn,
  removeReturn,
};