const express = require("express");
const router = express.Router();
const authMiddleware = require("../../middlewares/auth.middleware");

const {
  addStock,
  removeStock,
  getAllTransactions,
  fetchDeliveryNotes,
  fetchDeliveryNoteDetails
} = require("./inventory.controller");

router.post("/stock-in", authMiddleware, addStock);
router.post("/stock-out", authMiddleware, removeStock);
router.get("/transactions", authMiddleware, getAllTransactions);

// Delivery Notes routes for CRM
router.get("/delivery-notes", authMiddleware, fetchDeliveryNotes);
router.get("/delivery-notes/:id", authMiddleware, fetchDeliveryNoteDetails);

module.exports = router;