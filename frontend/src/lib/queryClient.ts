import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Data is considered "fresh" for 5 minutes — within that window,
      // navigating back to a screen uses the cache without refetching.
      staleTime: 5 * 60 * 1000,

      // After data goes stale, cache is still kept for 10 minutes
      // before garbage collection — so brief navigation away/back
      // shows cached data instantly, then refetches in the background.
      gcTime: 10 * 60 * 1000,

      // We have a global axios interceptor that emits logout on 401/403,
      // so retrying those is pointless. One retry on other errors is enough.
      retry: 1,

      // Personal preference — disable to avoid surprise refetches when
      // users tab back. Re-enable per-query with `refetchOnWindowFocus: true`
      // for things that genuinely need to stay live.
      refetchOnWindowFocus: false,
    },
  },
});
