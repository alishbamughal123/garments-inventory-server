const express = require("express");

const {
  createReturn,
  getAllReturns,
} = require("./returns.controller");

const authMiddleware = require("../../middlewares/auth.middleware");

const roleMiddleware = require("../../middlewares/role.middleware");

const router = express.Router();

/*
|--------------------------------------------------------------------------
| CREATE RETURN
|--------------------------------------------------------------------------
*/

router.post(
  "/",
  authMiddleware,
  roleMiddleware(
    "ADMIN",
    "MANAGER",
    "CASHIER"
  ),
  createReturn
);

/*
|--------------------------------------------------------------------------
| GET RETURNS
|--------------------------------------------------------------------------
*/

router.get(
  "/",
  authMiddleware,
  getAllReturns
);

module.exports = router;