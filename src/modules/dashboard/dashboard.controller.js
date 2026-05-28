const {
  getDashboardData,
} = require("./dashboard.service");

const {
  successResponse,
  errorResponse,
} = require("../../utils/responseHandler");

const getDashboard =
  async (req, res) => {
    try {
      const result =
        await getDashboardData();

      return successResponse(
        res,
        result,
        "Dashboard fetched successfully"
      );
    } catch (error) {
      return errorResponse(
        res,
        error.message
      );
    }
  };

module.exports = {
  getDashboard,
};