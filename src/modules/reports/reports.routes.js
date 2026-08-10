const express = require("express");
const router = express.Router();
const authMiddleware = require("../../middlewares/auth.middleware");

const {
  getCrmOverviewHandler,
  getInventoryReportHandler,
  getStockInReportHandler,
  getStockOutReportHandler,
  getCustomerOrdersReportHandler,
  getProductMovementReportHandler,
  getLowStockReportHandler,
  getCustomerPurchaseReportHandler,
  getOpenOrdersReportHandler
} = require("./reports.controller");

router.get("/overview", authMiddleware, getCrmOverviewHandler);
router.get("/inventory", authMiddleware, getInventoryReportHandler);
router.get("/stock-in", authMiddleware, getStockInReportHandler);
router.get("/stock-out", authMiddleware, getStockOutReportHandler);
router.get("/customer-orders", authMiddleware, getCustomerOrdersReportHandler);
router.get("/product-movement", authMiddleware, getProductMovementReportHandler);
router.get("/low-stock", authMiddleware, getLowStockReportHandler);
router.get("/customer-purchases", authMiddleware, getCustomerPurchaseReportHandler);
router.get("/open-orders", authMiddleware, getOpenOrdersReportHandler);

module.exports = router;
