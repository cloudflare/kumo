import { useState } from "react";
import {
  Badge,
  Button,
  DropdownMenu,
  LayerCard,
  Table,
} from "@cloudflare/kumo";
import {
  DotsThree,
  EnvelopeSimple,
  Eye,
  PencilSimple,
  Trash,
} from "@phosphor-icons/react";
import {
  type ColumnDef,
  type SortingState,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

// Sample data for demos
const emailData = [
  {
    id: "1",
    subject: "Kumo v1.0.0 released",
    from: "Visal In",
    date: "5 seconds ago",
  },
  {
    id: "2",
    subject: "New Job Offer",
    from: "Cloudflare",
    date: "10 minutes ago",
  },
  {
    id: "3",
    subject: "Daily Email Digest",
    from: "Cloudflare",
    date: "1 hour ago",
    tags: ["promotion"],
  },
  {
    id: "4",
    subject: "GitLab - New Comment",
    from: "Rob Knecht",
    date: "1 day ago",
  },
  {
    id: "5",
    subject: "Out of Office",
    from: "Johnnie Lappen",
    date: "3 days ago",
  },
];

export function TableBasicDemo() {
  return (
    <LayerCard>
      <LayerCard.Primary className="p-0">
        <Table>
          <Table.Header>
            <Table.Row>
              <Table.Head>Subject</Table.Head>
              <Table.Head>From</Table.Head>
              <Table.Head>Date</Table.Head>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {emailData.slice(0, 3).map((row) => (
              <Table.Row key={row.id}>
                <Table.Cell>{row.subject}</Table.Cell>
                <Table.Cell>{row.from}</Table.Cell>
                <Table.Cell>{row.date}</Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      </LayerCard.Primary>
    </LayerCard>
  );
}

export function TableWithCheckboxDemo() {
  const rows = emailData.slice(0, 3);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const toggleRow = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleAll = () => {
    if (selectedIds.size === rows.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(rows.map((r) => r.id)));
    }
  };

  return (
    <LayerCard>
      <LayerCard.Primary className="p-0">
        <Table>
          <Table.Header>
            <Table.Row>
              <Table.CheckHead
                checked={selectedIds.size === rows.length}
                indeterminate={
                  selectedIds.size > 0 && selectedIds.size < rows.length
                }
                onValueChange={toggleAll}
                aria-label="Select all rows"
              />
              <Table.Head>Subject</Table.Head>
              <Table.Head>From</Table.Head>
              <Table.Head>Date</Table.Head>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {rows.map((row) => (
              <Table.Row key={row.id}>
                <Table.CheckCell
                  checked={selectedIds.has(row.id)}
                  onValueChange={() => toggleRow(row.id)}
                  aria-label={`Select ${row.subject}`}
                />
                <Table.Cell>{row.subject}</Table.Cell>
                <Table.Cell>{row.from}</Table.Cell>
                <Table.Cell>{row.date}</Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      </LayerCard.Primary>
    </LayerCard>
  );
}

export function TableWithCompactHeaderDemo() {
  return (
    <LayerCard>
      <LayerCard.Primary className="p-0">
        <Table>
          <Table.Header variant="compact">
            <Table.Row>
              <Table.Head>Subject</Table.Head>
              <Table.Head>From</Table.Head>
              <Table.Head>Date</Table.Head>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {emailData.slice(0, 3).map((row) => (
              <Table.Row key={row.id}>
                <Table.Cell>{row.subject}</Table.Cell>
                <Table.Cell>{row.from}</Table.Cell>
                <Table.Cell>{row.date}</Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      </LayerCard.Primary>
    </LayerCard>
  );
}

export function TableSelectedRowDemo() {
  const rows = emailData.slice(0, 3);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set(["2"]));

  const toggleRow = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleAll = () => {
    if (selectedIds.size === rows.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(rows.map((r) => r.id)));
    }
  };

  return (
    <LayerCard>
      <LayerCard.Primary className="p-0">
        <Table>
          <Table.Header>
            <Table.Row>
              <Table.CheckHead
                checked={selectedIds.size === rows.length}
                indeterminate={
                  selectedIds.size > 0 && selectedIds.size < rows.length
                }
                onValueChange={toggleAll}
                aria-label="Select all rows"
              />
              <Table.Head>Subject</Table.Head>
              <Table.Head>From</Table.Head>
              <Table.Head>Date</Table.Head>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {rows.map((row) => (
              <Table.Row
                key={row.id}
                variant={selectedIds.has(row.id) ? "selected" : "default"}
              >
                <Table.CheckCell
                  checked={selectedIds.has(row.id)}
                  onValueChange={() => toggleRow(row.id)}
                  aria-label={`Select ${row.subject}`}
                />
                <Table.Cell>{row.subject}</Table.Cell>
                <Table.Cell>{row.from}</Table.Cell>
                <Table.Cell>{row.date}</Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      </LayerCard.Primary>
    </LayerCard>
  );
}

export function TableFixedLayoutDemo() {
  return (
    <LayerCard>
      <LayerCard.Primary className="p-0">
        <Table layout="fixed">
          <colgroup>
            <col />
            <col className="w-[150px]" />
            <col className="w-[150px]" />
          </colgroup>
          <Table.Header>
            <Table.Row>
              <Table.Head>Subject</Table.Head>
              <Table.Head>From</Table.Head>
              <Table.Head>Date</Table.Head>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {emailData.map((row) => (
              <Table.Row key={row.id}>
                <Table.Cell>{row.subject}</Table.Cell>
                <Table.Cell>{row.from}</Table.Cell>
                <Table.Cell>{row.date}</Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      </LayerCard.Primary>
    </LayerCard>
  );
}

// ---------------------------------------------------------------------------
// TanStack Table integration data + demo
// ---------------------------------------------------------------------------

type Worker = {
  id: string;
  name: string;
  requests: number;
  errors: number;
  cpuMs: number;
  status: "Active" | "Inactive" | "Degraded";
};

const workerData: Worker[] = [
  {
    id: "1",
    name: "api-gateway",
    requests: 142_830,
    errors: 12,
    cpuMs: 4.2,
    status: "Active",
  },
  {
    id: "2",
    name: "auth-service",
    requests: 98_210,
    errors: 0,
    cpuMs: 2.1,
    status: "Active",
  },
  {
    id: "3",
    name: "image-resizer",
    requests: 34_560,
    errors: 87,
    cpuMs: 18.9,
    status: "Degraded",
  },
  {
    id: "4",
    name: "cache-purger",
    requests: 6_120,
    errors: 0,
    cpuMs: 0.8,
    status: "Active",
  },
  {
    id: "5",
    name: "log-drain",
    requests: 0,
    errors: 0,
    cpuMs: 0,
    status: "Inactive",
  },
  {
    id: "6",
    name: "edge-router",
    requests: 215_400,
    errors: 3,
    cpuMs: 1.5,
    status: "Active",
  },
];

const workerColumns: ColumnDef<Worker>[] = [
  {
    accessorKey: "name",
    header: "Worker",
    size: 200,
    minSize: 120,
  },
  {
    accessorKey: "requests",
    header: "Requests",
    size: 130,
    minSize: 90,
    cell: ({ getValue }) => (getValue() as number).toLocaleString(),
  },
  {
    accessorKey: "errors",
    header: "Errors",
    size: 100,
    minSize: 70,
  },
  {
    accessorKey: "cpuMs",
    header: "CPU (ms)",
    size: 110,
    minSize: 80,
    cell: ({ getValue }) => `${getValue() as number} ms`,
  },
  {
    accessorKey: "status",
    header: "Status",
    size: 110,
    minSize: 80,
    cell: ({ getValue }) => {
      const status = getValue() as Worker["status"];
      const variantMap: Record<
        Worker["status"],
        "secondary" | "destructive" | "success"
      > = {
        Active: "success",
        Degraded: "destructive",
        Inactive: "secondary",
      };
      return <Badge variant={variantMap[status]}>{status}</Badge>;
    },
  },
];

/** TanStack Table with sortable columns and resizable column widths using Table.ResizeHandle */
export function TableTanStackSortableResizableDemo() {
  const [sorting, setSorting] = useState<SortingState>([]);

  const table = useReactTable({
    data: workerData,
    columns: workerColumns,
    state: { sorting },
    onSortingChange: setSorting,
    columnResizeMode: "onChange",
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <LayerCard>
      <LayerCard.Primary className="w-full overflow-x-auto p-0">
        <Table layout="fixed">
          <colgroup>
            {table.getAllColumns().map((col) => (
              <col
                key={col.id}
                style={{ width: col.getSize() }}
                className={
                  col.getIsResizing() ? "border-r border-kumo-ring" : undefined
                }
              />
            ))}
            {/* Filler column — absorbs remaining space so fixed columns don't stretch */}
            <col />
          </colgroup>
          <Table.Header>
            {table.getHeaderGroups().map((headerGroup) => (
              <Table.Row key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const isSorted = header.column.getIsSorted();
                  const canSort = header.column.getCanSort();
                  return (
                    <Table.Head
                      key={header.id}
                      onClick={
                        canSort
                          ? header.column.getToggleSortingHandler()
                          : undefined
                      }
                      aria-label={
                        canSort ? `Sort by ${header.column.id}` : undefined
                      }
                      className={
                        canSort ? "cursor-pointer select-none" : undefined
                      }
                    >
                      <div className="flex items-center gap-1">
                        {header.isPlaceholder ? null : (
                          <>
                            {flexRender(
                              header.column.columnDef.header,
                              header.getContext(),
                            )}
                            {canSort && <Table.SortIcon direction={isSorted} />}
                          </>
                        )}
                      </div>
                      <Table.ResizeHandle
                        onMouseDown={header.getResizeHandler()}
                        onTouchStart={header.getResizeHandler()}
                      />
                    </Table.Head>
                  );
                })}
                {/* Filler header cell matching the filler col */}
                <Table.Head />
              </Table.Row>
            ))}
          </Table.Header>
          <Table.Body>
            {table.getRowModel().rows.map((row) => (
              <Table.Row key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <Table.Cell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </Table.Cell>
                ))}
                {/* Filler cell matching the filler col */}
                <Table.Cell />
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      </LayerCard.Primary>
    </LayerCard>
  );
}

export function TableFullDemo() {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set(["2"]));

  const toggleRow = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleAll = () => {
    if (selectedIds.size === emailData.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(emailData.map((r) => r.id)));
    }
  };

  return (
    <LayerCard>
      <LayerCard.Primary className="w-full overflow-x-auto p-0">
        <Table layout="fixed">
          <colgroup>
            <col />{" "}
            {/* Checkbox column - width handled by Table.CheckHead/CheckCell */}
            <col />
            <col style={{ width: "150px" }} />
            <col style={{ width: "120px" }} />
            <col style={{ width: "50px" }} />
          </colgroup>
          <Table.Header>
            <Table.Row>
              <Table.CheckHead
                checked={selectedIds.size === emailData.length}
                indeterminate={
                  selectedIds.size > 0 && selectedIds.size < emailData.length
                }
                onValueChange={toggleAll}
                aria-label="Select all rows"
              />
              <Table.Head>Subject</Table.Head>
              <Table.Head>From</Table.Head>
              <Table.Head>Date</Table.Head>
              <Table.Head></Table.Head>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {emailData.map((row) => (
              <Table.Row
                key={row.id}
                variant={selectedIds.has(row.id) ? "selected" : "default"}
              >
                <Table.CheckCell
                  checked={selectedIds.has(row.id)}
                  onValueChange={() => toggleRow(row.id)}
                  aria-label={`Select ${row.subject}`}
                />
                <Table.Cell>
                  <div className="flex items-center gap-2">
                    <EnvelopeSimple size={16} />
                    <span className="truncate">{row.subject}</span>
                    {row.tags && (
                      <div className="ml-2 inline-flex gap-1">
                        {row.tags.map((tag) => (
                          <Badge key={tag}>{tag}</Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </Table.Cell>
                <Table.Cell>
                  <span className="truncate">{row.from}</span>
                </Table.Cell>
                <Table.Cell>
                  <span className="truncate">{row.date}</span>
                </Table.Cell>
                <Table.Cell className="text-right">
                  <DropdownMenu>
                    <DropdownMenu.Trigger
                      render={
                        <Button
                          variant="ghost"
                          size="sm"
                          shape="square"
                          aria-label="More options"
                        >
                          <DotsThree weight="bold" size={16} />
                        </Button>
                      }
                    />
                    <DropdownMenu.Content>
                      <DropdownMenu.Item icon={Eye}>View</DropdownMenu.Item>
                      <DropdownMenu.Item icon={PencilSimple}>
                        Edit
                      </DropdownMenu.Item>
                      <DropdownMenu.Separator />
                      <DropdownMenu.Item icon={Trash} variant="danger">
                        Delete
                      </DropdownMenu.Item>
                    </DropdownMenu.Content>
                  </DropdownMenu>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      </LayerCard.Primary>
    </LayerCard>
  );
}
