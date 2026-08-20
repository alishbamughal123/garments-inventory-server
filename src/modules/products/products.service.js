const prisma = require("../../config/db");
const generateSKU = require("../../utils/generateSKU");
const generateBarcode = require("../../utils/generateBarcode");
const {
  normalizeProductPayload,
} = require("./productVariant.helper");
const {
  getPaginationParams,
  formatPaginationMeta,
} = require("../../utils/pagination.helper");

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

              weightInKg:
                normalizedPayload.weightInKg || 0,

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

              imageUrl:
                normalizedPayload.imageUrl || "/uploads/placeholders/default-article.svg",

              washingInstructionsImageUrl:
                normalizedPayload.washingInstructionsImageUrl || "/uploads/placeholders/default-washing.svg",

              washingInstructions:
                normalizedPayload.washingInstructions || "40°C Standard Wash - Gentle Cycle. Do Not Bleach. Tumble Dry Low.",

              isContracted:
                normalizedPayload.isContracted !== undefined ? normalizedPayload.isContracted : false,

              logoOptions:
                normalizedPayload.logoOptions || { frontLeftChest: true, backText: true, sleeveLogo: false },

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

const buildProductWhere = (query = {}) => {
  const where = {};
  const search = (query.search || query.query || query.q || "").trim();

  const conditions = [];

  if (search) {
    conditions.push({
      OR: [
        { styleNumber: { contains: search, mode: "insensitive" } },
        { baseStyleNumber: { contains: search, mode: "insensitive" } },
        { styleName: { contains: search, mode: "insensitive" } },
        { itemName: { contains: search, mode: "insensitive" } },
        { productName: { contains: search, mode: "insensitive" } },
        { sku: { contains: search, mode: "insensitive" } },
        { brand: { contains: search, mode: "insensitive" } },
        { color: { contains: search, mode: "insensitive" } },
        {
          barcodes: {
            some: {
              barcodeValue: { contains: search, mode: "insensitive" },
            },
          },
        },
      ],
    });
  }

  if (query.styleFilter && query.styleFilter !== "ALL") {
    conditions.push({
      OR: [
        { baseStyleNumber: query.styleFilter },
        { styleNumber: { startsWith: query.styleFilter } },
      ],
    });
  }

  if (query.categoryId) {
    conditions.push({ categoryId: query.categoryId });
  }

  if (conditions.length > 0) {
    where.AND = conditions;
  }

  return where;
};

/*
|--------------------------------------------------------------------------
| GET ALL PRODUCTS (Paginated)
|--------------------------------------------------------------------------
*/

const getProducts = async (query = {}) => {
  const { page, limit, skip, take, isAll } = getPaginationParams(query, 25, 200);
  const where = buildProductWhere(query);

  if (isAll) {
    const products = await prisma.product.findMany({
      where,
      include: {
        category: true,
        barcodes: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return {
      products,
      pagination: formatPaginationMeta(products.length, 1, products.length || 1),
    };
  }

  const [total, products] = await Promise.all([
    prisma.product.count({ where }),
    prisma.product.findMany({
      where,
      include: {
        category: true,
        barcodes: true,
      },
      skip,
      take,
      orderBy: {
        createdAt: "desc",
      },
    }),
  ]);

  return {
    products,
    pagination: formatPaginationMeta(total, page, limit),
  };
};

const getBaseStyles = async () => {
  const products = await prisma.product.findMany({
    select: {
      baseStyleNumber: true,
      styleNumber: true,
    },
  });

  const styles = Array.from(
    new Set(
      products
        .map((p) => p.baseStyleNumber || (p.styleNumber ? p.styleNumber.split("-")[0] : null))
        .filter(Boolean)
    )
  ).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

  return styles;
};

const getLowStockProducts = async (query = {}) => {
  const { page, limit, skip, take, isAll } = getPaginationParams(query, 25, 200);

  const products = await prisma.product.findMany({
    include: {
      category: true,
      barcodes: true,
    },
    orderBy: {
      stockQuantity: "asc",
    },
  });

  const lowStock = products.filter(
    (item) => item.stockQuantity <= item.minStockAlert
  );

  if (isAll) {
    return {
      products: lowStock,
      pagination: formatPaginationMeta(lowStock.length, 1, lowStock.length || 1),
    };
  }

  const paginatedItems = lowStock.slice(skip, skip + take);

  return {
    products: paginatedItems,
    pagination: formatPaginationMeta(lowStock.length, page, limit),
  };
};

const searchProducts = async (query, options = {}) => {
  return await getProducts({
    ...options,
    search: query,
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

      weightInKg:
        normalizedPayload.weightInKg !== undefined ? normalizedPayload.weightInKg : product.weightInKg,

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

      imageUrl:
        normalizedPayload.imageUrl !== undefined ? normalizedPayload.imageUrl : product.imageUrl,

      washingInstructionsImageUrl:
        normalizedPayload.washingInstructionsImageUrl !== undefined ? normalizedPayload.washingInstructionsImageUrl : product.washingInstructionsImageUrl,

      washingInstructions:
        normalizedPayload.washingInstructions !== undefined ? normalizedPayload.washingInstructions : product.washingInstructions,

      isContracted:
        normalizedPayload.isContracted !== undefined ? normalizedPayload.isContracted : product.isContracted,

      logoOptions:
        normalizedPayload.logoOptions !== undefined ? normalizedPayload.logoOptions : product.logoOptions,

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
  getBaseStyles,
  getLowStockProducts,
  searchProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getPriceHistory,
};
