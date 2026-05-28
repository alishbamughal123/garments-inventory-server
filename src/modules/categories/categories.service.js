const prisma = require("../../config/db");

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

const getCategories = async () => {
  return prisma.category.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });
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