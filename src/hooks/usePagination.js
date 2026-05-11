import { useState, useMemo, useCallback } from "react";

export default function usePagination(data, pageSize = 10) {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(data.length / pageSize);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return data.slice(start, start + pageSize);
  }, [data, currentPage, pageSize]);

  const goToPage = useCallback(
    (page) => {
      if (page >= 1 && page <= Math.ceil(data.length / pageSize)) {
        setCurrentPage(page);
      }
    },
    [data.length, pageSize],
  );

  const reset = useCallback(() => setCurrentPage(1), []);

  return {
    paginatedData,
    currentPage,
    totalPages,
    totalItems: data.length,
    pageSize,
    goToPage,
    nextPage: () => goToPage(currentPage + 1),
    prevPage: () => goToPage(currentPage - 1),
    reset,
    hasNext: currentPage < totalPages,
    hasPrev: currentPage > 1,
  };
}
