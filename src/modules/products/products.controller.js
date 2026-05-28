const {
  createProduct,
  getProducts,
  getLowStockProducts,
  searchProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} = require("./products.service");
const {
  successResponse,
  errorResponse,
} = require("../../utils/responseHandler");

const {
  createProductSchema,
} = require("./products.validation");

const generateBarcodeImage =
  require("../../utils/barcode.helper");

/*
|--------------------------------------------------------------------------
| CREATE PRODUCT
|--------------------------------------------------------------------------
*/

const create = async (
  req,
  res
) => {
  try {
    const validatedData =
      createProductSchema.parse(
        req.body
      );

    const result =
      await createProduct(
        validatedData,
        req.user.id
      );

    return successResponse(
      res,
      result,
      "Product created successfully"
    );
  } catch (error) {
    return errorResponse(
      res,
      error.message
    );
  }
};

/*
|--------------------------------------------------------------------------
| GET ALL PRODUCTS
|--------------------------------------------------------------------------
*/

const getAll = async (
  req,
  res
) => {
  try {
    const result =
      await getProducts();

    return successResponse(
      res,
      result,
      "Products fetched successfully"
    );
  } catch (error) {
    return errorResponse(
      res,
      error.message
    );
  }
};

/*
|--------------------------------------------------------------------------
| GENERATE BARCODE IMAGE
|--------------------------------------------------------------------------
*/

const getBarcodeImage =
  async (req, res) => {
    try {
      const { barcode } =
        req.params;

      const imageBuffer =
        await generateBarcodeImage(
          barcode
        );

      res.setHeader(
        "Content-Type",
        "image/png"
      );

      return res.send(
        imageBuffer
      );
    } catch (error) {
      return errorResponse(
        res,
        error.message
      );
    }
  };
  const getLowStock =
  async (req, res) => {
    try {
      const result =
        await getLowStockProducts();

      return successResponse(
        res,
        result,
        "Low stock products fetched successfully"
      );
    } catch (error) {
      return errorResponse(
        res,
        error.message
      );
    }
  };
const search =
  async (req, res) => {
    try {
      const { query } =
        req.query;

      const result =
        await searchProducts(
          query
        );

      return successResponse(
        res,
        result,
        "Products fetched successfully"
      );
    } catch (error) {
      return errorResponse(
        res,
        error.message
      );
    }
  };
  const getById =
  async (req, res) => {
    try {
      const result =
        await getProductById(
          req.params.id
        );

      return successResponse(
        res,
        result,
        "Product fetched successfully"
      );
    } catch (error) {
      return errorResponse(
        res,
        error.message
      );
    }
  };

const update =
  async (req, res) => {
    try {
      const result =
        await updateProduct(
          req.params.id,
          req.body
        );

      return successResponse(
        res,
        result,
        "Product updated successfully"
      );
    } catch (error) {
      return errorResponse(
        res,
        error.message
      );
    }
  };

const remove =
  async (req, res) => {
    try {
      const result =
        await deleteProduct(
          req.params.id
        );

      return successResponse(
        res,
        result,
        "Product deleted successfully"
      );
    } catch (error) {
      return errorResponse(
        res,
        error.message
      );
    }
  };
module.exports = {
  create,
  getAll,
  getBarcodeImage,
  getLowStock,
  search,
  getById,
  update,
  remove,
};