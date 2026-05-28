const express = require("express");

const {
  addStock,
  removeStock,
  getAllTransactions,
} = require("./inventory.controller");

const authMiddleware = require("../../middlewares/auth.middleware");

const roleMiddleware = require("../../middlewares/role.middleware");

const router = express.Router();

/*
|--------------------------------------------------------------------------
| STOCK IN
|--------------------------------------------------------------------------
*/

router.post(
  "/stock-in",
  authMiddleware,
  roleMiddleware("ADMIN", "MANAGER"),
  addStock
);

/*
|--------------------------------------------------------------------------
| STOCK OUT
|--------------------------------------------------------------------------
*/

router.post(
  "/stock-out",
  authMiddleware,
  roleMiddleware(
    "ADMIN",
    "MANAGER",
    "CASHIER"
  ),
  removeStock
);

/*
|--------------------------------------------------------------------------
| GET TRANSACTIONS
|--------------------------------------------------------------------------
*/

router.get(
  "/transactions",
  authMiddleware,
  getAllTransactions
);

module.exports = router;