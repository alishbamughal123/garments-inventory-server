const { Prisma } = require("@prisma/client");
const prisma = require("../../config/db");

const LEAD_STATUS_ORDER = [
  "NEW",
  "CONTACTED",
  "QUALIFIED",
  "PROPOSAL_SENT",
  "NEGOTIATION",
  "WON",
  "LOST",
];

const LEAD_SOURCE_ORDER = [
  "WEBSITE",
  "FACEBOOK",
  "INSTAGRAM",
  "WHATSAPP",
  "REFERRAL",
  "WALK_IN",
  "TRADE_SHOW",
  "EXISTING_CUSTOMER",
  "OTHER",
];

const CUSTOMER_TYPE_ORDER = [
  "REGULAR",
  "WHOLESALE",
  "VIP",
];

const toNumber = (value) =>
  value == null ? 0 : Number(value);

const roundToTwo = (value) =>
  Number(toNumber(value).toFixed(2));

const normalizeStartDate = (value) => {
  if (!value) {
    return undefined;
  }

  const date = new Date(value);

  if (
    typeof value === "string" &&
    /^\d{4}-\d{2}-\d{2}$/.test(value)
  ) {
    date.setUTCHours(0, 0, 0, 0);
  }

  return date;
};

const normalizeEndDate = (value) => {
  if (!value) {
    return undefined;
  }

  const date = new Date(value);

  if (
    typeof value === "string" &&
    /^\d{4}-\d{2}-\d{2}$/.test(value)
  ) {
    date.setUTCHours(23, 59, 59, 999);
  }

  return date;
};

const buildCreatedAtFilter = (
  from,
  to
) => {
  const createdAt = {};

  const normalizedFrom =
    normalizeStartDate(from);
  const normalizedTo =
    normalizeEndDate(to);

  if (normalizedFrom) {
    createdAt.gte = normalizedFrom;
  }

  if (normalizedTo) {
    createdAt.lte = normalizedTo;
  }

  return Object.keys(createdAt).length > 0
    ? createdAt
    : undefined;
};

const buildLeadWhere = (query = {}) => {
  const where = {};
  const createdAt = buildCreatedAtFilter(
    query.from,
    query.to
  );

  if (createdAt) {
    where.createdAt = createdAt;
  }

  if (query.leadSource) {
    where.source = query.leadSource;
  }

  if (query.leadStatus) {
    where.status = query.leadStatus;
  }

  return where;
};

const buildCustomerWhere = (
  query = {}
) => {
  const where = {};
  const createdAt = buildCreatedAtFilter(
    query.from,
    query.to
  );

  if (createdAt) {
    where.createdAt = createdAt;
  }

  if (query.customerType) {
    where.customerType =
      query.customerType;
  }

  return where;
};

const buildSaleWhere = (query = {}) => {
  const where = {};
  const createdAt = buildCreatedAtFilter(
    query.from,
    query.to
  );

  if (createdAt) {
    where.createdAt = createdAt;
  }

  if (query.customerType) {
    where.customer = {
      customerType:
        query.customerType,
    };
  }

  return where;
};

const buildDateSqlFilter = (
  columnName,
  from,
  to
) => {
  const conditions = [];
  const normalizedFrom =
    normalizeStartDate(from);
  const normalizedTo =
    normalizeEndDate(to);

  if (normalizedFrom) {
    conditions.push(
      Prisma.sql`${Prisma.raw(
        columnName
      )} >= ${normalizedFrom}`
    );
  }

  if (normalizedTo) {
    conditions.push(
      Prisma.sql`${Prisma.raw(
        columnName
      )} <= ${normalizedTo}`
    );
  }

  if (!conditions.length) {
    return Prisma.sql``;
  }

  return Prisma.sql`WHERE ${Prisma.join(
    conditions,
    Prisma.sql` AND `
  )}`;
};

const formatMonthRows = (
  rows,
  valueKey
) =>
  rows.map((row) => ({
    month: row.month,
    [valueKey]: roundToTwo(
      row[valueKey]
    ),
  }));

const getMonthlyLeadTrend =
  async (query) => {
    const filter = buildDateSqlFilter(
      "l.\"createdAt\"",
      query.from,
      query.to
    );

    const rows =
      await prisma.$queryRaw(Prisma.sql`
        SELECT
          TO_CHAR(DATE_TRUNC('month', l."createdAt"), 'YYYY-MM') AS month,
          COUNT(*)::int AS count
        FROM "Lead" l
        ${filter}
        GROUP BY DATE_TRUNC('month', l."createdAt")
        ORDER BY DATE_TRUNC('month', l."createdAt") ASC
      `);

    return rows.map((row) => ({
      month: row.month,
      count: Number(row.count),
    }));
  };

const getMonthlyCustomerGrowth =
  async (query) => {
    const filter = buildDateSqlFilter(
      "c.\"createdAt\"",
      query.from,
      query.to
    );

    const rows =
      await prisma.$queryRaw(Prisma.sql`
        SELECT
          TO_CHAR(DATE_TRUNC('month', c."createdAt"), 'YYYY-MM') AS month,
          COUNT(*)::int AS customers
        FROM "customers" c
        ${filter}
        GROUP BY DATE_TRUNC('month', c."createdAt")
        ORDER BY DATE_TRUNC('month', c."createdAt") ASC
      `);

    return rows.map((row) => ({
      month: row.month,
      customers:
        Number(row.customers),
    }));
  };

const getRevenueByMonth =
  async (query) => {
    const filter = buildDateSqlFilter(
      "s.\"createdAt\"",
      query.from,
      query.to
    );

    const rows =
      await prisma.$queryRaw(Prisma.sql`
        SELECT
          TO_CHAR(DATE_TRUNC('month', s."createdAt"), 'YYYY-MM') AS month,
          COALESCE(SUM(s."grandTotal"), 0)::float AS revenue
        FROM "sales" s
        ${filter}
        GROUP BY DATE_TRUNC('month', s."createdAt")
        ORDER BY DATE_TRUNC('month', s."createdAt") ASC
      `);

    return formatMonthRows(
      rows,
      "revenue"
    );
  };

const getCrmOverview =
  async (query = {}) => {
    const leadWhere =
      buildLeadWhere(query);
    const customerWhere =
      buildCustomerWhere(query);
    const saleWhere =
      buildSaleWhere(query);

    const [
      totalCustomers,
      totalLeads,
      newLeads,
      wonLeads,
      lostLeads,
      expectedRevenueAggregate,
      closedRevenueAggregate,
    ] = await Promise.all([
      prisma.customer.count({
        where: customerWhere,
      }),
      prisma.lead.count({
        where: leadWhere,
      }),
      prisma.lead.count({
        where: {
          ...leadWhere,
          status: "NEW",
        },
      }),
      prisma.lead.count({
        where: {
          ...leadWhere,
          status: "WON",
        },
      }),
      prisma.lead.count({
        where: {
          ...leadWhere,
          status: "LOST",
        },
      }),
      prisma.lead.aggregate({
        where: {
          ...leadWhere,
          status: {
            not: "LOST",
          },
        },
        _sum: {
          expectedDealValue: true,
        },
      }),
      prisma.sale.aggregate({
        where: saleWhere,
        _sum: {
          grandTotal: true,
        },
      }),
    ]);

    const conversionRate =
      totalLeads > 0
        ? roundToTwo(
            (wonLeads / totalLeads) * 100
          )
        : 0;

    return {
      totalCustomers,
      totalLeads,
      newLeads,
      wonLeads,
      lostLeads,
      conversionRate,
      expectedRevenue: roundToTwo(
        expectedRevenueAggregate._sum
          .expectedDealValue
      ),
      revenueGenerated: roundToTwo(
        closedRevenueAggregate._sum
          .grandTotal
      ),
    };
  };

const getLeadAnalytics =
  async (query = {}) => {
    const leadWhere =
      buildLeadWhere(query);

    const [
      leadsByStatusRaw,
      leadsBySourceRaw,
      monthlyTrend,
      totalLeads,
    ] = await Promise.all([
      prisma.lead.groupBy({
        by: ["status"],
        where: leadWhere,
        _count: {
          status: true,
        },
      }),
      prisma.lead.groupBy({
        by: ["source"],
        where: leadWhere,
        _count: {
          source: true,
        },
      }),
      getMonthlyLeadTrend(query),
      prisma.lead.count({
        where: leadWhere,
      }),
    ]);

    const statusMap = new Map(
      leadsByStatusRaw.map((item) => [
        item.status,
        item._count.status,
      ])
    );

    const sourceMap = new Map(
      leadsBySourceRaw.map((item) => [
        item.source,
        item._count.source,
      ])
    );

    const leadsByStatus =
      LEAD_STATUS_ORDER.map((status) => ({
        status,
        count:
          statusMap.get(status) || 0,
      }));

    const leadsBySource =
      LEAD_SOURCE_ORDER.map((source) => ({
        source,
        count:
          sourceMap.get(source) || 0,
      }));

    const funnel = [
      "NEW",
      "CONTACTED",
      "QUALIFIED",
      "PROPOSAL_SENT",
      "NEGOTIATION",
      "WON",
    ].map((stage) => ({
      stage,
      count:
        statusMap.get(stage) || 0,
    }));

    return {
      summary: {
        totalLeads,
        wonLeads:
          statusMap.get("WON") || 0,
        lostLeads:
          statusMap.get("LOST") || 0,
      },
      leadsByStatus,
      leadsBySource,
      monthlyLeadCreationTrend:
        monthlyTrend,
      leadConversionFunnel: funnel,
    };
  };

const getCustomerAnalytics =
  async (query = {}) => {
    const customerWhere =
      buildCustomerWhere(query);
    const saleWhere =
      buildSaleWhere(query);
    const limit = query.limit || 5;

    const [
      totalActiveCustomers,
      customerTypesRaw,
      topCustomersRaw,
      monthlyCustomerGrowth,
      revenueAggregate,
    ] = await Promise.all([
      prisma.customer.count({
        where: {
          ...customerWhere,
          status: "ACTIVE",
        },
      }),
      prisma.customer.groupBy({
        by: ["customerType"],
        where: customerWhere,
        _count: {
          customerType: true,
        },
      }),
      prisma.customer.findMany({
        where: {
          ...customerWhere,
          sales: query.from || query.to
            ? {
                some: {
                  createdAt:
                    buildCreatedAtFilter(
                      query.from,
                      query.to
                    ),
                },
              }
            : undefined,
        },
        select: {
          id: true,
          fullName: true,
          companyName: true,
          customerType: true,
          totalSpent: true,
          totalOrders: true,
          sales: {
            where: saleWhere,
            select: {
              grandTotal: true,
            },
          },
        },
      }),
      getMonthlyCustomerGrowth(query),
      prisma.sale.aggregate({
        where: {
          ...saleWhere,
          customerId: {
            not: null,
          },
        },
        _sum: {
          grandTotal: true,
        },
      }),
    ]);

    const customerTypeMap =
      new Map(
        customerTypesRaw.map((item) => [
          item.customerType,
          item._count.customerType,
        ])
      );

    const customersByType =
      CUSTOMER_TYPE_ORDER.map((type) => ({
        type,
        count:
          customerTypeMap.get(type) || 0,
      }));

    const topCustomers =
      topCustomersRaw
        .map((customer) => {
          const revenue =
            customer.sales.reduce(
              (sum, sale) =>
                sum +
                toNumber(
                  sale.grandTotal
                ),
              0
            );

          return {
            id: customer.id,
            fullName:
              customer.fullName,
            companyName:
              customer.companyName,
            customerType:
              customer.customerType,
            totalOrders:
              customer.totalOrders,
            revenue:
              roundToTwo(revenue),
          };
        })
        .sort(
          (a, b) =>
            b.revenue - a.revenue
        )
        .slice(0, limit);

    return {
      summary: {
        totalActiveCustomers,
        totalCustomerRevenue:
          roundToTwo(
            revenueAggregate._sum
              .grandTotal
          ),
      },
      customersByType,
      topCustomersByRevenue:
        topCustomers,
      monthlyCustomerGrowth,
    };
  };

const getRevenueAnalytics =
  async (query = {}) => {
    const leadWhere =
      buildLeadWhere(query);
    const saleWhere =
      buildSaleWhere(query);

    const [
      expectedRevenueAggregate,
      closedRevenueAggregate,
      revenueByMonth,
      customerRevenueRaw,
    ] = await Promise.all([
      prisma.lead.aggregate({
        where: {
          ...leadWhere,
          status: {
            not: "LOST",
          },
        },
        _sum: {
          expectedDealValue: true,
        },
      }),
      prisma.sale.aggregate({
        where: saleWhere,
        _sum: {
          grandTotal: true,
        },
      }),
      getRevenueByMonth(query),
      prisma.sale.findMany({
        where: saleWhere,
        select: {
          grandTotal: true,
          customer: {
            select: {
              customerType: true,
            },
          },
        },
      }),
    ]);

    const revenueBuckets = {
      REGULAR: 0,
      WHOLESALE: 0,
      VIP: 0,
      UNASSIGNED: 0,
    };

    for (const sale of customerRevenueRaw) {
      const bucket =
        sale.customer?.customerType ||
        "UNASSIGNED";

      revenueBuckets[bucket] +=
        toNumber(sale.grandTotal);
    }

    return {
      expectedRevenue: roundToTwo(
        expectedRevenueAggregate._sum
          .expectedDealValue
      ),
      closedRevenue: roundToTwo(
        closedRevenueAggregate._sum
          .grandTotal
      ),
      revenueByMonth,
      revenueByCustomerType:
        Object.entries(
          revenueBuckets
        ).map(([type, revenue]) => ({
          type,
          revenue: roundToTwo(
            revenue
          ),
        })),
    };
  };

const getSalesAnalytics =
  async (query = {}) => {
    const saleWhere =
      buildSaleWhere(query);

    const [
      salesAggregate,
      totalOrders,
      monthlySalesTrend,
    ] = await Promise.all([
      prisma.sale.aggregate({
        where: saleWhere,
        _sum: {
          grandTotal: true,
        },
        _avg: {
          grandTotal: true,
        },
      }),
      prisma.sale.count({
        where: saleWhere,
      }),
      getRevenueByMonth(query),
    ]);

    return {
      totalSales: roundToTwo(
        salesAggregate._sum.grandTotal
      ),
      totalOrders,
      averageOrderValue: roundToTwo(
        salesAggregate._avg.grandTotal
      ),
      monthlySalesTrend:
        monthlySalesTrend.map(
          (item) => ({
            month: item.month,
            sales: item.revenue,
          })
        ),
    };
  };

module.exports = {
  getCrmOverview,
  getLeadAnalytics,
  getCustomerAnalytics,
  getRevenueAnalytics,
  getSalesAnalytics,
};
