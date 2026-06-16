const express = require("express");
const authMiddleware = require("../../middlewares/auth.middleware");
const {
  getCrmOverviewHandler,
  getLeadAnalyticsHandler,
  getCustomerAnalyticsHandler,
  getRevenueAnalyticsHandler,
  getSalesAnalyticsHandler,
} = require("./reports.controller");

const router = express.Router();

router.get(
  "/crm-overview",
  authMiddleware,
  getCrmOverviewHandler
);

router.get(
  "/lead-analytics",
  authMiddleware,
  getLeadAnalyticsHandler
);

router.get(
  "/customer-analytics",
  authMiddleware,
  getCustomerAnalyticsHandler
);

router.get(
  "/revenue-analytics",
  authMiddleware,
  getRevenueAnalyticsHandler
);

router.get(
  "/sales-analytics",
  authMiddleware,
  getSalesAnalyticsHandler
);

module.exports = router;
