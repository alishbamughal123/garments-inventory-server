const { Prisma } = require("@prisma/client");
const prisma = require("../../config/db");

const LEAD_STATUS_ORDER = [
  "NEW", "CONTACTED", "QUALIFIED", "PROPOSAL_SENT", "NEGOTIATION", "WON", "LOST"
];

const LEAD_SOURCE_ORDER = [
  "WEBSITE", "FACEBOOK", "INSTAGRAM", "WHATSAPP", "REFERRAL", "WALK_IN", "TRADE_SHOW", "EXISTING_CUSTOMER", "OTHER"
];

const CUSTOMER_TYPE_ORDER = [
  "REGULAR", "WHOLESALE", "VIP"
];

const toNumber = (value) => (value == null ? 0 : Number(value));
const roundToTwo = (value) => Number(toNumber(value).toFixed(2));

const normalizeStartDate = (value) => {
  if (!value) return undefined;
  const date = new Date(value);
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    date.setUTCHours(0, 0, 0, 0);
  }
  return date;
};

const normalizeEndDate = (value) => {
  if (!value) return undefined;
  const date = new Date(value);
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    date.setUTCHours(23, 59, 59, 999);
  }
  return date;
};

const buildCreatedAtFilter = (from, to) => {
  const createdAt = {};
  const normalizedFrom = normalizeStartDate(from);
  const normalizedTo = normalizeEndDate(to);

  if (normalizedFrom) createdAt.gte = normalizedFrom;
  if (normalizedTo) createdAt.lte = normalizedTo;

  return Object.keys(createdAt).length > 0 ? createdAt : undefined;
};

const buildLeadWhere = (query = {}) => {
  const where = {};
  const createdAt = buildCreatedAtFilter(query.from, query.to);
  if (createdAt) where.createdAt = createdAt;
  if (query.leadSource) where.source = query.leadSource;
  if (query.leadStatus) where.status = query.leadStatus;
  return where;
};

const buildCustomerWhere = (query = {}) => {
  const where = {};
  const createdAt = buildCreatedAtFilter(query.from, query.to);
  if (createdAt) where.createdAt = createdAt;
  if (query.customerType) where.customerType = query.customerType;
  return where;
};

const buildSaleWhere = (query = {}) => {
  const where = {};
  const createdAt = buildCreatedAtFilter(query.from, query.to);
  if (createdAt) where.createdAt = createdAt;
  if (query.customerType) {
    where.customer = { customerType: query.customerType };
  }
  return where;
};

const getCrmOverview = async (query = {}) => {
  const leadWhere = buildLeadWhere(query);
  const customerWhere = buildCustomerWhere(query);
  const saleWhere = buildSaleWhere(query);

  const [
    totalCustomers,
    totalLeads,
    newLeads,
    wonLeads,
    lostLeads,
    expectedRevenueAggregate,
    closedRevenueAggregate,
  ] = await Promise.all([
    prisma.customer.count({ where: customerWhere }),
    prisma.lead.count({ where: leadWhere }),
    prisma.lead.count({ where: { ...leadWhere, status: "NEW" } }),
    prisma.lead.count({ where: { ...leadWhere, status: "WON" } }),
    prisma.lead.count({ where: { ...leadWhere, status: "LOST" } }),
    prisma.lead.aggregate({
      where: { ...leadWhere, status: { not: "LOST" } },
      _sum: { expectedDealValue: true }
    }),
    prisma.sale.aggregate({
      where: saleWhere,
      _sum: { grandTotal: true }
    })
  ]);

  const conversionRate = totalLeads > 0 ? roundToTwo((wonLeads / totalLeads) * 100) : 0;

  return {
    totalCustomers,
    totalLeads,
    newLeads,
    wonLeads,
    lostLeads,
    conversionRate,
    expectedRevenue: roundToTwo(expectedRevenueAggregate._sum.expectedDealValue),
    revenueGenerated: roundToTwo(closedRevenueAggregate._sum.grandTotal)
  };
};

/*
|--------------------------------------------------------------------------
| TASK 4: COMPREHENSIVE SYSTEM REPORTING MODULE
|--------------------------------------------------------------------------
*/

// 1. Inventory Report
const getInventoryReport = async (query = {}) => {
  const { categoryId, search } = query;
  const where = {
    isActive: true,
    ...(categoryId ? { categoryId } : {}),
    ...(search ? {
      OR: [
        { productName: { contains: search, mode: "insensitive" } },
        { sku: { contains: search, mode: "insensitive" } },
        { styleNumber: { contains: search, mode: "insensitive" } }
      ]
    } : {})
  };

  const products = await prisma.product.findMany({
    where,
    include: { category: true },
    orderBy: { productName: "asc" }
  });

  let totalItems = 0;
  let totalInventoryValue = 0;
  let lowStockCount = 0;

  const items = products.map(p => {
    const stock = p.stockQuantity;
    const purchaseVal = Number(p.purchasePrice) * stock;
    const saleVal = Number(p.salePrice) * stock;
    const isLowStock = stock <= p.minStockAlert;

    totalItems += stock;
    totalInventoryValue += purchaseVal;
    if (isLowStock) lowStockCount++;

    return {
      id: p.id,
      sku: p.sku,
      styleNumber: p.styleNumber,
      productName: p.productName,
      category: p.category.name,
      color: p.color,
      size: p.size,
      weightInKg: p.weightInKg || 0,
      stockQuantity: stock,
      minStockAlert: p.minStockAlert,
      purchasePrice: Number(p.purchasePrice),
      salePrice: Number(p.salePrice),
      totalPurchaseValue: roundToTwo(purchaseVal),
      totalSaleValue: roundToTwo(saleVal),
      isLowStock
    };
  });

  return {
    summary: {
      totalProducts: products.length,
      totalStockUnits: totalItems,
      totalInventoryCostValue: roundToTwo(totalInventoryValue),
      lowStockAlerts: lowStockCount
    },
    items
  };
};

// 2. Stock In Report
const getStockInReport = async (query = {}) => {
  const createdAt = buildCreatedAtFilter(query.from, query.to);
  const transactions = await prisma.inventoryTransaction.findMany({
    where: {
      transactionType: "STOCK_IN",
      ...(createdAt ? { createdAt } : {})
    },
    include: {
      product: { include: { category: true } },
      performedBy: { select: { name: true, email: true } }
    },
    orderBy: { createdAt: "desc" }
  });

  const totalQuantity = transactions.reduce((acc, t) => acc + t.quantity, 0);

  return {
    summary: {
      totalTransactions: transactions.length,
      totalQuantityIn: totalQuantity
    },
    items: transactions.map(t => ({
      id: t.id,
      date: t.createdAt,
      sku: t.product.sku,
      productName: t.product.productName,
      category: t.product.category.name,
      quantity: t.quantity,
      previousStock: t.previousStock,
      newStock: t.newStock,
      notes: t.notes,
      performedBy: t.performedBy?.name || "System"
    }))
  };
};

// 3. Stock Out Report (Includes Customer & Parcel Weight)
const getStockOutReport = async (query = {}) => {
  const createdAt = buildCreatedAtFilter(query.from, query.to);
  const transactions = await prisma.inventoryTransaction.findMany({
    where: {
      transactionType: "STOCK_OUT",
      ...(query.customerId ? { customerId: query.customerId } : {}),
      ...(createdAt ? { createdAt } : {})
    },
    include: {
      product: { include: { category: true } },
      customer: true,
      performedBy: { select: { name: true, email: true } },
      deliveryNote: true
    },
    orderBy: { createdAt: "desc" }
  });

  let totalQtyOut = 0;
  let totalParcelWeightKg = 0;

  const items = transactions.map(t => {
    totalQtyOut += t.quantity;
    const weight = t.totalWeightKg || 0;
    totalParcelWeightKg += weight;

    return {
      id: t.id,
      date: t.createdAt,
      deliveryNoteNumber: t.deliveryNote?.deliveryNoteNumber || "N/A",
      customerName: t.customer?.fullName || t.customer?.companyName || "Direct Stock Out",
      companyName: t.customer?.companyName || "N/A",
      sku: t.product.sku,
      productName: t.product.productName,
      quantity: t.quantity,
      previousStock: t.previousStock,
      newStock: t.newStock,
      packagingWeightKg: t.packagingWeightKg || 0.2,
      totalWeightKg: roundToTwo(weight),
      performedBy: t.performedBy?.name || "System"
    };
  });

  return {
    summary: {
      totalTransactions: transactions.length,
      totalQuantityOut: totalQtyOut,
      totalParcelWeightKg: roundToTwo(totalParcelWeightKg)
    },
    items
  };
};

// 4. Customer Orders Report
const getCustomerOrdersReport = async (query = {}) => {
  const createdAt = buildCreatedAtFilter(query.from, query.to);
  const orders = await prisma.customerOrder.findMany({
    where: {
      ...(query.status ? { status: query.status } : {}),
      ...(query.customerId ? { customerId: query.customerId } : {}),
      ...(createdAt ? { createdAt } : {})
    },
    include: {
      customer: true,
      orderItems: { include: { product: true } },
      deliveryNote: true
    },
    orderBy: { createdAt: "desc" }
  });

  let grandTotalSum = 0;
  let totalWeightSum = 0;

  const items = orders.map(o => {
    const amount = Number(o.totalAmount);
    grandTotalSum += amount;
    totalWeightSum += o.totalParcelWeight;

    return {
      id: o.id,
      orderNumber: o.orderNumber,
      date: o.createdAt,
      customerName: o.customer.fullName,
      companyName: o.customer.companyName || "N/A",
      status: o.status,
      totalItems: o.orderItems.reduce((acc, i) => acc + i.quantity, 0),
      subtotal: Number(o.subtotal),
      tax: Number(o.tax),
      totalAmount: amount,
      garmentWeightKg: o.garmentWeightKg,
      packagingWeightKg: o.packagingWeightKg,
      totalParcelWeight: o.totalParcelWeight,
      deliveryNoteNumber: o.deliveryNote?.deliveryNoteNumber || "N/A"
    };
  });

  return {
    summary: {
      totalOrders: orders.length,
      totalRevenue: roundToTwo(grandTotalSum),
      totalParcelWeightKg: roundToTwo(totalWeightSum)
    },
    items
  };
};

// 5. Product Movement Report
const getProductMovementReport = async (query = {}) => {
  const createdAt = buildCreatedAtFilter(query.from, query.to);
  const products = await prisma.product.findMany({
    where: { isActive: true },
    include: {
      category: true,
      transactions: {
        where: createdAt ? { createdAt } : {}
      }
    }
  });

  const items = products.map(p => {
    let stockInQty = 0;
    let stockOutQty = 0;

    p.transactions.forEach(t => {
      if (t.transactionType === "STOCK_IN") stockInQty += t.quantity;
      if (t.transactionType === "STOCK_OUT") stockOutQty += t.quantity;
    });

    return {
      id: p.id,
      sku: p.sku,
      styleNumber: p.styleNumber,
      productName: p.productName,
      category: p.category.name,
      currentStock: p.stockQuantity,
      stockInQuantity: stockInQty,
      stockOutQuantity: stockOutQty,
      netMovement: stockInQty - stockOutQty
    };
  });

  return {
    summary: {
      totalProductsTracked: products.length
    },
    items
  };
};

// 6. Low Stock Report
const getLowStockReport = async () => {
  const products = await prisma.product.findMany({
    where: { isActive: true },
    include: { category: true }
  });

  const lowStockItems = products
    .filter(p => p.stockQuantity <= p.minStockAlert)
    .map(p => ({
      id: p.id,
      sku: p.sku,
      styleNumber: p.styleNumber,
      productName: p.productName,
      category: p.category.name,
      stockQuantity: p.stockQuantity,
      minStockAlert: p.minStockAlert,
      reorderNeeded: Math.max(0, p.minStockAlert * 2 - p.stockQuantity)
    }));

  return {
    summary: {
      totalLowStockProducts: lowStockItems.length
    },
    items: lowStockItems
  };
};

// 7. Customer Purchase Report
const getCustomerPurchaseReport = async (query = {}) => {
  const createdAt = buildCreatedAtFilter(query.from, query.to);
  const customers = await prisma.customer.findMany({
    include: {
      customerOrders: {
        where: createdAt ? { createdAt } : {}
      },
      stockOuts: {
        where: createdAt ? { createdAt } : {}
      }
    }
  });

  const items = customers.map(c => {
    const totalOrderSpend = c.customerOrders.reduce((sum, o) => sum + Number(o.totalAmount), 0);
    const totalShipments = c.stockOuts.length;

    return {
      id: c.id,
      customerCode: c.customerCode || "N/A",
      fullName: c.fullName,
      companyName: c.companyName || "N/A",
      customerType: c.customerType,
      email: c.email,
      phone: c.phoneNumber,
      totalOrdersCount: c.customerOrders.length,
      totalOrderSpend: roundToTwo(totalOrderSpend),
      totalShipmentsReceived: totalShipments
    };
  }).sort((a, b) => b.totalOrderSpend - a.totalOrderSpend);

  return {
    summary: {
      totalCustomersAnalyzed: customers.length
    },
    items
  };
};

// 8. Open Orders Report
const getOpenOrdersReport = async () => {
  const openOrders = await prisma.customerOrder.findMany({
    where: {
      status: { in: ["PENDING", "APPROVED", "PROCESSING"] }
    },
    include: {
      customer: true,
      orderItems: { include: { product: true } }
    },
    orderBy: { createdAt: "asc" }
  });

  const items = openOrders.map(o => ({
    id: o.id,
    orderNumber: o.orderNumber,
    date: o.createdAt,
    customerName: o.customer.fullName,
    companyName: o.customer.companyName || "N/A",
    phone: o.customer.phoneNumber,
    status: o.status,
    totalItems: o.orderItems.reduce((sum, i) => sum + i.quantity, 0),
    totalAmount: Number(o.totalAmount),
    totalParcelWeight: o.totalParcelWeight
  }));

  return {
    summary: {
      openOrdersCount: openOrders.length,
      openOrdersTotalValue: roundToTwo(items.reduce((acc, i) => acc + i.totalAmount, 0))
    },
    items
  };
};

module.exports = {
  getCrmOverview,
  getInventoryReport,
  getStockInReport,
  getStockOutReport,
  getCustomerOrdersReport,
  getProductMovementReport,
  getLowStockReport,
  getCustomerPurchaseReport,
  getOpenOrdersReport
};
