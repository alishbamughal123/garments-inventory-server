const prisma = require("../../config/db");
const {
  getPaginationParams,
  formatPaginationMeta,
} = require("../../utils/pagination.helper");

/*
|--------------------------------------------------------------------------
| CREATE CATEGORY
|--------------------------------------------------------------------------
*/

const createCategory = async (payload) => {
  const existingCategory =
    await prisma.category.findUnique({
      where: {
        name: payload.name,
      },
    });

  if (existingCategory) {
    throw new Error(
      "Category already exists"
    );
  }

  return prisma.category.create({
    data: payload,
  });
};

/*
|--------------------------------------------------------------------------
| GET ALL CATEGORIES
|--------------------------------------------------------------------------
*/

const getCategories = async (searchOrQuery = "") => {
  const query =
    typeof searchOrQuery === "object" && searchOrQuery !== null
      ? searchOrQuery
      : { search: searchOrQuery };

  const { page, limit, skip, take, isAll } = getPaginationParams(query, 25, 200);
  const search = (query.search || "").trim();

  const where = {};
  if (search) {
    where.OR = [
      {
        name: {
          contains: search,
          mode: "insensitive",
        },
      },
      {
        description: {
          contains: search,
          mode: "insensitive",
        },
      },
    ];
  }

  if (isAll) {
    const categories = await prisma.category.findMany({
      where,
      orderBy: {
        createdAt: "desc",
      },
    });

    return {
      categories,
      pagination: formatPaginationMeta(categories.length, 1, categories.length || 1),
    };
  }

  const [total, categories] = await Promise.all([
    prisma.category.count({ where }),
    prisma.category.findMany({
      where,
      skip,
      take,
      orderBy: {
        createdAt: "desc",
      },
    }),
  ]);

  return {
    categories,
    pagination: formatPaginationMeta(total, page, limit),
  };
};

/*
|--------------------------------------------------------------------------
| UPDATE CATEGORY
|--------------------------------------------------------------------------
*/

const updateCategory = async (
  id,
  payload
) => {
  const category =
    await prisma.category.findUnique({
      where: { id },
    });

  if (!category) {
    throw new Error(
      "Category not found"
    );
  }

  return prisma.category.update({
    where: { id },
    data: payload,
  });
};

/*
|--------------------------------------------------------------------------
| DELETE CATEGORY
|--------------------------------------------------------------------------
*/

const deleteCategory = async (
  id
) => {
  const category =
    await prisma.category.findUnique({
      where: { id },
    });

  if (!category) {
    throw new Error(
      "Category not found"
    );
  }

  return prisma.category.delete({
    where: { id },
  });
};

module.exports = {
  createCategory,
  getCategories,
  updateCategory,
  deleteCategory,
};