import { useState, useCallback } from 'react';

interface UsePaginationProps {
  initialPage?: number;
  initialHasMore?: boolean;
}

export function usePagination({ 
  initialPage = 1, 
  initialHasMore = true 
}: UsePaginationProps = {}) {
  const [page, setPage] = useState(initialPage);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [isLoading, setIsLoading] = useState(false);

  const reset = useCallback(() => {
    setPage(initialPage);
    setHasMore(initialHasMore);
    setIsLoading(false);
  }, [initialPage, initialHasMore]);

  const nextPage = useCallback(() => {
    if (!isLoading && hasMore) {
      setPage(prev => prev + 1);
    }
  }, [isLoading, hasMore]);

  return {
    page,
    hasMore,
    isLoading,
    setHasMore,
    setIsLoading,
    nextPage,
    reset
  };
}

