
const prisma = require("../../config/db");
const {
  getPaginationParams,
  formatPaginationMeta,
} = require("../../utils/pagination.helper");
const { numberCondition, dateCondition } = require("../../utils/columnSearch.helper");

/*
|--------------------------------------------------------------------------
| CREATE SALE
|--------------------------------------------------------------------------
*/

const createSale = async (payload, userId) => {
  const {
    customerId,
    subtotal,
    discount = 0,
    tax = 0,
    grandTotal,
    paymentMethod,
    notes,
    items,
  } = payload;

  const invoiceNumber = `INV-${Date.now()}`;

  const result = await prisma.$transaction(async (tx) => {
    let effectiveUserId = userId;
    if (!effectiveUserId) {
      const defaultUser = await tx.user.findFirst();
      effectiveUserId = defaultUser?.id;
    }

    if (!effectiveUserId) {
      throw new Error("No active user found to perform sale transaction");
    }

    /*
    |--------------------------------------------------------------------------
    | STOCK VALIDATION
    |--------------------------------------------------------------------------
    */

    for (const item of items) {
      const product = await tx.product.findUnique({
        where: { id: item.productId },
      });

      if (!product) {
        throw new Error("Product not found");
      }

      if (product.stockQuantity < item.quantity) {
        throw new Error(`${product.productName} is out of stock`);
      }
    }

    /*
    |--------------------------------------------------------------------------
    | CREATE SALE
    |--------------------------------------------------------------------------
    */

    const sale = await tx.sale.create({
      data: {
        invoiceNumber,
        customerId,
        subtotal,
        discount,
        tax,
        grandTotal,
        paymentMethod,
        notes,
      },
    });

    /*
    |--------------------------------------------------------------------------
    | CREATE SALE ITEMS & STOCK OUT TRANSACTIONS
    |--------------------------------------------------------------------------
    */

    for (const item of items) {
      await tx.saleItem.create({
        data: {
          saleId: sale.id,
          productId: item.productId,
          quantity: item.quantity,
          price: Number(item.unitPrice),
          total: Number(item.quantity) * Number(item.unitPrice),
        },
      });

      const product = await tx.product.findUnique({
        where: { id: item.productId },
      });

      const prevStock = product ? product.stockQuantity : 0;
      const newStock = prevStock - item.quantity;

      await tx.product.update({
        where: { id: item.productId },
        data: {
          stockQuantity: newStock,
        },
      });

      await tx.inventoryTransaction.create({
        data: {
          transactionType: "STOCK_OUT",
          quantity: item.quantity,
          previousStock: prevStock,
          newStock: newStock,
          productId: item.productId,
          performedById: effectiveUserId,
        },
      });
    }

    /*
    |--------------------------------------------------------------------------
    | UPDATE CUSTOMER DATA
    |--------------------------------------------------------------------------
    */

    if (customerId) {
      const customer = await tx.customer.findUnique({
        where: { id: customerId },
      });

      if (customer) {
        await tx.customer.update({
          where: { id: customerId },
          data: {
            totalOrders: customer.totalOrders + 1,
            totalSpent: customer.totalSpent + grandTotal,
          },
        });
      }
    }

    return sale;
  });

  return result;
};

/*
|--------------------------------------------------------------------------
| GET ALL SALES
|--------------------------------------------------------------------------
*/

const getSales = async (query = {}) => {
  try {
    const { page, limit, skip, take, isAll } = getPaginationParams(query, 25, 200);
    const search = (query.search || query.query || "").trim();

    const where = {};
    if (search) {
      where.OR = [
        { invoiceNumber: { contains: search, mode: "insensitive" } },
        { customer: { fullName: { contains: search, mode: "insensitive" } } },
        { customer: { companyName: { contains: search, mode: "insensitive" } } },
        { customer: { email: { contains: search, mode: "insensitive" } } },
        { customer: { phoneNumber: { contains: search, mode: "insensitive" } } },
        { paymentMethod: { contains: search, mode: "insensitive" } },
        {
          saleItems: {
            some: {
              OR: [
                { product: { productName: { contains: search, mode: "insensitive" } } },
                { product: { sku: { contains: search, mode: "insensitive" } } },
                { product: { styleNumber: { contains: search, mode: "insensitive" } } },
                { product: { color: { contains: search, mode: "insensitive" } } },
                { product: { size: { contains: search, mode: "insensitive" } } },
                ...numberCondition("quantity", search, true),
              ],
            },
          },
        },
        ...numberCondition("grandTotal", search),
        ...numberCondition("subtotal", search),
        ...dateCondition("createdAt", search),
      ];
    }

    // Report filters: a single customer ("WALKIN" = sales without a customer) and a date range
    if (query.customerId) {
      where.customerId = query.customerId === "WALKIN" ? null : String(query.customerId);
    }

    const rangeStart = /^\d{4}-\d{2}-\d{2}$/.test(query.from || "") ? new Date(`${query.from}T00:00:00`) : null;
    const rangeEnd = /^\d{4}-\d{2}-\d{2}$/.test(query.to || "") ? new Date(`${query.to}T00:00:00`) : null;
    if (rangeStart || rangeEnd) {
      where.createdAt = {
        ...(rangeStart && { gte: rangeStart }),
        ...(rangeEnd && { lt: new Date(rangeEnd.getTime() + 24 * 60 * 60 * 1000) }),
      };
    }

    // Totals for everything that matches the filters (not just the current page)
    const totals = await prisma.sale.aggregate({
      where,
      _count: { _all: true },
      _sum: { subtotal: true, discount: true, tax: true, grandTotal: true },
    });
    const summary = {
      count: totals._count._all,
      subtotal: totals._sum.subtotal || 0,
      discount: totals._sum.discount || 0,
      tax: totals._sum.tax || 0,
      grandTotal: totals._sum.grandTotal || 0,
    };

    if (isAll) {
      const sales = await prisma.sale.findMany({
        where,
        include: {
          customer: true,
          saleItems: {
            include: {
              product: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      return {
        sales,
        pagination: { ...formatPaginationMeta(sales.length, 1, sales.length || 1), summary },
      };
    }

    const [total, sales] = await Promise.all([

      prisma.sale.count({ where }),
      prisma.sale.findMany({
        where,
        include: {
          customer: true,
          saleItems: {
            include: {
              product: true,
            },
          },
        },
        skip,
        take,
        orderBy: {
          createdAt: "desc",
        },
      }),
    ]);

    return {
      sales,
      pagination: { ...formatPaginationMeta(total, page, limit), summary },
    };
  } catch (error) {
    console.log("GET SALES ERROR:", error);
    throw error;
  }
};

/*
|--------------------------------------------------------------------------
| GET SINGLE SALE
|--------------------------------------------------------------------------
*/

const getSaleById = async (id) => {
  const sale = await prisma.sale.findUnique({
    where: { id },
    include: {
      customer: true,
      saleItems: {
        include: {
          product: true,
        },
      },
    },
  });

  if (!sale) {
    throw new Error("Sale not found");
  }

  return sale;
};

/*
|--------------------------------------------------------------------------
| DELETE SALE
|--------------------------------------------------------------------------
*/

const deleteSale = async (id, userId) => {
  return await prisma.$transaction(async (tx) => {
    // Read inside the transaction so a double-click / concurrent delete
    // cannot revert stock twice or fail on a record that is already gone.
    const sale = await tx.sale.findUnique({
      where: { id },
      include: {
        saleItems: true,
        customer: true,
      },
    });

    if (!sale) {
      throw new Error("Sale not found");
    }

    let effectiveUserId = userId;
    if (!effectiveUserId) {
      const defaultUser = await tx.user.findFirst();
      effectiveUserId = defaultUser?.id;
    }

    if (!effectiveUserId) {
      throw new Error("No active user found to perform stock reversion");
    }

    // 1. REVERT STOCK FOR EACH ITEM
    for (const item of sale.saleItems) {
      const product = await tx.product.findUnique({
        where: { id: item.productId },
      });

      const prevStock = product ? product.stockQuantity : 0;
      const newStock = prevStock + item.quantity;

      await tx.product.update({
        where: { id: item.productId },
        data: {
          stockQuantity: newStock,
        },
      });

      await tx.inventoryTransaction.create({
        data: {
          transactionType: "ADJUSTMENT",
          quantity: item.quantity,
          previousStock: prevStock,
          newStock: newStock,
          notes: `Reversion from deleted sale ${sale.invoiceNumber}`,
          productId: item.productId,
          performedById: effectiveUserId,
        },
      });
    }

    // 2. REVERT CUSTOMER TOTALS
    if (sale.customerId && sale.customer) {
      await tx.customer.update({
        where: { id: sale.customerId },
        data: {
          totalOrders: Math.max(0, sale.customer.totalOrders - 1),
          totalSpent: Math.max(0, sale.customer.totalSpent - sale.grandTotal),
        },
      });
    }

    // 3. DELETE SALE ITEMS FIRST
    await tx.saleItem.deleteMany({
      where: { saleId: id },
    });

    // 4. DELETE SALE
    const { count } = await tx.sale.deleteMany({
      where: { id },
    });

    if (count === 0) {
      throw new Error("Sale not found");
    }

    return sale;
  });
};

/*
|--------------------------------------------------------------------------
| UPDATE CONFIRMED SALE (ITEMS / QUANTITIES / DISCOUNT / TAX)
| Stock is deducted when a sale is confirmed, so only the per-product
| difference is applied back to stock, with an audit trail entry for each.
|--------------------------------------------------------------------------
*/

const updateSaleWithItems = async (id, payload, userId) => {
  const rawItems = payload.items;

  if (rawItems.length === 0) {
    throw new Error("A sale must contain at least one item. Delete the sale instead.");
  }

  // Merge duplicate products & validate input
  const requested = new Map();
  for (const raw of rawItems) {
    const quantity = parseInt(raw.quantity, 10);
    const unitPrice = Number(raw.unitPrice);

    if (!raw.productId || !Number.isFinite(quantity) || quantity < 1) {
      throw new Error("Invalid item quantity");
    }
    if (!Number.isFinite(unitPrice) || unitPrice < 0) {
      throw new Error("Invalid item price");
    }

    const existing = requested.get(raw.productId);
    if (existing) {
      existing.quantity += quantity;
    } else {
      requested.set(raw.productId, { productId: raw.productId, quantity, unitPrice });
    }
  }

  return await prisma.$transaction(async (tx) => {
    const sale = await tx.sale.findUnique({
      where: { id },
      include: { saleItems: true, customer: true },
    });

    if (!sale) {
      throw new Error("Sale not found");
    }

    let effectiveUserId = userId;
    if (!effectiveUserId) {
      const defaultUser = await tx.user.findFirst();
      effectiveUserId = defaultUser?.id;
    }
    if (!effectiveUserId) {
      throw new Error("No active user found to perform sale update");
    }

    const oldQty = new Map();
    for (const it of sale.saleItems) {
      oldQty.set(it.productId, (oldQty.get(it.productId) || 0) + it.quantity);
    }

    const productIds = new Set([...oldQty.keys(), ...requested.keys()]);

    // Apply stock difference per product
    for (const productId of productIds) {
      const before = oldQty.get(productId) || 0;
      const after = requested.get(productId)?.quantity || 0;
      const delta = after - before; // > 0 : customer wants more, < 0 : returned to stock

      if (delta === 0) continue;

      const product = await tx.product.findUnique({ where: { id: productId } });
      if (!product) {
        throw new Error("Product not found");
      }

      const prevStock = product.stockQuantity;
      const newStock = prevStock - delta;

      if (newStock < 0) {
        throw new Error(
          `${product.productName} is out of stock (available: ${prevStock}, extra needed: ${delta})`
        );
      }

      await tx.product.update({
        where: { id: productId },
        data: { stockQuantity: newStock },
      });

      await tx.inventoryTransaction.create({
        data: {
          transactionType: delta > 0 ? "STOCK_OUT" : "ADJUSTMENT",
          quantity: Math.abs(delta),
          previousStock: prevStock,
          newStock,
          referenceNumber: sale.invoiceNumber,
          notes: `Sale ${sale.invoiceNumber} edited: quantity ${before} -> ${after}`,
          productId,
          performedById: effectiveUserId,
          customerId: sale.customerId,
        },
      });
    }

    // Replace sale lines & recompute totals on the server
    await tx.saleItem.deleteMany({ where: { saleId: id } });

    let subtotal = 0;
    for (const item of requested.values()) {
      const total = Number((item.quantity * item.unitPrice).toFixed(2));
      subtotal += total;
      await tx.saleItem.create({
        data: {
          saleId: id,
          productId: item.productId,
          quantity: item.quantity,
          price: item.unitPrice,
          total,
        },
      });
    }
    subtotal = Number(subtotal.toFixed(2));

    const discount =
      payload.discount !== undefined ? Math.max(0, Number(payload.discount) || 0) : sale.discount;
    const tax =
      payload.tax !== undefined
        ? Math.max(0, Number(payload.tax) || 0)
        : Number((Math.max(0, subtotal - discount) * 0.25).toFixed(2));
    const grandTotal = Number(Math.max(0, subtotal - discount + tax).toFixed(2));

    const updated = await tx.sale.update({
      where: { id },
      data: {
        subtotal,
        discount,
        tax,
        grandTotal,
        ...(payload.notes !== undefined && {
          notes: String(payload.notes || "").trim() || null,
        }),
        ...(payload.paymentMethod && { paymentMethod: payload.paymentMethod }),
      },
      include: {
        customer: true,
        saleItems: { include: { product: true } },
      },
    });

    // Keep customer lifetime spend in sync with the new total
    if (sale.customerId && sale.customer) {
      await tx.customer.update({
        where: { id: sale.customerId },
        data: {
          totalSpent: Math.max(0, sale.customer.totalSpent - sale.grandTotal + grandTotal),
        },
      });
    }

    try {
      await tx.auditLog.create({
        data: {
          action: "SALE_EDITED",
          entity: "Sale",
          entityId: id,
          performedBy: effectiveUserId,
          details: `Edited sale ${sale.invoiceNumber}: total ${sale.grandTotal} -> ${grandTotal}`,
        },
      });
    } catch (auditErr) {
      console.warn("Audit log creation skipped:", auditErr.message);
    }

    return updated;
  });
};

/*
|--------------------------------------------------------------------------
| UPDATE SALE (BASIC)
|--------------------------------------------------------------------------
*/

const updateSale = async (id, payload, userId) => {
  const sale = await prisma.sale.findUnique({
    where: { id },
  });

  if (!sale) {
    throw new Error("Sale not found");
  }

  // Confirmed sale edited for items/amounts -> reconcile stock, totals & customer stats
  if (Array.isArray(payload.items)) {
    return await updateSaleWithItems(id, payload, userId);
  }

  return await prisma.sale.update({
    where: { id },
    data: {
      ...(payload.notes !== undefined && {
        notes: String(payload.notes || "").trim() || null,
      }),
      ...(payload.paymentMethod && { paymentMethod: payload.paymentMethod }),
    },
  });
};

module.exports = {
  createSale,
  getSales,
  getSaleById,
  deleteSale,
  updateSale,
};

