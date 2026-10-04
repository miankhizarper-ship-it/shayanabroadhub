import { cn } from "../../utils/cn";
import { AdminEmptyState, TableSkeleton } from "./ui";
import AdminPagination from "./AdminPagination";

/**
 * DataTable — the CMS table shell: column config, loading
 * skeletons, empty state, row rendering and pagination in one
 * consistent frame. Every listing screen composes it.
 *
 * @param {Array<{ key: string, header: ReactNode, className?: string, render?: (row) => ReactNode }>} columns
 * @param {(row: object) => ReactNode} [rowActions] rendered as the last column
 */
export default function DataTable({
  columns,
  items,
  loading,
  error,
  onRetry,
  emptyState,
  rowKey,
  onRowClick,
  rowActions,
  pagination,
  onPageChange,
  className,
}) {
  return (
    <div className={cn("overflow-hidden rounded-xl border border-line bg-white", className)}>
      {/* `relative` makes this the containing block for sr-only
          absolutely-positioned spans inside the table, so they are
          clipped here instead of widening the document. */}
      <div className="relative overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse text-left">
          <thead>
            <tr className="border-b border-line bg-cream-deep/60">
              {columns.map((column) => (
                <th
                  key={column.key}
                  scope="col"
                  className={cn(
                    "px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-muted",
                    column.className,
                  )}
                >
                  {column.header}
                </th>
              ))}
              {rowActions ? (
                <th scope="col" className="w-12 px-5 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              ) : null}
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {loading
              ? null
              : items.map((item) => (
                  <tr
                    key={rowKey ? rowKey(item) : item._id}
                    onClick={onRowClick ? () => onRowClick(item) : undefined}
                    className={cn(
                      "transition-colors hover:bg-cream-deep/40",
                      onRowClick && "cursor-pointer",
                    )}
                  >
                    {columns.map((column) => (
                      <td
                        key={column.key}
                        className={cn("px-5 py-3.5 align-middle text-sm text-ink", column.className)}
                      >
                        {column.render ? column.render(item) : item[column.key]}
                      </td>
                    ))}
                    {rowActions ? (
                      <td className="px-5 py-3.5 text-right" onClick={(event) => event.stopPropagation()}>
                        {rowActions(item)}
                      </td>
                    ) : null}
                  </tr>
                ))}
          </tbody>
        </table>
      </div>

      {loading ? <TableSkeleton rows={5} columns={Math.min(columns.length, 5)} /> : null}

      {!loading && error ? null : null}

      {!loading && !error && items.length === 0 ? emptyState ?? <AdminEmptyState title="Nothing here yet" /> : null}

      {!loading && error ? null : null}

      {pagination && !loading && !error && items.length > 0 ? (
        <AdminPagination {...pagination} onChange={onPageChange} />
      ) : null}
    </div>
  );
}

export { AdminEmptyState, TableSkeleton };
