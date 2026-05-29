
const express = require("express");

const router = express.Router();

const authMiddleware =
  require("../../../src/middlewares/auth.middleware")

const {
  createCustomerHandler,
  getCustomersHandler,
  getCustomerByIdHandler,
  updateCustomerHandler,
  deleteCustomerHandler,
  addInteractionHandler,
  getInteractionsHandler,
} = require("./customer.controller");

/*
|--------------------------------------------------------------------------
| CUSTOMERS
|--------------------------------------------------------------------------
*/

router.post(
  "/",
  authMiddleware,
  createCustomerHandler
);

router.get(
  "/",
  authMiddleware,
  getCustomersHandler
);

router.get(
  "/:id",
  authMiddleware,
  getCustomerByIdHandler
);

router.patch(
  "/:id",
  authMiddleware,
  updateCustomerHandler
);

router.delete(
  "/:id",
  authMiddleware,
  deleteCustomerHandler
);

/*
|--------------------------------------------------------------------------
| CUSTOMER INTERACTIONS
|--------------------------------------------------------------------------
*/

router.post(
  "/:id/interactions",
  authMiddleware,
  addInteractionHandler
);

router.get(
  "/:id/interactions",
  authMiddleware,
  getInteractionsHandler
);

module.exports = router;
