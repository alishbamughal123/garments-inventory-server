const {
  createProduct,
  getProducts,
  getBaseStyles,
  getLowStockProducts,
  searchProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getPriceHistory,
  bulkUpdateCostPrices,
} = require("./products.service");
const {
  successResponse,
  errorResponse,
} = require("../../utils/responseHandler");

const {
  createProductSchema,
  updateProductSchema,
} = require("./products.validation");

const generateBarcodeImage = require("../../utils/barcode.helper");

/*
|--------------------------------------------------------------------------
| CREATE PRODUCT
|--------------------------------------------------------------------------
*/

const create = async (req, res) => {
  try {
    const validatedData = createProductSchema.parse(req.body);

    const result = await createProduct(validatedData, req.user.id);

    return successResponse(res, result, "Product created successfully");
  } catch (error) {
    return errorResponse(res, error.message);
  }
};

/*
|--------------------------------------------------------------------------
| GET ALL PRODUCTS
|--------------------------------------------------------------------------
*/

const getAll = async (req, res) => {
  try {
    const result = await getProducts(req.query);

    return successResponse(
      res,
      result.products || result,
      "Products fetched successfully",
      result.pagination
    );
  } catch (error) {
    return errorResponse(res, error.message);
  }
};

const getBaseStylesHandler = async (req, res) => {
  try {
    const styles = await getBaseStyles();
    return successResponse(res, styles, "Base styles fetched successfully");
  } catch (error) {
    return errorResponse(res, error.message);
  }
};

/*
|--------------------------------------------------------------------------
| GENERATE BARCODE IMAGE
|--------------------------------------------------------------------------
*/

const getBarcodeImage = async (req, res) => {
  try {
    const { barcode } = req.params;

    const imageBuffer = await generateBarcodeImage(barcode);

    res.setHeader("Content-Type", "image/png");

    return res.send(imageBuffer);
  } catch (error) {
    return errorResponse(res, error.message);
  }
};

const getLowStock = async (req, res) => {
  try {
    const result = await getLowStockProducts(req.query);

    return successResponse(
      res,
      result.products || result,
      "Low stock products fetched successfully",
      result.pagination
    );
  } catch (error) {
    return errorResponse(res, error.message);
  }
};

const search = async (req, res) => {
  try {
    const query = req.query.query || req.query.q || req.query.search || "";

    const result = await searchProducts(query, req.query);

    return successResponse(
      res,
      result.products || result,
      "Products fetched successfully",
      result.pagination
    );
  } catch (error) {
    return errorResponse(res, error.message);
  }
};

const getById = async (req, res) => {
  try {
    const result = await getProductById(req.params.id);

    return successResponse(res, result, "Product fetched successfully");
  } catch (error) {
    return errorResponse(res, error.message);
  }
};

const update = async (req, res) => {
  try {
    const validatedData = updateProductSchema.parse(req.body);

    const result = await updateProduct(req.params.id, {
      ...validatedData,
      userId: req.user?.id,
    });

    return successResponse(res, result, "Product updated successfully");
  } catch (error) {
    return errorResponse(res, error.message);
  }
};

const getPriceHistoryHandler = async (req, res) => {
  try {
    const result = await getPriceHistory(req.params.id);

    return successResponse(
      res,
      result,
      "Price history fetched successfully"
    );
  } catch (error) {
    return errorResponse(res, error.message);
  }
};

const remove = async (req, res) => {
  try {
    const result = await deleteProduct(req.params.id);

    return successResponse(res, result, "Product deleted successfully");
  } catch (error) {
    return errorResponse(res, error.message);
  }
};

const uploadProductImages = async (req, res) => {
  try {
    const productId = req.params.id;
    const updateData = {};

    if (req.files?.articleImage && req.files.articleImage[0]) {
      updateData.imageUrl = `/uploads/articles/${req.files.articleImage[0].filename}`;
    }

    if (req.files?.washingImage && req.files.washingImage[0]) {
      updateData.washingInstructionsImageUrl = `/uploads/washing/${req.files.washingImage[0].filename}`;
    }

    if (req.body.washingInstructions) {
      updateData.washingInstructions = req.body.washingInstructions;
    }

    const result = await updateProduct(productId, updateData);

    return successResponse(res, result, "Article images updated successfully");
  } catch (error) {
    return errorResponse(res, error.message);
  }
};

const bulkUpdateCostPriceHandler = async (req, res) => {
  try {
    const { baseStyleNumber, colors, purchasePrice, reason } = req.body;
    const result = await bulkUpdateCostPrices(
      { baseStyleNumber, colors, purchasePrice, reason },
      req.user?.id
    );

    return successResponse(
      res,
      result,
      `Successfully updated cost price for ${result.count} variants`
    );
  } catch (error) {
    return errorResponse(res, error.message);
  }
};

module.exports = {
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
  uploadProductImages,
  bulkUpdateCostPriceHandler,
};

