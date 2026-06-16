const {
  successResponse,
  handleControllerError,
} = require("../../utils/responseHandler");
const {
  reportsQuerySchema,
} = require("./reports.validation");
const {
  getCrmOverview,
  getLeadAnalytics,
  getCustomerAnalytics,
  getRevenueAnalytics,
  getSalesAnalytics,
} = require("./reports.service");

const parseQuery = (query) =>
  reportsQuerySchema.parse(query);

const getCrmOverviewHandler =
  async (req, res) => {
    try {
      const validatedQuery =
        parseQuery(req.query);
      const result =
        await getCrmOverview(
          validatedQuery
        );

      return successResponse(
        res,
        result,
        "CRM overview fetched successfully"
      );
    } catch (error) {
      return handleControllerError(
        res,
        error
      );
    }
  };

const getLeadAnalyticsHandler =
  async (req, res) => {
    try {
      const validatedQuery =
        parseQuery(req.query);
      const result =
        await getLeadAnalytics(
          validatedQuery
        );

      return successResponse(
        res,
        result,
        "Lead analytics fetched successfully"
      );
    } catch (error) {
      return handleControllerError(
        res,
        error
      );
    }
  };

const getCustomerAnalyticsHandler =
  async (req, res) => {
    try {
      const validatedQuery =
        parseQuery(req.query);
      const result =
        await getCustomerAnalytics(
          validatedQuery
        );

      return successResponse(
        res,
        result,
        "Customer analytics fetched successfully"
      );
    } catch (error) {
      return handleControllerError(
        res,
        error
      );
    }
  };

const getRevenueAnalyticsHandler =
  async (req, res) => {
    try {
      const validatedQuery =
        parseQuery(req.query);
      const result =
        await getRevenueAnalytics(
          validatedQuery
        );

      return successResponse(
        res,
        result,
        "Revenue analytics fetched successfully"
      );
    } catch (error) {
      return handleControllerError(
        res,
        error
      );
    }
  };

const getSalesAnalyticsHandler =
  async (req, res) => {
    try {
      const validatedQuery =
        parseQuery(req.query);
      const result =
        await getSalesAnalytics(
          validatedQuery
        );

      return successResponse(
        res,
        result,
        "Sales analytics fetched successfully"
      );
    } catch (error) {
      return handleControllerError(
        res,
        error
      );
    }
  };

module.exports = {
  getCrmOverviewHandler,
  getLeadAnalyticsHandler,
  getCustomerAnalyticsHandler,
  getRevenueAnalyticsHandler,
  getSalesAnalyticsHandler,
};
