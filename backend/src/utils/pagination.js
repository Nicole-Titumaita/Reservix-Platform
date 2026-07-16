const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

function parsePagination(query = {}) {
  const page = Number.parseInt(query.page, 10);
  const limit = Number.parseInt(query.limit, 10);

  if (!Number.isFinite(page) || !Number.isFinite(limit)) {
    return null;
  }

  const safePage = Math.max(page, 1);
  const safeLimit = Math.min(Math.max(limit, 1), MAX_LIMIT);

  return {
    page: safePage,
    limit: safeLimit,
    offset: (safePage - 1) * safeLimit
  };
}

function buildPaginatedResult(items, total, pagination) {
  return {
    items,
    pagination: {
      page: pagination.page,
      limit: pagination.limit,
      total,
      total_pages: Math.ceil(total / pagination.limit)
    }
  };
}

module.exports = {
  DEFAULT_LIMIT,
  MAX_LIMIT,
  parsePagination,
  buildPaginatedResult
};
