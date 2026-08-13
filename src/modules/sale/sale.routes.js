const express = require("express");

const {
  createSaleHandler,
  getAllSales,
  getSingleSale,
  removeSale,
  updateSaleHandler,
} = require("./sale.controller");

const authMiddleware = require("../../middlewares/auth.middleware");

const roleMiddleware = require("../../middlewares/role.middleware");

const router = express.Router();

/*
|--------------------------------------------------------------------------
| CREATE SALE
|--------------------------------------------------------------------------
*/

router.post("/", authMiddleware, createSaleHandler);

/*
|--------------------------------------------------------------------------
| GET ALL SALES
|--------------------------------------------------------------------------
*/

router.get("/", authMiddleware, getAllSales);

/*
|--------------------------------------------------------------------------
| GET SINGLE SALE
|--------------------------------------------------------------------------
*/

router.get("/:id", authMiddleware, getSingleSale);

/*
|--------------------------------------------------------------------------
| DELETE SALE
|--------------------------------------------------------------------------
*/

router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware("ADMIN", "MANAGER", "CASHIER", "STAFF"),
  removeSale
);

/*
|--------------------------------------------------------------------------
| UPDATE SALE
|--------------------------------------------------------------------------
*/

router.put(
  "/:id",
  authMiddleware,
  roleMiddleware("ADMIN", "MANAGER", "CASHIER", "STAFF"),
  updateSaleHandler
);

module.exports = router;
