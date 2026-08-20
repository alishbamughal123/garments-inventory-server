const {
  createCategory,
  getCategories,
  updateCategory,
  deleteCategory,
} = require("./categories.service");

const {
  successResponse,
  errorResponse,
} = require("../../utils/responseHandler");

const {
  createCategorySchema,
} = require("./categories.validation");

/*
|--------------------------------------------------------------------------
| CREATE CATEGORY
|--------------------------------------------------------------------------
*/

const create = async (req, res) => {
  try {
    const validatedData = createCategorySchema.parse(req.body);

    const result = await createCategory(validatedData);

    return successResponse(
      res,
      result,
      "Category created successfully"
    );
  } catch (error) {
    return errorResponse(res, error.message);
  }
};

/*
|--------------------------------------------------------------------------
| GET ALL CATEGORIES
|--------------------------------------------------------------------------
*/

const getAll = async (req, res) => {
  try {
    const result = await getCategories(req.query);

    return successResponse(
      res,
      result.categories || result,
      "Categories fetched successfully",
      result.pagination
    );
  } catch (error) {
    return errorResponse(res, error.message);
  }
};
/*
|--------------------------------------------------------------------------
| UPDATE CATEGORY
|--------------------------------------------------------------------------
*/

const update = async (
  req,
  res
) => {
  try {
    const result =
      await updateCategory(
        req.params.id,
        req.body
      );

    return successResponse(
      res,
      result,
      "Category updated successfully"
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
| DELETE CATEGORY
|--------------------------------------------------------------------------
*/

const remove = async (
  req,
  res
) => {
  try {
    const result =
      await deleteCategory(
        req.params.id
      );

    return successResponse(
      res,
      result,
      "Category deleted successfully"
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
  update,
  remove,
};