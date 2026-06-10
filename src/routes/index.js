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

module.exports = router;
