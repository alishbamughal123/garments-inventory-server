const express = require("express");

const {
  getDashboard,
} = require("./dashboard.controller");

const authMiddleware =
  require("../../middlewares/auth.middleware");

const router =
  express.Router();

router.get(
  "/",
  authMiddleware,
  getDashboard
);

module.exports = router;