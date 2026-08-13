const express = require("express");
const { receiveOrder, generateDespatchAdvice, getHistory } = require("./ehf.controller");
const authMiddleware = require("../../middlewares/auth.middleware");

const router = express.Router();

// EHF Incoming Webhook from Peppol Access Point
router.post("/orders/receive", express.text({ type: "*/*" }), receiveOrder);

// EHF Outbound Despatch Advice (Packing Slip)
router.get("/orders/:orderId/despatch-advice", authMiddleware, generateDespatchAdvice);
router.post("/orders/:orderId/despatch-advice", authMiddleware, generateDespatchAdvice);

// EHF History
router.get("/history", authMiddleware, getHistory);

module.exports = router;
