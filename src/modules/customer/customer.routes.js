const express = require("express");
const router = express.Router();
const authMiddleware = require("../../middlewares/auth.middleware");

const {
  createCustomerHandler,
  getCustomersHandler,
  getCustomerByIdHandler,
  updateCustomerHandler,
  deleteCustomerHandler,
  addContactHandler,
  deleteContactHandler,
  setCustomPricingHandler,
  setProductAccessHandler,
  setPortalAccessHandler,
  exportGDPRHandler,
  anonymizeGDPRHandler,
  addInteractionHandler,
  getInteractionsHandler,
} = require("./customer.controller");

/*
|--------------------------------------------------------------------------
| CUSTOMER MANAGEMENT ROUTES
|--------------------------------------------------------------------------
*/
router.post("/", authMiddleware, createCustomerHandler);
router.get("/", authMiddleware, getCustomersHandler);
router.get("/:id", authMiddleware, getCustomerByIdHandler);
router.patch("/:id", authMiddleware, updateCustomerHandler);
router.delete("/:id", authMiddleware, deleteCustomerHandler);

// Contacts
router.post("/:id/contacts", authMiddleware, addContactHandler);
router.delete("/:id/contacts/:contactId", authMiddleware, deleteContactHandler);

// Custom Pricing & Product Access
router.post("/:id/pricing", authMiddleware, setCustomPricingHandler);
router.post("/:id/product-access", authMiddleware, setProductAccessHandler);
router.post("/:id/portal-access", authMiddleware, setPortalAccessHandler);

// GDPR Compliance
router.get("/:id/gdpr-export", authMiddleware, exportGDPRHandler);
router.post("/:id/gdpr-anonymize", authMiddleware, anonymizeGDPRHandler);

// Interactions
router.post("/:id/interactions", authMiddleware, addInteractionHandler);
router.get("/:id/interactions", authMiddleware, getInteractionsHandler);

module.exports = router;
