const express = require("express");

const authRoutes = require("../modules/auth/auth.routes");

const categoryRoutes = require("../modules/categories/categories.routes");

const productRoutes = require("../modules/products/products.routes");

const inventoryRoutes = require("../modules/inventory/inventory.routes");

const returnRoutes = require("../modules/returns/returns.routes");
const dashboardRoutes = require("../modules/dashboard/dashboard.routes");
const router = express.Router();

/*
|--------------------------------------------------------------------------
| AUTH ROUTES
|--------------------------------------------------------------------------
*/

router.use("/auth", authRoutes);

/*
|--------------------------------------------------------------------------
| CATEGORY ROUTES
|--------------------------------------------------------------------------
*/

router.use("/categories", categoryRoutes);

/*
|--------------------------------------------------------------------------
| PRODUCT ROUTES
|--------------------------------------------------------------------------
*/

router.use("/products", productRoutes);

/*
|--------------------------------------------------------------------------
| INVENTORY ROUTES
|--------------------------------------------------------------------------
*/

router.use("/inventory", inventoryRoutes);

/*
|--------------------------------------------------------------------------
| RETURN ROUTES
|--------------------------------------------------------------------------
*/

router.use("/returns", returnRoutes);

/*
|--------------------------------------------------------------------------
| DASHBOARD ROUTES
|--------------------------------------------------------------------------
*/

router.use("/dashboard", dashboardRoutes);

module.exports = router;