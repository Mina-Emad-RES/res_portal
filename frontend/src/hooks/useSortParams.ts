import { useCallback } from "react";
import { useSearchParams } from "react-router-dom";

export type SortDir = "asc" | "desc";

export type UseSortParamsOptions = {
  /** Query-param name for the active column key. Default: "sort". */
  keyParam?: string;
  /** Query-param name for the direction. Default: "dir". */
  dirParam?: string;
  /** Direction applied when a *new* column is selected. Default: "asc". */
  initialDir?: SortDir;
};

export type UseSortParamsResult = {
  sortKey: string;
  sortDir: SortDir;
  /** Toggle direction if `key` is already active, otherwise select it fresh. */
  toggleSort: (key: string) => void;
  clearSort: () => void;
};

export function useSortParams(
  options: UseSortParamsOptions = {},
): UseSortParamsResult {
  const { keyParam = "sort", dirParam = "dir", initialDir = "asc" } = options;
  const [searchParams, setSearchParams] = useSearchParams();

  const sortKey = searchParams.get(keyParam) ?? "";
  const sortDir = (searchParams.get(dirParam) as SortDir) || "asc";

  const toggleSort = useCallback(
    (key: string) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          const currentKey = next.get(keyParam) ?? "";
          const currentDir = (next.get(dirParam) as SortDir) || initialDir;

          if (currentKey === key) {
            // Same column clicked again -> reverse direction.
            next.set(dirParam, currentDir === "asc" ? "desc" : "asc");
          } else {
            // New column -> select it with the initial direction.
            next.set(keyParam, key);
            next.set(dirParam, initialDir);
          }
          return next;
        },
        { replace: true },
      );
    },
    [setSearchParams, keyParam, dirParam, initialDir],
  );

  const clearSort = useCallback(() => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.delete(keyParam);
        next.delete(dirParam);
        return next;
      },
      { replace: true },
    );
  }, [setSearchParams, keyParam, dirParam]);

  return { sortKey, sortDir, toggleSort, clearSort };
}
