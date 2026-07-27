"use client";

import { cn } from "@/lib/utils";
import { ArrowDown, ArrowUp, ChevronsUpDown } from "lucide-react";
import { useMemo, useState, type KeyboardEvent, type ReactNode } from "react";

export interface Column<T> {
  key: keyof T | string;
  header: string;
  render?: (row: T) => ReactNode;
  className?: string;
  headerClassName?: string;
  /** Render this column in mono — CPT codes, IDs, license numbers, amounts. */
  mono?: boolean;
  align?: "left" | "center" | "right";
  /** Enables the header sort control for this column. */
  sortable?: boolean;
  /**
   * Value to sort by. Needed whenever the cell renders something other than a
   * plain scalar — a Badge, a formatted currency string, a composed name — since
   * the raw record value is what actually gets compared.
   */
  sortValue?: (row: T) => string | number;
}

export type SortDirection = "asc" | "desc";

export interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (row: T) => string;
  onRowClick?: (row: T) => void;
  loading?: boolean;
  emptyMessage?: string;
  className?: string;
  /**
   * Pins the header while the body scrolls. Requires `maxHeight` — a sticky
   * <thead> does nothing without a vertically scrolling container, which is why
   * this silently had no effect before.
   */
  stickyHeader?: boolean;
  /** e.g. "24rem" or "60vh". Makes the body scroll vertically. */
  maxHeight?: string;
  /** Describes the table for screen readers. Strongly recommended. */
  caption?: string;
  /** Visually show the caption instead of only exposing it to assistive tech. */
  showCaption?: boolean;
  skeletonRows?: number;
  initialSort?: { key: string; direction: SortDirection };
}

const alignClass = {
  left: "text-left",
  center: "text-center",
  right: "text-right",
} as const;

/**
 * Generic data table.
 *
 * Rows are keyboard-operable when `onRowClick` is set: the previous version put
 * a click handler on <tr> with no focusability, so every row action was
 * mouse-only and unreachable by keyboard or screen reader.
 */
export function DataTable<T>({
  columns,
  data,
  keyExtractor,
  onRowClick,
  loading,
  emptyMessage = "No records found.",
  className,
  stickyHeader,
  maxHeight,
  caption,
  showCaption = false,
  skeletonRows = 5,
  initialSort,
}: DataTableProps<T>) {
  const [sort, setSort] = useState<{ key: string; direction: SortDirection } | null>(
    initialSort ?? null
  );

  if (process.env.NODE_ENV !== "production" && stickyHeader && !maxHeight) {
    console.warn(
      "[DataTable] `stickyHeader` needs `maxHeight` to have any effect — without a " +
        "vertically scrolling container there is nothing for the header to stick to."
    );
  }

  const sortedData = useMemo(() => {
    if (!sort) return data;
    const column = columns.find((c) => String(c.key) === sort.key);
    if (!column) return data;

    const valueOf = (row: T): string | number => {
      if (column.sortValue) return column.sortValue(row);
      const raw = (row as Record<string, unknown>)[String(column.key)];
      if (typeof raw === "number" || typeof raw === "string") return raw;
      return String(raw ?? "");
    };

    // Copy first: sorting `data` in place would mutate the caller's array.
    return [...data].sort((a, b) => {
      const av = valueOf(a);
      const bv = valueOf(b);
      const result =
        typeof av === "number" && typeof bv === "number"
          ? av - bv
          : String(av).localeCompare(String(bv), undefined, { numeric: true });
      return sort.direction === "asc" ? result : -result;
    });
  }, [data, sort, columns]);

  const toggleSort = (key: string) =>
    setSort((current) =>
      current?.key === key
        ? current.direction === "asc"
          ? { key, direction: "desc" }
          : null // third click clears the sort and restores source order
        : { key, direction: "asc" }
    );

  const onRowKeyDown = (e: KeyboardEvent<HTMLTableRowElement>, row: T) => {
    if (e.key !== "Enter" && e.key !== " ") return;
    e.preventDefault(); // Space would otherwise scroll the page
    onRowClick?.(row);
  };

  return (
    <div
      className={cn(
        "rounded-xl border border-outline-variant/40 bg-surface-container-lowest",
        "overflow-x-auto",
        maxHeight && "overflow-y-auto",
        className
      )}
      style={maxHeight ? { maxHeight } : undefined}
    >
      <table className="w-full text-sm">
        {caption && (
          <caption
            className={cn(
              "text-left text-sm text-on-surface-variant",
              showCaption ? "px-4 py-3" : "sr-only"
            )}
          >
            {caption}
          </caption>
        )}

        <thead
          className={cn(
            "border-b border-outline-variant/40 bg-surface-container",
            stickyHeader && "sticky top-0 z-10"
          )}
        >
          <tr>
            {columns.map((col) => {
              const key = String(col.key);
              const isSorted = sort?.key === key;
              const align = col.align ?? "left";

              return (
                <th
                  key={key}
                  scope="col"
                  // Exposes the current sort state to assistive tech.
                  aria-sort={isSorted ? (sort.direction === "asc" ? "ascending" : "descending") : undefined}
                  className={cn(
                    "px-4 py-3 text-xs font-semibold font-label uppercase tracking-wider text-on-surface-variant",
                    alignClass[align],
                    col.headerClassName
                  )}
                >
                  {col.sortable ? (
                    <button
                      type="button"
                      onClick={() => toggleSort(key)}
                      className={cn(
                        "inline-flex items-center gap-1.5 uppercase tracking-wider transition-colors",
                        "hover:text-on-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-medical-blue rounded",
                        align === "right" && "flex-row-reverse",
                        isSorted && "text-on-surface"
                      )}
                    >
                      {col.header}
                      {isSorted ? (
                        sort.direction === "asc" ? (
                          <ArrowUp className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                        ) : (
                          <ArrowDown className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                        )
                      ) : (
                        <ChevronsUpDown className="h-3.5 w-3.5 shrink-0 opacity-40" aria-hidden="true" />
                      )}
                    </button>
                  ) : (
                    col.header
                  )}
                </th>
              );
            })}
          </tr>
        </thead>

        <tbody className="divide-y divide-outline-variant/20">
          {loading ? (
            Array.from({ length: skeletonRows }).map((_, i) => (
              <tr key={i} aria-hidden="true">
                {columns.map((col) => (
                  <td key={String(col.key)} className="px-4 py-3">
                    <div className="h-4 bg-surface-container rounded animate-pulse" />
                  </td>
                ))}
              </tr>
            ))
          ) : sortedData.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-4 py-12 text-center text-on-surface-variant"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            sortedData.map((row) => (
              <tr
                key={keyExtractor(row)}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                onKeyDown={onRowClick ? (e) => onRowKeyDown(e, row) : undefined}
                // Focusable only when there is actually a row action, so
                // read-only tables don't add noise to the tab order.
                tabIndex={onRowClick ? 0 : undefined}
                className={cn(
                  "transition-colors",
                  onRowClick &&
                    "cursor-pointer hover:bg-surface-container/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-medical-blue"
                )}
              >
                {columns.map((col) => (
                  <td
                    key={String(col.key)}
                    className={cn(
                      "px-4 py-3 text-on-surface",
                      alignClass[col.align ?? "left"],
                      col.mono && "font-mono text-[0.8125rem] tracking-tight",
                      col.className
                    )}
                  >
                    {col.render
                      ? col.render(row)
                      : String((row as Record<string, unknown>)[String(col.key)] ?? "")}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
