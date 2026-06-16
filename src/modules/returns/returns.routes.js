const express = require("express");

const {
  createReturn,
  getAllReturns,
  getReturn,
  modifyReturn,
  removeReturn,
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

/*
|--------------------------------------------------------------------------
| GET RETURN BY ID
|--------------------------------------------------------------------------
*/

router.get(
  "/:id",
  authMiddleware,
  getReturn
);

/*
|--------------------------------------------------------------------------
| UPDATE RETURN
|--------------------------------------------------------------------------
*/

router.put(
  "/:id",
  authMiddleware,
  roleMiddleware(
    "ADMIN",
    "MANAGER"
  ),
  modifyReturn
);

/*
|--------------------------------------------------------------------------
| DELETE RETURN
|--------------------------------------------------------------------------
*/

router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware(
    "ADMIN",
    "MANAGER"
  ),
  removeReturn
);

module.exports = router;