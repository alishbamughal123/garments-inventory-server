const express = require("express");
const portalController = require("./portal.controller");
const authMiddleware = require("../../middlewares/auth.middleware");

const router = express.Router();

// Public customer auth & registration
router.post("/login", portalController.loginCustomer);
router.post("/register", portalController.registerCustomer);
router.post("/google-auth", portalController.googleAuthCustomer);

// B2B Customer authenticated routes
router.get("/catalog", authMiddleware, portalController.getCatalog);
router.post("/orders/place", authMiddleware, portalController.placeOrder);
router.get("/orders/my", authMiddleware, portalController.getMyOrders);

// Internal CRM Admin/Staff order management routes
router.get("/admin/orders", authMiddleware, portalController.getAllB2BOrders);
router.post("/admin/orders/:id/fulfill", authMiddleware, portalController.fulfillB2BOrder);
router.patch("/admin/orders/:id/status", authMiddleware, portalController.updateB2BOrderStatus);

module.exports = router;
