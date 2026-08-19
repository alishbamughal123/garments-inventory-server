const sizechartService = require("./sizechart.service");
const { successResponse, handleControllerError } = require("../../utils/responseHandler");

const getAllSizeCharts = async (req, res) => {
  try {
    const charts = await sizechartService.getSizeCharts();
    return successResponse(res, charts, "Size charts retrieved successfully");
  } catch (error) {
    return handleControllerError(res, error);
  }
};

const getSizeChartByStyle = async (req, res) => {
  try {
    const { styleNumber } = req.params;
    const chart = await sizechartService.getSizeChartByStyleNumber(styleNumber);
    if (!chart) {
      return successResponse(res, null, "No size chart found for this style");
    }
    return successResponse(res, chart, "Size chart retrieved successfully");
  } catch (error) {
    return handleControllerError(res, error);
  }
};

const saveSizeChart = async (req, res) => {
  try {
    const result = await sizechartService.upsertSizeChart(req.body);
    return successResponse(res, result, "Size chart saved successfully");
  } catch (error) {
    return handleControllerError(res, error);
  }
};

module.exports = {
  getAllSizeCharts,
  getSizeChartByStyle,
  saveSizeChart,
};
