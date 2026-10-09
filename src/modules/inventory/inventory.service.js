const prisma = require("../../config/db");
const {
  getPaginationParams,
  formatPaginationMeta,
} = require("../../utils/pagination.helper");
const {
  parseSearchInt,
  parseSearchNumber,
  parseSearchDateRange,
  matchEnumValues,
} = require("../../utils/search.helper");

const TRANSACTION_TYPES = [
  "STOCK_IN",
  "STOCK_OUT",
  "RETURN",
  "EXCHANGE",
  "ADJUSTMENT",
  "DAMAGE",
];

/*
|--------------------------------------------------------------------------
| FIND PRODUCT BY BARCODE OR SKU
|--------------------------------------------------------------------------
*/
const findProductByBarcode = async (barcodeOrSku) => {
  const barcode = await prisma.barcode.findFirst({
    where: { barcodeValue: barcodeOrSku },
    include: { product: true }
  });

  if (barcode) {
    return barcode.product;
  }

  const product = await prisma.product.findFirst({
    where: {
      OR: [
        { sku: barcodeOrSku },
        { styleNumber: barcodeOrSku },
        { id: barcodeOrSku }
      ]
    }
  });

  if (!product) {
    throw new Error(`Product or barcode '${barcodeOrSku}' not found`);
  }

  return product;
};

/*
|--------------------------------------------------------------------------
| STOCK IN
|--------------------------------------------------------------------------
*/
const stockIn = async (payload, userId) => {
  const product = await findProductByBarcode(payload.barcode);
  const previousStock = product.stockQuantity;
  const newStock = previousStock + payload.quantity;

  const updatedProduct = await prisma.$transaction(async (tx) => {
    const updated = await tx.product.update({
      where: { id: product.id },
      data: { stockQuantity: newStock }
    });

    await tx.inventoryTransaction.create({
      data: {
        transactionType: "STOCK_IN",
        quantity: payload.quantity,
        previousStock,
        newStock,
        notes: payload.notes || "Stock added",
        productId: product.id,
        performedById: userId
      }
    });

    return updated;
  });

  return updatedProduct;
};

/*
|--------------------------------------------------------------------------
| STOCK OUT (Task 2: Mandatory customer selection & Parcel weight calc)
|--------------------------------------------------------------------------
*/
const stockOut = async (payload, userId) => {
  const { customerId, barcode, items, notes, packagingWeightKg = 0.2 } = payload;

  if (!customerId) {
    throw new Error("Mandatory Customer Selection: Stock Out requires selecting a customer.");
  }

  const customer = await prisma.customer.findUnique({
    where: { id: customerId }
  });

  if (!customer) {
    throw new Error("Selected customer does not exist.");
  }

  // Support single item payload OR multi-item array
  let stockItems = [];
  if (items && Array.isArray(items) && items.length > 0) {
    stockItems = items;
  } else if (barcode) {
    stockItems = [{ barcode, quantity: payload.quantity || 1 }];
  } else {
    throw new Error("Please specify item barcode/SKU and quantity for stock out.");
  }

  const result = await prisma.$transaction(async (tx) => {
    let totalGarmentWeight = 0;
    let hasMissingWeights = false;
    const createdTransactions = [];

    for (const item of stockItems) {
      const product = await findProductByBarcode(item.barcode || item.productId);
      const qty = Number(item.quantity);

      if (qty > product.stockQuantity) {
        throw new Error(`Insufficient stock available for article ${product.productName || product.sku}. Available: ${product.stockQuantity}, Requested: ${qty}`);
      }

      const previousStock = product.stockQuantity;
      const newStock = previousStock - qty;

      const unitWeight = Number(product.weightInKg || 0);
      if (unitWeight === 0) {
        hasMissingWeights = true;
      }
      const itemWeight = unitWeight * qty;
      totalGarmentWeight += itemWeight;

      await tx.product.update({
        where: { id: product.id },
        data: { stockQuantity: newStock }
      });

      const transaction = await tx.inventoryTransaction.create({
        data: {
          transactionType: "STOCK_OUT",
          quantity: qty,
          previousStock,
          newStock,
          notes: notes || "Stock deducted for customer shipment",
          productId: product.id,
          performedById: userId,
          customerId: customer.id,
          packagingWeightKg: Number(packagingWeightKg),
          totalWeightKg: itemWeight + (Number(packagingWeightKg) / stockItems.length)
        },
        include: { product: true }
      });

      createdTransactions.push(transaction);
    }

    const totalParcelWeight = totalGarmentWeight + Number(packagingWeightKg);

    // Create Delivery Note Record in CRM
    const dnCount = await tx.deliveryNote.count();
    const year = new Date().getFullYear();
    const deliveryNoteNumber = `DN-${year}-${String(dnCount + 1).padStart(4, "0")}`;

    const deliveryNote = await tx.deliveryNote.create({
      data: {
        deliveryNoteNumber,
        customerId: customer.id,
        transactionId: createdTransactions[0]?.id,
        garmentWeightKg: totalGarmentWeight,
        packagingWeightKg: Number(packagingWeightKg),
        totalParcelWeight,
        notes: notes || `Delivery note for ${customer.companyName || customer.fullName}`
      }
    });

    await tx.auditLog.create({
      data: {
        action: "STOCK_OUT_PERFORMED",
        entity: "InventoryTransaction",
        entityId: createdTransactions[0]?.id,
        performedBy: userId,
        details: `Stock out performed for customer ${customer.fullName}. Created Delivery Note ${deliveryNoteNumber} (Total Parcel Weight: ${totalParcelWeight.toFixed(2)} kg)`
      }
    });

    return {
      customer,
      transactions: createdTransactions,
      deliveryNote,
      garmentWeightKg: totalGarmentWeight,
      packagingWeightKg: Number(packagingWeightKg),
      totalParcelWeight,
      hasMissingWeights
    };
  });

  return result;
};

/*
|--------------------------------------------------------------------------
| GET TRANSACTIONS (Filtered by Type/Customer)
|--------------------------------------------------------------------------
*/
const getTransactions = async (typeOrQuery = null, customerId = null) => {
  const query =
    typeof typeOrQuery === "object" && typeOrQuery !== null
      ? typeOrQuery
      : { transactionType: typeOrQuery, customerId };

  const { page, limit, skip, take, isAll } = getPaginationParams(query, 25, 200);
  const search = (query.search || query.query || "").trim();

  const where = {
    ...(query.transactionType ? { transactionType: query.transactionType } : {}),
    ...(query.customerId ? { customerId: query.customerId } : {}),
  };

  if (search) {
    const contains = { contains: search, mode: "insensitive" };

    where.OR = [
      { product: { productName: contains } },
      { product: { sku: contains } },
      { product: { styleNumber: contains } },
      { product: { color: contains } },
      { product: { size: contains } },
      { product: { brand: contains } },
      { product: { category: { name: contains } } },
      { customer: { fullName: contains } },
      { customer: { companyName: contains } },
      { customer: { customerCode: contains } },
      { performedBy: { name: contains } },
      { notes: contains },
      { referenceNumber: contains },
      { deliveryNote: { deliveryNoteNumber: contains } },
    ];

    // Type column (STOCK_IN / "Stock In" ...)
    const typeMatches = matchEnumValues(TRANSACTION_TYPES, search);
    if (typeMatches.length > 0) {
      where.OR.push({ transactionType: { in: typeMatches } });
    }

    // Numeric columns: quantity, previous, new
    const intValue = parseSearchInt(search);
    if (intValue !== null) {
      where.OR.push({ quantity: intValue });
      where.OR.push({ previousStock: intValue });
      where.OR.push({ newStock: intValue });
    }

    // Parcel weight column (shown with 2 decimals)
    const weightValue = parseSearchNumber(search.replace(/\s*kg$/i, ""));
    if (weightValue !== null) {
      where.OR.push({
        totalWeightKg: { gte: weightValue - 0.005, lt: weightValue + 0.005 },
      });
    }

    // Fallback delivery note label shown as DN-<first 8 chars of id>
    const dnFallback = search.match(/^dn-([0-9a-f-]{1,36})$/i);
    if (dnFallback) {
      where.OR.push({ id: { startsWith: dnFallback[1].toLowerCase() } });
    }

    // Date column
    const dateRange = parseSearchDateRange(search);
    if (dateRange) {
      where.OR.push({ createdAt: dateRange });
    }
  }

  if (isAll) {
    const transactions = await prisma.inventoryTransaction.findMany({
      where,
      include: {
        product: { include: { category: true } },
        customer: true,
        performedBy: {
          select: { id: true, name: true, email: true, role: true },
        },
        deliveryNote: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return {
      transactions,
      pagination: formatPaginationMeta(transactions.length, 1, transactions.length || 1),
    };
  }

  const [total, transactions] = await Promise.all([
    prisma.inventoryTransaction.count({ where }),
    prisma.inventoryTransaction.findMany({
      where,
      include: {
        product: { include: { category: true } },
        customer: true,
        performedBy: {
          select: { id: true, name: true, email: true, role: true },
        },
        deliveryNote: true,
      },
      skip,
      take,
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return {
    transactions,
    pagination: formatPaginationMeta(total, page, limit),
  };
};

/*
|--------------------------------------------------------------------------
| GET DELIVERY NOTES (CRM Delivery Notes storage)
|--------------------------------------------------------------------------
*/
const getDeliveryNotes = async (customerId = null) => {
  return await prisma.deliveryNote.findMany({
    where: customerId ? { customerId } : {},
    include: {
      customer: true,
      order: { include: { orderItems: { include: { product: true } } } },
      transaction: { include: { product: true } }
    },
    orderBy: { createdAt: "desc" }
  });
};

const getDeliveryNoteById = async (id) => {
  const note = await prisma.deliveryNote.findFirst({
    where: {
      OR: [{ id }, { deliveryNoteNumber: id }]
    },
    include: {
      customer: true,
      order: { include: { orderItems: { include: { product: true } } } },
      transaction: { include: { product: true } }
    }
  });

  if (!note) {
    throw new Error("Delivery Note not found");
  }

  return note;
};

module.exports = {
  stockIn,
  stockOut,
  getTransactions,
  getDeliveryNotes,
  getDeliveryNoteById
};