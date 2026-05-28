const prisma = require("../../config/db");

const generateSKU = require("../../utils/generateSKU");

const generateBarcode = require("../../utils/generateBarcode");

/*
|--------------------------------------------------------------------------
| CREATE PRODUCT
|--------------------------------------------------------------------------
*/

const createProduct = async (
  payload,
  userId
) => {
  // CHECK CATEGORY
  const category =
    await prisma.category.findUnique({
      where: {
        id: payload.categoryId,
      },
    });

  if (!category) {
    throw new Error(
      "Category not found"
    );
  }

  // TOTAL PRODUCTS COUNT
  const totalProducts =
    await prisma.product.count();

  // GENERATE SKU
  const sku = generateSKU(
    category.name,
    payload.color,
    payload.size,
    totalProducts
  );

  // GENERATE BARCODE
  const internalBarcode =
    generateBarcode(totalProducts);

  /*
  |--------------------------------------------------------------------------
  | TRANSACTION
  |--------------------------------------------------------------------------
  */

  const finalProduct =
    await prisma.$transaction(
      async (tx) => {
        // CREATE PRODUCT
        const product =
          await tx.product.create({
            data: {
              sku,

              productName:
                payload.productName,

              brand:
                payload.brand,

              color:
                payload.color,

              size:
                payload.size,

              fabric:
                payload.fabric,

              purchasePrice:
                payload.purchasePrice,

              salePrice:
                payload.salePrice,

              stockQuantity:
                payload.stockQuantity,

              minStockAlert:
                payload.minStockAlert ||
                5,

              description:
                payload.description,

              categoryId:
                payload.categoryId,
            },
          });

        /*
        |--------------------------------------------------------------------------
        | INTERNAL BARCODE
        |--------------------------------------------------------------------------
        */

        await tx.barcode.create({
          data: {
            barcodeValue:
              internalBarcode,

            barcodeType:
              "CODE128",

            barcodeSource:
              "GENERATED",

            isPrimary: true,

            productId:
              product.id,
          },
        });

        /*
        |--------------------------------------------------------------------------
        | SUPPLIER BARCODE
        |--------------------------------------------------------------------------
        */

        if (
          payload.supplierBarcode
        ) {
          await tx.barcode.create({
            data: {
              barcodeValue:
                payload.supplierBarcode,

              barcodeType:
                "EAN13",

              barcodeSource:
                "SUPPLIER",

              isPrimary: false,

              productId:
                product.id,
            },
          });
        }

        /*
        |--------------------------------------------------------------------------
        | INVENTORY TRANSACTION
        |--------------------------------------------------------------------------
        */

        await tx.inventoryTransaction.create(
          {
            data: {
              transactionType:
                "STOCK_IN",

              quantity:
                payload.stockQuantity,

              previousStock: 0,

              newStock:
                payload.stockQuantity,

              notes:
                "Initial product stock",

              productId:
                product.id,

              performedById:
                userId,
            },
          }
        );

        return await tx.product.findUnique(
          {
            where: {
              id: product.id,
            },

            include: {
              category: true,

              barcodes: true,
            },
          }
        );
      }
    );

  return finalProduct;
};

/*
|--------------------------------------------------------------------------
| GET ALL PRODUCTS
|--------------------------------------------------------------------------
*/

const getProducts = async () => {
  const products = await prisma.product.findMany({
    include: {
      category: true,

      barcodes: true,
    },

    orderBy: {
      createdAt: "desc",
    },
  });

  return products;
};
const getLowStockProducts =
  async () => {
    const products =
      await prisma.product.findMany({
        include: {
          category: true,
          barcodes: true,
        },
      });

    return products.filter(
      (item) =>
        item.stockQuantity <=
        item.minStockAlert
    );
  };
  
const searchProducts =
  async (query) => {
    return await prisma.product.findMany({
      where: {
        OR: [
          {
            productName: {
              contains: query,
              mode: "insensitive",
            },
          },

          {
            sku: {
              contains: query,
              mode: "insensitive",
            },
          },

          {
            barcodes: {
              some: {
                barcodeValue: {
                  contains: query,
                  mode: "insensitive",
                },
              },
            },
          },
        ],
      },

      include: {
        category: true,
        barcodes: true,
      },
    });
  };
  /*
|--------------------------------------------------------------------------
| GET PRODUCT BY ID
|--------------------------------------------------------------------------
*/

const getProductById = async (id) => {
  const product =
    await prisma.product.findUnique({
      where: { id },

      include: {
        category: true,
        barcodes: true,
      },
    });

  if (!product) {
    throw new Error(
      "Product not found"
    );
  }

  return product;
};

/*
|--------------------------------------------------------------------------
| UPDATE PRODUCT
|--------------------------------------------------------------------------
*/

const updateProduct = async (
  id,
  payload
) => {
  const product =
    await prisma.product.findUnique({
      where: { id },
    });

  if (!product) {
    throw new Error(
      "Product not found"
    );
  }

  return prisma.product.update({
    where: { id },
    data: {
      productName:
        payload.productName,

      brand:
        payload.brand,

      color:
        payload.color,

      size:
        payload.size,

      fabric:
        payload.fabric,

      purchasePrice:
        payload.purchasePrice,

      salePrice:
        payload.salePrice,

      stockQuantity:
        payload.stockQuantity,

      minStockAlert:
        payload.minStockAlert,

      description:
        payload.description,

      categoryId:
        payload.categoryId,
    },
  });
};

/*
|--------------------------------------------------------------------------
| DELETE PRODUCT
|--------------------------------------------------------------------------
*/

const deleteProduct = async (
  id
) => {
  const product =
    await prisma.product.findUnique({
      where: { id },
    });

  if (!product) {
    throw new Error(
      "Product not found"
    );
  }

  return prisma.product.delete({
    where: { id },
  });
};
module.exports = {
  createProduct,
  getProducts,
  getLowStockProducts,
  searchProducts,
  getProductById,
  updateProduct,
  deleteProduct,
};