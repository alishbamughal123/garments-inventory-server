const express = require("express");
const { initiatePunchOut, getCatalog, returnCart } = require("./punchout.controller");

const router = express.Router();

// Public PunchOut endpoints for Visma eHandel handshake and portal
router.post("/setup", initiatePunchOut);
router.get("/setup", initiatePunchOut);
router.get("/catalog", getCatalog);
router.post("/return-cart", returnCart);

module.exports = router;
