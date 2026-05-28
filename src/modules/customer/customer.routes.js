
const express =
  require("express");

const {
  addCustomer,
  getAllCustomers,
  getSingleCustomer,
  editCustomer,
  removeCustomer,
} = require("./customer.controller");

const authMiddleware =
  require("../../middlewares/auth.middleware");

const router =
  express.Router();

/*
|--------------------------------------------------------------------------
| CREATE CUSTOMER
|--------------------------------------------------------------------------
*/

router.post(
  "/",
  authMiddleware,
  addCustomer
);

/*
|--------------------------------------------------------------------------
| GET ALL CUSTOMERS
|--------------------------------------------------------------------------
*/

router.get(
  "/",
  authMiddleware,
  getAllCustomers
);

/*
|--------------------------------------------------------------------------
| GET SINGLE CUSTOMER
|--------------------------------------------------------------------------
*/

router.get(
  "/:id",
  authMiddleware,
  getSingleCustomer
);

/*
|--------------------------------------------------------------------------
| UPDATE CUSTOMER
|--------------------------------------------------------------------------
*/

router.patch(
  "/:id",
  authMiddleware,
  editCustomer
);

/*
|--------------------------------------------------------------------------
| DELETE CUSTOMER
|--------------------------------------------------------------------------
*/

router.delete(
  "/:id",
  authMiddleware,
  removeCustomer
);

module.exports = router;
