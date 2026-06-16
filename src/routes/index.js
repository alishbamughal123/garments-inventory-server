const express = require("express");
const authRoutes = require("../modules/auth/auth.routes");
const categoryRoutes = require("../modules/categories/categories.routes");
const productRoutes = require("../modules/products/products.routes");
const inventoryRoutes = require("../modules/inventory/inventory.routes");
const returnRoutes = require("../modules/returns/returns.routes");
const dashboardRoutes = require("../modules/dashboard/dashboard.routes");
const customerRoutes = require("../modules/customer/customer.routes");
const leadRoutes = require("../modules/lead/lead.routes");
const saleRoutes = require("../modules/sale/sale.routes");
const reportRoutes = require("../modules/reports/reports.routes");
const taskRoutes = require("../modules/task/task.routes");
const activityRoutes = require("../modules/activity/activity.routes");
const emailRoutes = require("../modules/email/email.routes");

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/categories", categoryRoutes);
router.use("/products", productRoutes);
router.use("/inventory", inventoryRoutes);
router.use("/returns", returnRoutes);
router.use("/dashboard", dashboardRoutes);
router.use("/customers", customerRoutes);
router.use("/leads", leadRoutes);
router.use("/sales", saleRoutes);
router.use("/reports", reportRoutes);
router.use("/tasks", taskRoutes);
router.use("/activities", activityRoutes);
router.use("/emails", emailRoutes);

module.exports = router;
