'use client';

import { Search } from 'lucide-react';
import { useMemo, useState } from 'react';

export function useSearchPagination<T>(
  rows: T[],
  matches: (row: T, search: string) => boolean,
  pageSize = 8
) {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const normalizedSearch = search.trim().toLowerCase();
  const filteredRows = useMemo(
    () => rows.filter((row) => matches(row, normalizedSearch)),
    [rows, matches, normalizedSearch]
  );
  const totalPages = Math.max(1, Math.ceil(filteredRows.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * pageSize;
  const pagedRows = filteredRows.slice(start, start + pageSize);

  function updateSearch(value: string) {
    setSearch(value);
    setPage(1);
  }

  return {
    search,
    setSearch: updateSearch,
    page: currentPage,
    setPage,
    totalPages,
    totalRows: filteredRows.length,
    pagedRows
  };
}

export function TableSearch({
  value,
  onChange,
  placeholder
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <label className="relative block w-full sm:max-w-xs">
      <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
      <input
        className="h-10 w-full rounded-lg border border-line bg-white pl-9 pr-3 text-sm outline-none focus:border-teal"
        placeholder={placeholder}
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

export function TablePagination({
  page,
  totalPages,
  totalRows,
  onPageChange
}: {
  page: number;
  totalPages: number;
  totalRows: number;
  onPageChange: (page: number) => void;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-5 py-3 text-sm text-slate-500">
      <span>{totalRows} result{totalRows === 1 ? '' : 's'}</span>
      <div className="flex items-center gap-2">
        <button
          className="h-9 rounded-lg border border-line px-3 font-semibold text-ink disabled:cursor-not-allowed disabled:opacity-40"
          disabled={page <= 1}
          type="button"
          onClick={() => onPageChange(page - 1)}
        >
          Previous
        </button>
        <span className="min-w-16 text-center font-medium text-ink">Page {page} of {totalPages}</span>
        <button
          className="h-9 rounded-lg border border-line px-3 font-semibold text-ink disabled:cursor-not-allowed disabled:opacity-40"
          disabled={page >= totalPages}
          type="button"
          onClick={() => onPageChange(page + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
}
