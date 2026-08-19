const express = require("express");
const sizechartController = require("./sizechart.controller");

const router = express.Router();

router.get("/", sizechartController.getAllSizeCharts);
router.get("/:styleNumber", sizechartController.getSizeChartByStyle);
router.post("/", sizechartController.saveSizeChart);

module.exports = router;
