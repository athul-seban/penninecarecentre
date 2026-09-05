import { SelectQueryBuilder } from 'typeorm';

export interface PaginationResult {
  page: number;
  pageSize: number;
  skip: number;
}

/** Clamps page/pageSize to sane bounds and derives the SQL offset. */
export function parsePagination(
  page?: number,
  pageSize?: number,
  defaultPageSize = 20,
  maxPageSize = 100,
): PaginationResult {
  const parsedPage = Math.max(1, Math.trunc(Number(page)) || 1);
  const parsedSize = Math.min(maxPageSize, Math.max(1, Math.trunc(Number(pageSize)) || defaultPageSize));
  return { page: parsedPage, pageSize: parsedSize, skip: (parsedPage - 1) * parsedSize };
}

/** Adds an inclusive `column BETWEEN from AND to` filter, treating `to` as end-of-day. */
export function applyDateRange<T extends object>(
  qb: SelectQueryBuilder<T>,
  column: string,
  from?: string,
  to?: string,
): void {
  if (from) {
    const fromDate = new Date(from);
    if (!isNaN(fromDate.getTime())) qb.andWhere(`${column} >= :dateFrom`, { dateFrom: fromDate });
  }
  if (to) {
    const toDate = new Date(to);
    if (!isNaN(toDate.getTime())) {
      toDate.setHours(23, 59, 59, 999);
      qb.andWhere(`${column} <= :dateTo`, { dateTo: toDate });
    }
  }
}
