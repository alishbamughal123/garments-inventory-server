const express = require("express");

const {
  create,
  getAll,
  getBaseStylesHandler,
  getBarcodeImage,
  getLowStock,
  search,
  getById,
  update,
  getPriceHistoryHandler,
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

router.get(
  "/base-styles",
  authMiddleware,
  getBaseStylesHandler
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
  "/:id/price-history",
  authMiddleware,
  getPriceHistoryHandler
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

const multer = require("multer");
const path = require("path");
const fs = require("fs");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let dest = "uploads/articles";
    if (file.fieldname === "washingImage") {
      dest = "uploads/washing";
    }
    fs.mkdirSync(dest, { recursive: true });
    cb(null, dest);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || ".png";
    cb(null, `${req.params.id || "article"}-${Date.now()}-${file.fieldname}${ext}`);
  },
});

const upload = multer({ storage });

router.post(
  "/:id/images",
  authMiddleware,
  roleMiddleware("ADMIN", "MANAGER"),
  upload.fields([
    { name: "articleImage", maxCount: 1 },
    { name: "washingImage", maxCount: 1 },
  ]),
  require("./products.controller").uploadProductImages
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