/**
 * Pagination Helper for Express + Prisma
 */

const getPaginationParams = (query = {}, defaultLimit = 25, maxLimit = 200) => {
  const isAll =
    query.all === true ||
    query.all === "true" ||
    query.limit === "all" ||
    query.limit === "ALL";

  if (isAll) {
    return {
      page: 1,
      limit: null,
      skip: undefined,
      take: undefined,
      isAll: true,
    };
  }

  let page = parseInt(query.page, 10);
  let limit = parseInt(query.limit, 10);

  if (isNaN(page) || page < 1) page = 1;
  if (isNaN(limit) || limit < 1) limit = defaultLimit;
  if (limit > maxLimit) limit = maxLimit;

  const skip = (page - 1) * limit;

  return {
    page,
    limit,
    skip,
    take: limit,
    isAll: false,
  };
};

const formatPaginationMeta = (total = 0, page = 1, limit = 25) => {
  const safeLimit = limit && limit > 0 ? limit : (total || 1);
  const totalPages = Math.max(1, Math.ceil(total / safeLimit));
  const safePage = Math.min(Math.max(1, page), totalPages);

  return {
    total,
    page: safePage,
    limit: safeLimit,
    totalPages,
    hasNextPage: safePage < totalPages,
    hasPrevPage: safePage > 1,
  };
};

module.exports = {
  getPaginationParams,
  formatPaginationMeta,
};
