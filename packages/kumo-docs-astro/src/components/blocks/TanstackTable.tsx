import {
  Badge,
  Button,
  cn,
  DropdownMenu,
  Pagination,
  SkeletonLine,
  Table,
} from "@cloudflare/kumo";
import { MinusSquareIcon, PlusSquareIcon } from "@phosphor-icons/react";
import {
  flexRender,
  type Table as TanstackTableType,
  type Row,
  type ColumnDef,
} from "@tanstack/react-table";
import { Fragment, type ReactNode, useEffect, useMemo, useRef } from "react";

interface TanstackTableProps<T> {
  /** Additional CSS class names for the table */
  className?: string;
  /** TanStack table instance from useReactTable hook */
  table: TanstackTableType<T>;
  /** Whether to show row selection checkboxes */
  showSelectionControl?: boolean;
  /** Whether to show expand/collapse controls for rows with sub-rows */
  showExpandControl?: boolean;
  /** Custom render function for expanded row content */
  customExpandChildren?: (row: Row<T>) => ReactNode;
  /** Whether to show loading skeleton state */
  isLoading?: boolean;
}

const INITIAL_LOADING_ROW_COUNT = 5;

// Column width constants for consistent sizing
const CONTROL_COLUMN_WIDTH = 40; // Width for expand/collapse and selection columns
const ACTION_COLUMN_WIDTH = 50; // Width for action column

const FILLER_COLUMN_ID = "__filler";
const ACTION_COLUMN_ID = "__actions";

/**
 * Main table component that renders a TanStack table with sorting, selection,
 * expansion, and column resizing capabilities.
 *
 * @example
 * ```tsx
 * const table = useReactTable({
 *   data,
 *   columns,
 *   getCoreRowModel: getCoreRowModel(),
 *   getSortedRowModel: getSortedRowModel(),
 * });
 *
 * <TanstackTable table={table} showSelectionControl showExpandControl />
 * ```
 */
function TanstackTableRoot<T>({
  className,
  table,
  showSelectionControl,
  showExpandControl,
  customExpandChildren,
  isLoading,
}: TanstackTableProps<T>) {
  // Use table state values that change to trigger re-renders instead of the table object itself
  const sortingState = table.getState().sorting;
  // Track which column is being resized to apply visual indicators.
  // This is the column ID (string) or false if no column is resizing.
  const resizingColumn = table.getState().columnSizingInfo.isResizingColumn;
  const columnVisibility = table.getState().columnVisibility;

  const rowCount = table.getRowCount();
  const previousRowCount = useRef(INITIAL_LOADING_ROW_COUNT);
  const paginationState = table.getState().pagination;
  const expandingState = table.getState().expanded;
  const selectionState = table.getState().rowSelection;

  useEffect(() => {
    if (rowCount > 0) {
      previousRowCount.current = rowCount;
    }
  }, [rowCount]);

  // Memoize body content to prevent unnecessary re-renders when parent updates
  const bodyContent = useMemo(() => {
    return table.getRowModel().rows.map((row) => (
      <Fragment key={row.id}>
        <Table.Row>
          {showExpandControl && (
            <Table.Cell
              className="text-center select-none cursor-pointer"
              onClick={() => {
                if (!row.getCanExpand()) return;
                row.toggleExpanded();
              }}
            >
              {row.getCanExpand() &&
                (row.getIsExpanded() ? (
                  <MinusSquareIcon size={16} aria-label="Collapse row" />
                ) : (
                  <PlusSquareIcon size={16} aria-label="Expand row" />
                ))}
            </Table.Cell>
          )}
          {showSelectionControl &&
            (row.getCanSelect() ? (
              <Table.CheckCell
                checked={row.getIsSelected()}
                onValueChange={row.toggleSelected}
              />
            ) : (
              <Table.Cell />
            ))}
          {row.getVisibleCells().map((cell) => (
            <Table.Cell
              key={cell.id}
              className={cn(
                cell.column.id === ACTION_COLUMN_ID &&
                  "sticky right-0 bg-gradient-to-r from-transparent to-40% to-kumo-base",
                cell.column.getIsResizing() ? "border-r border-kumo-line" : "",
              )}
            >
              {flexRender(cell.column.columnDef.cell, cell.getContext())}
            </Table.Cell>
          ))}
        </Table.Row>

        {row.getIsExpanded() && customExpandChildren && (
          <Table.Row>
            <Table.Cell
              colSpan={
                row.getVisibleCells().length +
                (showExpandControl ? 1 : 0) +
                (showSelectionControl ? 1 : 0)
              }
              className="!p-0 !m-0"
            >
              {customExpandChildren(row)}
            </Table.Cell>
          </Table.Row>
        )}
      </Fragment>
    ));
    // Dependencies intentionally include table state primitives (sortingState, resizingColumn, columnVisibility)
    // to trigger re-renders on column resize/sort/visibility changes without re-creating the entire table object.
    // The 'table' object reference is stable but we need these granular state dependencies for proper UI updates.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    table,
    showExpandControl,
    showSelectionControl,
    customExpandChildren,
    table.options.data,
    sortingState,
    resizingColumn,
    columnVisibility,
    paginationState,
    expandingState,
    selectionState,
  ]);

  return (
    <Table className={className} layout="fixed" variant="layer">
      <colgroup>
        {showExpandControl && (
          <col
            style={{
              width: `${CONTROL_COLUMN_WIDTH}px`,
              maxWidth: `${CONTROL_COLUMN_WIDTH}px`,
              minWidth: `${CONTROL_COLUMN_WIDTH}px`,
            }}
          />
        )}
        {showSelectionControl && (
          <col
            style={{
              width: `${CONTROL_COLUMN_WIDTH}px`,
              maxWidth: `${CONTROL_COLUMN_WIDTH}px`,
              minWidth: `${CONTROL_COLUMN_WIDTH}px`,
            }}
          />
        )}
        {table
          .getFlatHeaders()
          .map((column) =>
            column.id === FILLER_COLUMN_ID ? (
              <col key={FILLER_COLUMN_ID} />
            ) : (
              <col key={column.id} style={{ width: `${column.getSize()}px` }} />
            ),
          )}
      </colgroup>
      <Table.Header>
        {table.getHeaderGroups().map((headerGroup) => (
          <Table.Row key={headerGroup.id}>
            {showExpandControl && <Table.Head />}
            {showSelectionControl && (
              <Table.CheckHead
                checked={table.getIsAllRowsSelected()}
                indeterminate={table.getIsSomeRowsSelected()}
                onValueChange={table.toggleAllRowsSelected}
                aria-label="Select all rows"
              />
            )}
            {headerGroup.headers.map((header) => (
              <Table.Head
                key={header.id}
                aria-label={
                  header.column.getCanSort()
                    ? `Sort by ${typeof header.column.columnDef.header === "string" ? header.column.columnDef.header : header.column.id}`
                    : undefined
                }
                aria-sort={
                  header.column.getCanSort()
                    ? header.column.getIsSorted()
                      ? header.column.getIsSorted() === "asc"
                        ? "ascending"
                        : "descending"
                      : "none"
                    : undefined
                }
                className={cn(
                  header.column.id === ACTION_COLUMN_ID && "sticky right-0",
                  header.column.getIsResizing()
                    ? "border-r border-kumo-line"
                    : "",
                )}
              >
                {header.column.getCanSort() ? (
                  <button
                    type="button"
                    onClick={() => header.column.toggleSorting()}
                    className={cn(
                      "w-full text-sm font-medium gap-2 flex items-center justify-start",
                      "select-none cursor-pointer hover:text-kumo-default",
                      "bg-transparent border-0 p-0 font-inherit text-inherit",
                    )}
                  >
                    <span className="line-clamp-1">
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </span>
                    <Table.SortIcon direction={header.column.getIsSorted()} />
                  </button>
                ) : (
                  <div className="gap-2 flex items-center">
                    <span className="line-clamp-1">
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </span>
                  </div>
                )}
                {header.column.getCanResize() && (
                  <Table.ResizeHandle
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                    onMouseDown={(e) => {
                      header.getResizeHandler()(e);
                      e.stopPropagation();
                    }}
                    onTouchStart={(e) => {
                      header.getResizeHandler()(e);
                      e.stopPropagation();
                    }}
                    className={"bg-inherit"}
                  />
                )}
              </Table.Head>
            ))}
          </Table.Row>
        ))}
      </Table.Header>
      <Table.Body>
        {isLoading
          ? Array.from({
              length: previousRowCount.current || INITIAL_LOADING_ROW_COUNT,
            }).map((_, loadingRowIdx) => {
              return (
                <Table.Row key={loadingRowIdx}>
                  {table.getAllFlatColumns().map((header) => {
                    return (
                      <Table.Cell key={header.id} className="h-11">
                        {header.id !== ACTION_COLUMN_ID &&
                          header.id !== FILLER_COLUMN_ID && <SkeletonLine />}
                      </Table.Cell>
                    );
                  })}
                </Table.Row>
              );
            })
          : bodyContent}
      </Table.Body>
    </Table>
  );
}

interface ColumnFilterProps<T> {
  /** TanStack table instance */
  table: TanstackTableType<T>;
}

/**
 * Dropdown menu for toggling column visibility.
 * Shows a badge with the count of hidden columns.
 *
 * @example
 * ```tsx
 * <TanstackTable.ColumnFilter table={table} />
 * ```
 */
function ColumnFilter<T>({ table }: ColumnFilterProps<T>) {
  const hiddenColumnsCount = table
    .getAllLeafColumns()
    .filter((column) => column.getCanHide() && !column.getIsVisible()).length;

  const visibleColumns = table
    .getAllLeafColumns()
    .filter((column) => column.getCanHide() && column.getIsVisible());

  return (
    <DropdownMenu>
      <DropdownMenu.Trigger
        render={
          <Button>
            Columns
            {hiddenColumnsCount > 0 && (
              <Badge variant="secondary" className="ml-1">
                {hiddenColumnsCount}
              </Badge>
            )}
          </Button>
        }
      />
      <DropdownMenu.Content>
        {table
          .getAllLeafColumns()
          .filter((column) => column.getCanHide())
          .map((column) => {
            const isLastVisible =
              visibleColumns.length === 1 &&
              visibleColumns[0]?.id === column.id;

            return (
              <DropdownMenu.CheckboxItem
                key={column.id}
                checked={column.getIsVisible()}
                disabled={isLastVisible}
                onCheckedChange={() => column.toggleVisibility()}
              >
                {typeof column.columnDef.header === "string"
                  ? column.columnDef.header
                  : column.id}
              </DropdownMenu.CheckboxItem>
            );
          })}
      </DropdownMenu.Content>
    </DropdownMenu>
  );
}

interface ClientPaginationProps<T> {
  /** TanStack table instance */
  table: TanstackTableType<T>;
  /** Whether to show the page size selector dropdown */
  showPageSizeSelector?: boolean;
  /** Available page size options for the selector */
  pageSizeOptions?: number[];
}

/**
 * Client-side pagination controls for TanStack table.
 * Converts TanStack's 0-indexed pagination to 1-indexed for the UI.
 *
 * @example
 * ```tsx
 * <TanstackTable.ClientPagination
 *   table={table}
 *   showPageSizeSelector
 *   pageSizeOptions={[10, 25, 50]}
 * />
 * ```
 */
function ClientPagination<T>({
  table,
  showPageSizeSelector = true,
  pageSizeOptions = [10, 25, 50, 100],
}: ClientPaginationProps<T>) {
  const pageIndex = table.getState().pagination.pageIndex;
  const pageSize = table.getState().pagination.pageSize;
  // Use pre-pagination model to get filtered row count (excludes pagination)
  const rowCount = table.getPrePaginationRowModel().rows.length;

  // TanStack uses 0-indexed pages, but Pagination component uses 1-indexed
  const currentPage = pageIndex + 1;

  const handleSetPage = (newPage: number) => {
    table.setPageIndex(newPage - 1);
  };

  const handlePageSizeChange = (newSize: number) => {
    table.setPageSize(newSize);
  };

  return (
    <Pagination
      setPage={handleSetPage}
      page={currentPage}
      perPage={pageSize}
      totalCount={rowCount}
    >
      <Pagination.Info />
      {showPageSizeSelector && (
        <>
          <Pagination.Separator />
          <Pagination.PageSize
            value={pageSize}
            onChange={handlePageSizeChange}
            options={pageSizeOptions}
          />
        </>
      )}
      <Pagination.Controls />
    </Pagination>
  );
}

TanstackTableRoot.displayName = "TanstackTable";
ColumnFilter.displayName = "TanstackTable.ColumnFilter";
ClientPagination.displayName = "TanstackTable.ClientPagination";

export const TanstackTable = Object.assign(TanstackTableRoot, {
  ColumnFilter,
  ClientPagination,
});

/**
 * Creates a filler column that expands to fill remaining table width.
 * Use this as the last column to prevent columns from stretching unevenly.
 *
 * @example
 * ```tsx
 * const columns = [
 *   { accessorKey: 'name', header: 'Name' },
 *   { accessorKey: 'status', header: 'Status' },
 *   createFillerColumn<Data>(),
 * ];
 * ```
 */
export function createFillerColumn<T>(): ColumnDef<T> {
  return {
    id: FILLER_COLUMN_ID,
    header: "",
    size: undefined,
    enableHiding: false,
    enableSorting: false,
    enableResizing: false,
  };
}

/**
 * Creates an actions column for row-level actions (edit, delete, etc.).
 * This column is fixed-width, non-sortable, and non-resizable.
 *
 * @param options - Configuration options
 * @param options.cell - Render function for the action cell content
 * @returns Column definition for actions
 *
 * @example
 * ```tsx
 * const columns = [
 *   { accessorKey: 'name', header: 'Name' },
 *   createActionsColumn<Data>({
 *     cell: ({ row }) => (
 *       <DropdownMenu>
 *         <DropdownMenu.Trigger>
 *           <IconButton><DotsThreeIcon /></IconButton>
 *         </DropdownMenu.Trigger>
 *         <DropdownMenu.Content>
 *           <DropdownMenu.Item onSelect={() => edit(row.original)}>
 *             Edit
 *           </DropdownMenu.Item>
 *         </DropdownMenu.Content>
 *       </DropdownMenu>
 *     ),
 *   }),
 * ];
 * ```
 */
export function createActionsColumn<T>({
  cell,
}: Pick<ColumnDef<T>, "cell">): ColumnDef<T> {
  return {
    id: ACTION_COLUMN_ID,
    enableHiding: false,
    enableSorting: false,
    enableResizing: false,
    header: "",
    size: ACTION_COLUMN_WIDTH,
    cell: cell,
  };
}
