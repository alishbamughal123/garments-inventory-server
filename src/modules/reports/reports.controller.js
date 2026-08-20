const { successResponse, handleControllerError } = require("../../utils/responseHandler");
const reportsService = require("./reports.service");

const getCrmOverviewHandler = async (req, res) => {
  try {
    const result = await reportsService.getCrmOverview(req.query);
    return successResponse(res, result, "CRM overview fetched successfully");
  } catch (error) {
    return handleControllerError(res, error);
  }
};

const getInventoryReportHandler = async (req, res) => {
  try {
    const report = await reportsService.getInventoryReport(req.query);
    return successResponse(res, report, "Inventory report generated successfully");
  } catch (error) {
    return handleControllerError(res, error);
  }
};

const getStockInReportHandler = async (req, res) => {
  try {
    const report = await reportsService.getStockInReport(req.query);
    return successResponse(res, report, "Stock In report generated successfully");
  } catch (error) {
    return handleControllerError(res, error);
  }
};

const getStockOutReportHandler = async (req, res) => {
  try {
    const report = await reportsService.getStockOutReport(req.query);
    return successResponse(res, report, "Stock Out report generated successfully");
  } catch (error) {
    return handleControllerError(res, error);
  }
};

const getCustomerOrdersReportHandler = async (req, res) => {
  try {
    const report = await reportsService.getCustomerOrdersReport(req.query);
    return successResponse(res, report, "Customer Orders report generated successfully");
  } catch (error) {
    return handleControllerError(res, error);
  }
};

const getProductMovementReportHandler = async (req, res) => {
  try {
    const report = await reportsService.getProductMovementReport(req.query);
    return successResponse(res, report, "Product Movement report generated successfully");
  } catch (error) {
    return handleControllerError(res, error);
  }
};

const getLowStockReportHandler = async (req, res) => {
  try {
    const report = await reportsService.getLowStockReport(req.query);
    return successResponse(res, report, "Low Stock report generated successfully");
  } catch (error) {
    return handleControllerError(res, error);
  }
};

const getCustomerPurchaseReportHandler = async (req, res) => {
  try {
    const report = await reportsService.getCustomerPurchaseReport(req.query);
    return successResponse(res, report, "Customer Purchase report generated successfully");
  } catch (error) {
    return handleControllerError(res, error);
  }
};

const getOpenOrdersReportHandler = async (req, res) => {
  try {
    const report = await reportsService.getOpenOrdersReport(req.query);
    return successResponse(res, report, "Open Orders report generated successfully");
  } catch (error) {
    return handleControllerError(res, error);
  }
};

module.exports = {
  getCrmOverviewHandler,
  getInventoryReportHandler,
  getStockInReportHandler,
  getStockOutReportHandler,
  getCustomerOrdersReportHandler,
  getProductMovementReportHandler,
  getLowStockReportHandler,
  getCustomerPurchaseReportHandler,
  getOpenOrdersReportHandler
};
