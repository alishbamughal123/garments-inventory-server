const express = require("express");

const {
  create,
  getAll,
  getBarcodeImage,
  getLowStock,
  search,
  getById,
  update,
  remove,
} = require("./products.controller");

const authMiddleware =
  require("../../middlewares/auth.middleware");

const roleMiddleware =
  require("../../middlewares/role.middleware");

const router =
  express.Router();

/*
|--------------------------------------------------------------------------
| CREATE PRODUCT
|--------------------------------------------------------------------------
*/

router.post(
  "/",
  authMiddleware,
  roleMiddleware(
    "ADMIN",
    "MANAGER"
  ),
  create
);

/*
|--------------------------------------------------------------------------
| GET ALL PRODUCTS
|--------------------------------------------------------------------------
*/

router.get(
  "/",
  authMiddleware,
  getAll
);

/*
|--------------------------------------------------------------------------
| GENERATE BARCODE IMAGE
|--------------------------------------------------------------------------
*/

// router.get(
//   "/barcode/:barcode",
//   authMiddleware,
//   getBarcodeImage
// );
router.get(
  "/barcode/:barcode",
  getBarcodeImage
);
router.get(
  "/low-stock",
  authMiddleware,
  getLowStock
);
router.get(
  "/search",
  authMiddleware,
  search
);
router.get(
  "/:id",
  authMiddleware,
  getById
);

router.put(
  "/:id",
  authMiddleware,
  roleMiddleware(
    "ADMIN",
    "MANAGER"
  ),
  update
);

router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware(
    "ADMIN",
    "MANAGER"
  ),
  remove
);
module.exports = router;