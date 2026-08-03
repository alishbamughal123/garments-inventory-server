const prisma = require("../../config/db");
const generateSKU = require("../../utils/generateSKU");
const generateBarcode = require("../../utils/generateBarcode");
const {
  normalizeProductPayload,
} = require("./productVariant.helper");

/*
|--------------------------------------------------------------------------
| CREATE PRODUCT
|--------------------------------------------------------------------------
*/

const createProduct = async (
  payload,
  userId
) => {
  const normalizedPayload =
    normalizeProductPayload(
      payload
    );

  // CHECK CATEGORY
  const category =
    await prisma.category.findUnique({
      where: {
        id: normalizedPayload.categoryId,
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
  const sku =
    normalizedPayload.styleNumber ||
    generateSKU(
      category.name,
      normalizedPayload.color,
      normalizedPayload.size ||
        "OS",
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
                normalizedPayload.productName,

              baseStyleNumber:
                normalizedPayload.baseStyleNumber,

              styleNumber:
                normalizedPayload.styleNumber,

              styleName:
                normalizedPayload.styleName,

              itemName:
                normalizedPayload.itemName,

              brand:
                normalizedPayload.brand,

              color:
                normalizedPayload.color,

              colorCode:
                normalizedPayload.colorCode,

              size:
                normalizedPayload.size,

              fabric:
                normalizedPayload.fabric,

              fabricComposition:
                normalizedPayload.fabricComposition,

              fabricWeight:
                normalizedPayload.fabricWeight,

              purchasePrice:
                normalizedPayload.purchasePrice,

              salePrice:
                normalizedPayload.salePrice,

              stockQuantity:
                normalizedPayload.stockQuantity,

              minStockAlert:
                normalizedPayload.minStockAlert ||
                5,

              description:
                normalizedPayload.description,

              categoryId:
                normalizedPayload.categoryId,
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
          normalizedPayload.supplierBarcode
        ) {
          await tx.barcode.create({
            data: {
              barcodeValue:
                normalizedPayload.supplierBarcode,

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
                normalizedPayload.stockQuantity,

              previousStock: 0,

              newStock:
                normalizedPayload.stockQuantity,

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
            styleNumber: {
              contains: query,
              mode: "insensitive",
            },
          },
          {
            baseStyleNumber: {
              contains: query,
              mode: "insensitive",
            },
          },
          {
            styleName: {
              contains: query,
              mode: "insensitive",
            },
          },
          {
            itemName: {
              contains: query,
              mode: "insensitive",
            },
          },
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
  const normalizedPayload =
    normalizeProductPayload(
      payload
    );

  const product =
    await prisma.product.findUnique({
      where: { id },
    });

  if (!product) {
    throw new Error(
      "Product not found"
    );
  }

  const updatedProduct = await prisma.product.update({
    where: { id },
    data: {
      productName:
        normalizedPayload.productName,

      baseStyleNumber:
        normalizedPayload.baseStyleNumber,

      styleNumber:
        normalizedPayload.styleNumber,

      styleName:
        normalizedPayload.styleName,

      itemName:
        normalizedPayload.itemName,

      brand:
        normalizedPayload.brand,

      color:
        normalizedPayload.color,

      colorCode:
        normalizedPayload.colorCode,

      size:
        normalizedPayload.size,

      fabric:
        normalizedPayload.fabric,

      fabricComposition:
        normalizedPayload.fabricComposition,

      fabricWeight:
        normalizedPayload.fabricWeight,

      purchasePrice:
        normalizedPayload.purchasePrice,

      salePrice:
        normalizedPayload.salePrice,

      stockQuantity:
        normalizedPayload.stockQuantity,

      minStockAlert:
        normalizedPayload.minStockAlert,

      description:
        normalizedPayload.description,

      categoryId:
        normalizedPayload.categoryId,

      sku:
        normalizedPayload.styleNumber ||
        product.sku,
    },
  });

  /*
  |--------------------------------------------------------------------------
  | HANDLE PRICE HISTORY LOGGING
  |--------------------------------------------------------------------------
  */
  const isSalePriceChanged =
    normalizedPayload.salePrice !== undefined &&
    Number(normalizedPayload.salePrice) !== Number(product.salePrice);

  const isPurchasePriceChanged =
    normalizedPayload.purchasePrice !== undefined &&
    Number(normalizedPayload.purchasePrice) !== Number(product.purchasePrice);

  if (isSalePriceChanged || isPurchasePriceChanged) {
    await prisma.priceHistory.create({
      data: {
        productId: id,
        oldSalePrice: product.salePrice,
        newSalePrice: normalizedPayload.salePrice ?? product.salePrice,
        oldPurchasePrice: product.purchasePrice,
        newPurchasePrice: normalizedPayload.purchasePrice ?? product.purchasePrice,
        reason: normalizedPayload.priceChangeReason || "Price updated",
        changedById: payload?.userId || null,
      },
    });
  }

  /*
  |--------------------------------------------------------------------------
  | HANDLE BARCODE UPDATE
  |--------------------------------------------------------------------------
  */

  if (normalizedPayload.supplierBarcode) {
    const existingSupplierBarcode =
      await prisma.barcode.findFirst({
        where: {
          productId: id,
          barcodeSource: "SUPPLIER",
        },
      });

    if (existingSupplierBarcode) {
      await prisma.barcode.update({
        where: { id: existingSupplierBarcode.id },
        data: {
          barcodeValue: normalizedPayload.supplierBarcode,
        },
      });
    } else {
      await prisma.barcode.create({
        data: {
          barcodeValue: normalizedPayload.supplierBarcode,
          barcodeType: "EAN13",
          barcodeSource: "SUPPLIER",
          isPrimary: false,
          productId: id,
        },
      });
    }
  }

  return updatedProduct;
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
      include: {
        saleItems: {
          select: {
            id: true,
          },
        },
      },
    });

  if (!product) {
    throw new Error(
      "Product not found"
    );
  }

  if (
    product.saleItems.length > 0
  ) {
    throw new Error(
      "This article is linked to sales and cannot be deleted"
    );
  }

  return prisma.$transaction(
    async (tx) => {
      await tx.barcode.deleteMany({
        where: {
          productId: id,
        },
      });

      await tx.inventoryTransaction.deleteMany(
        {
          where: {
            productId: id,
          },
        }
      );

      await tx.return.deleteMany({
        where: {
          productId: id,
        },
      });

      return tx.product.delete({
        where: { id },
      });
    }
  );
};
const getPriceHistory = async (productId) => {
  return await prisma.priceHistory.findMany({
    where: { productId },
    include: {
      changedBy: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
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
  getPriceHistory,
};
