
const express =
  require("express");

const {
  createSaleHandler,
  getAllSales,
  getSingleSale,
} = require("./sale.controller");

const authMiddleware =
  require("../../middlewares/auth.middleware");

const router =
  express.Router();

/*
|--------------------------------------------------------------------------
| CREATE SALE
|--------------------------------------------------------------------------
*/

router.post(
  "/",
  authMiddleware,
  createSaleHandler
);

/*
|--------------------------------------------------------------------------
| GET ALL SALES
|--------------------------------------------------------------------------
*/

router.get(
  "/",
  authMiddleware,
  getAllSales
);

/*
|--------------------------------------------------------------------------
| GET SINGLE SALE
|--------------------------------------------------------------------------
*/

router.get(
  "/:id",
  authMiddleware,
  getSingleSale
);

module.exports = router;
