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
const {
  parseSearchInt,
  parseSearchNumber,
} = require("../../utils/search.helper");

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
                normalizedPayload.washingInstructions || "Do Not Bleach. Tumble Dry Low.",

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

const LOW_STOCK_LABELS = ["low stock", "lavt lager"];
const IN_STOCK_LABELS = ["in stock", "på lager"];

const labelMatches = (labels, term) =>
  term.length >= 3 && labels.some((label) => label.includes(term));

// Searchable columns shown in the article tables (Articles + Low Stock pages).
const buildProductSearchOr = (search) => {
  const contains = { contains: search, mode: "insensitive" };
  const conditions = [
    { styleNumber: contains },
    { baseStyleNumber: contains },
    { styleName: contains },
    { itemName: contains },
    { productName: contains },
    { sku: contains },
    { brand: contains },
    { color: contains },
    { colorCode: contains },
    { size: contains },
    { category: { name: contains } },
    { barcodes: { some: { barcodeValue: contains } } },
  ];

  const intValue = parseSearchInt(search);
  if (intValue !== null) {
    conditions.push({ stockQuantity: intValue });
    conditions.push({ minStockAlert: intValue });
  }

  const numValue = parseSearchNumber(search.replace(/^nok\s*/i, ""));
  if (numValue !== null) {
    conditions.push({ purchasePrice: numValue });
    conditions.push({ salePrice: numValue });
  }

  return conditions;
};

// Computed columns (status badge, total cost) cannot be expressed as a plain
// Prisma filter, so resolve them to a list of matching product ids.
const buildComputedProductConditions = async (search) => {
  const term = search.toLowerCase();
  const matchLow = labelMatches(LOW_STOCK_LABELS, term);
  const matchIn = labelMatches(IN_STOCK_LABELS, term);
  const numValue = parseSearchNumber(search.replace(/^nok\s*/i, ""));

  if (matchLow && matchIn) return [{}];
  if (!matchLow && !matchIn && numValue === null) return [];

  const rows = await prisma.product.findMany({
    select: {
      id: true,
      stockQuantity: true,
      minStockAlert: true,
      purchasePrice: true,
    },
  });

  const ids = rows
    .filter((row) => {
      const isLow = row.stockQuantity <= row.minStockAlert;
      if (matchLow && isLow) return true;
      if (matchIn && !isLow) return true;
      if (numValue !== null) {
        const total = row.stockQuantity * Number(row.purchasePrice || 0);
        if (Math.abs(total - numValue) < 0.005) return true;
      }
      return false;
    })
    .map((row) => row.id);

  return ids.length > 0 ? [{ id: { in: ids } }] : [];
};

const buildProductWhere = async (query = {}) => {
  const where = {};
  const search = (query.search || query.query || query.q || "").trim();

  const conditions = [];

  if (search) {
    conditions.push({
      OR: [
        ...buildProductSearchOr(search),
        ...(await buildComputedProductConditions(search)),
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

const productListSelect = {
  id: true,
  sku: true,
  productName: true,
  baseStyleNumber: true,
  styleNumber: true,
  styleName: true,
  itemName: true,
  brand: true,
  color: true,
  colorCode: true,
  size: true,
  fabric: true,
  fabricComposition: true,
  fabricWeight: true,
  weightInKg: true,
  purchasePrice: true,
  salePrice: true,
  stockQuantity: true,
  minStockAlert: true,
  imageUrl: true,
  isContracted: true,
  isActive: true,
  categoryId: true,
  createdAt: true,
  updatedAt: true,
  category: {
    select: { id: true, name: true }
  },
  barcodes: {
    select: { id: true, barcodeValue: true, barcodeType: true, isPrimary: true }
  }
};

const getProducts = async (query = {}) => {
  const { page, limit, skip, take, isAll } = getPaginationParams(query, 25, 200);
  const where = await buildProductWhere(query);

  if (isAll) {
    const products = await prisma.product.findMany({
      where,
      select: productListSelect,
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
      select: productListSelect,
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

  const search = (query.search || query.query || query.q || "").trim();

  // Every low stock row shows the same "Low Stock" status, so a status term matches all rows.
  const statusMatchesAll = labelMatches(LOW_STOCK_LABELS, search.toLowerCase());

  const products = await prisma.product.findMany({
    where:
      search && !statusMatchesAll
        ? { OR: buildProductSearchOr(search) }
        : {},
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

const bulkUpdateCostPrices = async (payload, userId) => {
  const { baseStyleNumber, colors, purchasePrice, reason } = payload;

  if (!baseStyleNumber || purchasePrice === undefined || purchasePrice === null) {
    throw new Error("Base style number and purchase price are required");
  }

  const whereClause = {
    OR: [
      { baseStyleNumber },
      { styleNumber: { startsWith: baseStyleNumber } },
      { sku: { startsWith: baseStyleNumber } },
    ],
  };

  if (colors && Array.isArray(colors) && colors.length > 0) {
    whereClause.color = { in: colors };
  }

  const products = await prisma.product.findMany({
    where: whereClause,
    select: { id: true, purchasePrice: true, salePrice: true, sku: true, color: true },
  });

  if (products.length === 0) {
    return { count: 0, message: "No matching variants found", products: [] };
  }

  const productIds = products.map((p) => p.id);
  const newPriceNum = Number(purchasePrice);

  await prisma.product.updateMany({
    where: { id: { in: productIds } },
    data: { purchasePrice: newPriceNum },
  });

  const histories = products.map((p) => ({
    productId: p.id,
    oldSalePrice: p.salePrice,
    newSalePrice: p.salePrice,
    oldPurchasePrice: p.purchasePrice,
    newPurchasePrice: newPriceNum,
    reason: reason || "Bulk Cost Price Update via UI",
    changedById: userId || null,
  }));

  if (histories.length > 0) {
    await prisma.priceHistory.createMany({
      data: histories,
    });
  }

  return { count: products.length, updatedIds: productIds };
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
  bulkUpdateCostPrices,
};
