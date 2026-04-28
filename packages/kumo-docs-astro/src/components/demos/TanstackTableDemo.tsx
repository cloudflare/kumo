import { Badge, Button, DropdownMenu, LayerCard } from "@cloudflare/kumo";
import {
  createColumnHelper,
  getCoreRowModel,
  getExpandedRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type Row,
  type RowSelectionState,
} from "@tanstack/react-table";
import { useCallback, useMemo, useState } from "react";
import {
  createActionsColumn,
  createFillerColumn,
  TanstackTable,
} from "../blocks/TanstackTable";
import { DotsThreeIcon } from "@phosphor-icons/react";

interface Resource {
  id: string;
  resourceName: string;
  type: string;
  status: "Active" | "Inactive" | "Pending" | "Error";
  size: string;
  read: string;
  write: string;
}

interface ResourceWithSubrows extends Resource {
  subRows?: Resource[];
}

const RESOURCE_DATA: Resource[] = [
  {
    id: "1",
    resourceName: "production-db-01",
    type: "PostgreSQL",
    status: "Active",
    size: "256 GB",
    read: "2.4 MB/s",
    write: "1.1 MB/s",
  },
  {
    id: "2",
    resourceName: "redis-cache-cluster",
    type: "Redis",
    status: "Active",
    size: "64 GB",
    read: "45.2 MB/s",
    write: "38.7 MB/s",
  },
  {
    id: "3",
    resourceName: "user-uploads-bucket",
    type: "S3",
    status: "Active",
    size: "1.2 TB",
    read: "8.5 MB/s",
    write: "4.2 MB/s",
  },
  {
    id: "4",
    resourceName: "analytics-warehouse",
    type: "ClickHouse",
    status: "Active",
    size: "4.8 TB",
    read: "156.3 MB/s",
    write: "89.4 MB/s",
  },
  {
    id: "5",
    resourceName: "search-index-primary",
    type: "Elasticsearch",
    status: "Inactive",
    size: "512 GB",
    read: "0 MB/s",
    write: "0 MB/s",
  },
  {
    id: "6",
    resourceName: "message-queue-main",
    type: "RabbitMQ",
    status: "Active",
    size: "32 GB",
    read: "12.8 MB/s",
    write: "15.3 MB/s",
  },
  {
    id: "7",
    resourceName: "logs-aggregator",
    type: "Loki",
    status: "Pending",
    size: "128 GB",
    read: "0 MB/s",
    write: "0 MB/s",
  },
  {
    id: "8",
    resourceName: "backup-storage-eu",
    type: "S3",
    status: "Active",
    size: "8.5 TB",
    read: "1.2 MB/s",
    write: "0.8 MB/s",
  },
  {
    id: "9",
    resourceName: "metrics-db",
    type: "InfluxDB",
    status: "Error",
    size: "96 GB",
    read: "0 MB/s",
    write: "0 MB/s",
  },
  {
    id: "10",
    resourceName: "auth-session-store",
    type: "Redis",
    status: "Active",
    size: "16 GB",
    read: "89.4 MB/s",
    write: "67.2 MB/s",
  },
  {
    id: "11",
    resourceName: "ml-model-storage",
    type: "NFS",
    status: "Active",
    size: "320 GB",
    read: "5.6 MB/s",
    write: "2.1 MB/s",
  },
  {
    id: "12",
    resourceName: "document-archive",
    type: "MongoDB",
    status: "Inactive",
    size: "2.4 TB",
    read: "0 MB/s",
    write: "0 MB/s",
  },
  {
    id: "13",
    resourceName: "cdn-origin-images",
    type: "S3",
    status: "Active",
    size: "6.7 TB",
    read: "234.5 MB/s",
    write: "12.3 MB/s",
  },
  {
    id: "14",
    resourceName: "payment-audit-log",
    type: "PostgreSQL",
    status: "Active",
    size: "512 GB",
    read: "3.2 MB/s",
    write: "1.8 MB/s",
  },
  {
    id: "15",
    resourceName: "feature-flags-db",
    type: "DynamoDB",
    status: "Active",
    size: "8 GB",
    read: "156.7 KB/s",
    write: "45.2 KB/s",
  },
  {
    id: "16",
    resourceName: "video-transcoding-queue",
    type: "SQS",
    status: "Active",
    size: "4 GB",
    read: "2.1 MB/s",
    write: "3.4 MB/s",
  },
  {
    id: "17",
    resourceName: "monitoring-alerts",
    type: "Prometheus",
    status: "Pending",
    size: "64 GB",
    read: "0 MB/s",
    write: "0 MB/s",
  },
  {
    id: "18",
    resourceName: "config-store",
    type: "Consul",
    status: "Active",
    size: "2 GB",
    read: "12.3 KB/s",
    write: "8.7 KB/s",
  },
  {
    id: "19",
    resourceName: "email-queue",
    type: "RabbitMQ",
    status: "Error",
    size: "16 GB",
    read: "0 MB/s",
    write: "0 MB/s",
  },
  {
    id: "20",
    resourceName: "api-gateway-cache",
    type: "Redis",
    status: "Active",
    size: "48 GB",
    read: "234.1 MB/s",
    write: "198.5 MB/s",
  },
  {
    id: "21",
    resourceName: "data-lake-raw",
    type: "HDFS",
    status: "Active",
    size: "45 TB",
    read: "78.9 MB/s",
    write: "45.6 MB/s",
  },
  {
    id: "22",
    resourceName: "time-series-metrics",
    type: "TimescaleDB",
    status: "Active",
    size: "384 GB",
    read: "34.5 MB/s",
    write: "28.9 MB/s",
  },
  {
    id: "23",
    resourceName: "service-registry",
    type: "etcd",
    status: "Active",
    size: "1 GB",
    read: "45.6 KB/s",
    write: "23.4 KB/s",
  },
  {
    id: "24",
    resourceName: "notification-events",
    type: "Kafka",
    status: "Active",
    size: "256 GB",
    read: "156.7 MB/s",
    write: "178.2 MB/s",
  },
  {
    id: "25",
    resourceName: "static-assets-us",
    type: "S3",
    status: "Active",
    size: "890 GB",
    read: "567.3 MB/s",
    write: "23.4 MB/s",
  },
  {
    id: "26",
    resourceName: "ai-training-data",
    type: "NFS",
    status: "Inactive",
    size: "12 TB",
    read: "0 MB/s",
    write: "0 MB/s",
  },
  {
    id: "27",
    resourceName: "webhook-retry-queue",
    type: "SQS",
    status: "Active",
    size: "8 GB",
    read: "1.8 MB/s",
    write: "2.3 MB/s",
  },
  {
    id: "28",
    resourceName: "audit-compliance-db",
    type: "PostgreSQL",
    status: "Active",
    size: "768 GB",
    read: "5.6 MB/s",
    write: "2.4 MB/s",
  },
  {
    id: "29",
    resourceName: "cdn-edge-logs",
    type: "S3",
    status: "Pending",
    size: "45 GB",
    read: "0 MB/s",
    write: "0 MB/s",
  },
  {
    id: "30",
    resourceName: "rate-limiter-store",
    type: "Redis",
    status: "Active",
    size: "4 GB",
    read: "1.2 GB/s",
    write: "987.4 MB/s",
  },
];

// Data with subrows for expandable table demo
const RESOURCE_DATA_WITH_SUBROWS: ResourceWithSubrows[] = [
  {
    id: "cluster-1",
    resourceName: "production-cluster-us",
    type: "Kubernetes",
    status: "Active",
    size: "2.4 TB",
    read: "850 MB/s",
    write: "420 MB/s",
    subRows: [
      {
        id: "cluster-1-worker-1",
        resourceName: "prod-worker-01",
        type: "Node",
        status: "Active",
        size: "256 GB",
        read: "120 MB/s",
        write: "60 MB/s",
      },
      {
        id: "cluster-1-worker-2",
        resourceName: "prod-worker-02",
        type: "Node",
        status: "Active",
        size: "256 GB",
        read: "115 MB/s",
        write: "58 MB/s",
      },
      {
        id: "cluster-1-worker-3",
        resourceName: "prod-worker-03",
        type: "Node",
        status: "Active",
        size: "256 GB",
        read: "125 MB/s",
        write: "62 MB/s",
      },
    ],
  },
  {
    id: "pipeline-1",
    resourceName: "analytics-pipeline",
    type: "Apache Spark",
    status: "Active",
    size: "8.5 TB",
    read: "2.1 GB/s",
    write: "1.8 GB/s",
  },
  {
    id: "cluster-2",
    resourceName: "search-cluster-eu",
    type: "Elasticsearch",
    status: "Active",
    size: "1.2 TB",
    read: "450 MB/s",
    write: "120 MB/s",
    subRows: [
      {
        id: "cluster-2-master-1",
        resourceName: "es-master-01",
        type: "Node",
        status: "Active",
        size: "128 GB",
        read: "80 MB/s",
        write: "25 MB/s",
      },
      {
        id: "cluster-2-data-1",
        resourceName: "es-data-01",
        type: "Node",
        status: "Active",
        size: "512 GB",
        read: "200 MB/s",
        write: "60 MB/s",
      },
      {
        id: "cluster-2-data-2",
        resourceName: "es-data-02",
        type: "Node",
        status: "Active",
        size: "512 GB",
        read: "195 MB/s",
        write: "58 MB/s",
      },
    ],
  },
  {
    id: "bus-1",
    resourceName: "message-bus-primary",
    type: "Apache Kafka",
    status: "Active",
    size: "4.2 TB",
    read: "1.5 GB/s",
    write: "1.2 GB/s",
  },
  {
    id: "cache-1",
    resourceName: "cache-tier-global",
    type: "Redis Cluster",
    status: "Active",
    size: "512 GB",
    read: "8.5 GB/s",
    write: "6.2 GB/s",
  },
];

export function TanstackBasicDemo() {
  const data = useMemo(() => RESOURCE_DATA.slice(0, 5), []);

  const columns = useMemo(() => {
    const columnHelper = createColumnHelper<Resource>();

    return [
      columnHelper.accessor("resourceName", { header: "Resource Name" }),
      columnHelper.accessor("status", {
        header: "Status",
        cell: (row) => <Badge>{row.getValue()}</Badge>,
      }),
    ];
  }, []);

  const table = useReactTable({
    columns,
    data,
    getCoreRowModel: getCoreRowModel(),
    enableColumnResizing: false,
    enableSorting: false,
    getRowId: (row) => row.id,
  });

  return (
    <LayerCard>
      <TanstackTable table={table} className="text-sm" />
    </LayerCard>
  );
}

export function TanstackLoadingDemo() {
  const data = useMemo(() => [], []);

  const columns = useMemo(() => {
    const columnHelper = createColumnHelper<Resource>();

    return [
      columnHelper.accessor("resourceName", { header: "Resource Name" }),
      columnHelper.accessor("status", {
        header: "Status",
        cell: (row) => <Badge>{row.getValue()}</Badge>,
      }),
    ];
  }, []);

  const table = useReactTable({
    columns,
    data,
    getCoreRowModel: getCoreRowModel(),
    enableColumnResizing: false,
    enableSorting: false,
    getRowId: (row) => row.id,
  });

  return (
    <LayerCard>
      <TanstackTable isLoading table={table} className="text-sm" />
    </LayerCard>
  );
}

export function TanstackResizableDemo() {
  const data = useMemo(() => RESOURCE_DATA.slice(0, 5), []);

  const columns = useMemo(() => {
    const columnHelper = createColumnHelper<Resource>();

    return [
      columnHelper.accessor("resourceName", { header: "Resource Name" }),
      columnHelper.accessor("status", {
        header: "Status",
        cell: (row) => <Badge>{row.getValue()}</Badge>,
      }),
      columnHelper.accessor("size", { header: "Size" }),
    ];
  }, []);

  const table = useReactTable({
    columns,
    data,
    getCoreRowModel: getCoreRowModel(),
    columnResizeMode: "onChange",
    enableColumnResizing: true,
    enableSorting: false,
    getRowId: (row) => row.id,
  });

  return (
    <LayerCard>
      <TanstackTable table={table} className="text-sm" />
    </LayerCard>
  );
}

export function TanstackResizableFillerDemo() {
  const data = useMemo(() => RESOURCE_DATA.slice(0, 5), []);

  const columns = useMemo(() => {
    const columnHelper = createColumnHelper<Resource>();

    return [
      columnHelper.accessor("resourceName", {
        header: "Resource Name",
        minSize: 100,
        size: 300,
        cell: (props) => (
          <span className="line-clamp-1">{props.getValue()}</span>
        ),
      }),
      columnHelper.accessor("status", {
        minSize: 100,
        header: "Status",
        cell: (row) => <Badge>{row.getValue()}</Badge>,
      }),
      columnHelper.accessor("size", { header: "Size", minSize: 100 }),
      createFillerColumn<Resource>(),
    ];
  }, []);

  const table = useReactTable({
    columns,
    data,
    getCoreRowModel: getCoreRowModel(),
    columnResizeMode: "onChange",
    enableColumnResizing: true,
    enableSorting: false,
    getRowId: (row) => row.id,
  });

  return (
    <LayerCard className="overflow-x-auto">
      <TanstackTable table={table} className="text-sm" />
    </LayerCard>
  );
}

export function TanstackColumnFilterDemo() {
  const data = useMemo(() => RESOURCE_DATA.slice(0, 5), []);

  const columns = useMemo(() => {
    const columnHelper = createColumnHelper<Resource>();

    return [
      columnHelper.accessor("resourceName", {
        header: "Resource Name",
        minSize: 100,
        size: 300,
        cell: (props) => (
          <span className="line-clamp-1">{props.getValue()}</span>
        ),
      }),
      columnHelper.accessor("status", {
        minSize: 100,
        header: "Status",
        cell: (row) => <Badge>{row.getValue()}</Badge>,
      }),
      columnHelper.accessor("type", { header: "Type", minSize: 100 }),
      columnHelper.accessor("size", { header: "Size", minSize: 100 }),
      columnHelper.accessor("read", { header: "Read", minSize: 100 }),
      columnHelper.accessor("write", { header: "Write", minSize: 100 }),
      createFillerColumn<Resource>(),
    ];
  }, []);

  const table = useReactTable({
    columns,
    data,
    getCoreRowModel: getCoreRowModel(),
    columnResizeMode: "onChange",
    enableColumnResizing: true,
    enableSorting: false,
    getRowId: (row) => row.id,
  });

  return (
    <div className="space-y-2 max-w-full">
      <TanstackTable.ColumnFilter table={table} />
      <LayerCard className="overflow-x-auto">
        <TanstackTable table={table} className="text-sm" />
      </LayerCard>
    </div>
  );
}

export function TanstackClientPaginationDemo() {
  const data = useMemo(() => RESOURCE_DATA, []);

  const columns = useMemo(() => {
    const columnHelper = createColumnHelper<Resource>();

    return [
      columnHelper.accessor("resourceName", {
        header: "Resource Name",
        minSize: 100,
        size: 300,
        cell: (props) => (
          <span className="line-clamp-1">{props.getValue()}</span>
        ),
      }),
      columnHelper.accessor("status", {
        minSize: 100,
        header: "Status",
        cell: (row) => <Badge>{row.getValue()}</Badge>,
      }),
      columnHelper.accessor("type", { header: "Type", minSize: 100 }),
      columnHelper.accessor("size", { header: "Size", minSize: 100 }),
      columnHelper.accessor("read", { header: "Read", minSize: 100 }),
      columnHelper.accessor("write", { header: "Write", minSize: 100 }),
      createFillerColumn<Resource>(),
    ];
  }, []);

  const table = useReactTable({
    columns,
    data,
    getCoreRowModel: getCoreRowModel(),
    columnResizeMode: "onChange",
    enableColumnResizing: true,
    enableSorting: false,
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageIndex: 0,
        pageSize: 5,
      },
    },
    getRowId: (row) => row.id,
  });

  return (
    <div className="space-y-2 max-w-full">
      <TanstackTable.ColumnFilter table={table} />
      <LayerCard className="overflow-x-auto">
        <TanstackTable table={table} className="text-sm" />
      </LayerCard>
      <TanstackTable.ClientPagination
        table={table}
        pageSizeOptions={[5, 10, 15]}
      />
    </div>
  );
}

export function TanstackSortingDemo() {
  const data = useMemo(() => RESOURCE_DATA, []);

  const columns = useMemo(() => {
    const columnHelper = createColumnHelper<Resource>();

    return [
      columnHelper.accessor("resourceName", {
        header: "Resource Name",
        minSize: 100,
        size: 300,
        cell: (props) => (
          <span className="line-clamp-1">{props.getValue()}</span>
        ),
      }),
      columnHelper.accessor("status", {
        minSize: 100,
        header: "Status",
        cell: (row) => <Badge>{row.getValue()}</Badge>,
      }),
      columnHelper.accessor("type", { header: "Type", minSize: 100 }),
      columnHelper.accessor("size", { header: "Size", minSize: 100 }),
      columnHelper.accessor("read", { header: "Read", minSize: 100 }),
      columnHelper.accessor("write", { header: "Write", minSize: 100 }),
      createFillerColumn<Resource>(),
    ];
  }, []);

  const table = useReactTable({
    columns,
    data,
    getCoreRowModel: getCoreRowModel(),
    columnResizeMode: "onChange",
    enableColumnResizing: true,
    getSortedRowModel: getSortedRowModel(),
    enableSorting: true,
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageIndex: 0,
        pageSize: 5,
      },
    },
    getRowId: (row) => row.id,
  });

  return (
    <div className="space-y-2 max-w-full">
      <TanstackTable.ColumnFilter table={table} />
      <LayerCard className="overflow-x-auto">
        <TanstackTable table={table} className="text-sm" />
      </LayerCard>
      <TanstackTable.ClientPagination
        table={table}
        pageSizeOptions={[5, 10, 15]}
      />
    </div>
  );
}

export function TanstackActionsDemo() {
  const data = useMemo(() => RESOURCE_DATA, []);

  const columns = useMemo(() => {
    const columnHelper = createColumnHelper<Resource>();

    return [
      columnHelper.accessor("resourceName", {
        header: "Resource Name",
        minSize: 100,
        size: 300,
        cell: (props) => (
          <span className="line-clamp-1">{props.getValue()}</span>
        ),
      }),
      columnHelper.accessor("status", {
        minSize: 100,
        header: "Status",
        cell: (row) => <Badge>{row.getValue()}</Badge>,
      }),
      columnHelper.accessor("type", { header: "Type", minSize: 100 }),
      columnHelper.accessor("size", { header: "Size", minSize: 100 }),
      columnHelper.accessor("read", { header: "Read", minSize: 100 }),
      columnHelper.accessor("write", { header: "Write", minSize: 100 }),
      createFillerColumn<Resource>(),
      createActionsColumn<Resource>({
        cell: (row) => {
          return (
            <DropdownMenu>
              <DropdownMenu.Trigger
                render={
                  <Button
                    variant="ghost"
                    size="sm"
                    shape="square"
                    aria-label="More"
                  >
                    <DotsThreeIcon weight="bold" size={20} />
                  </Button>
                }
              />
              <DropdownMenu.Content>
                <DropdownMenu.Item
                  onClick={() => {
                    alert("Removing " + row.row.original.resourceName);
                  }}
                >
                  Remove
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu>
          );
        },
      }),
    ];
  }, []);

  const table = useReactTable({
    columns,
    data,
    getCoreRowModel: getCoreRowModel(),
    columnResizeMode: "onChange",
    enableColumnResizing: true,
    getSortedRowModel: getSortedRowModel(),
    enableSorting: true,
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageIndex: 0,
        pageSize: 5,
      },
    },
    getRowId: (row) => row.id,
  });

  return (
    <div className="space-y-2 max-w-full">
      <TanstackTable.ColumnFilter table={table} />
      <LayerCard className="overflow-x-auto relative">
        <TanstackTable table={table} className="text-sm" />
      </LayerCard>
      <TanstackTable.ClientPagination
        table={table}
        pageSizeOptions={[5, 10, 15]}
      />
    </div>
  );
}

export function TanstackSubRowDemo() {
  const columns = useMemo(() => {
    const columnHelper = createColumnHelper<ResourceWithSubrows>();

    return [
      columnHelper.accessor("resourceName", {
        header: "Resource Name",
        minSize: 100,
        size: 300,
        cell: (props) => (
          <span className="line-clamp-1">{props.getValue()}</span>
        ),
      }),
      columnHelper.accessor("status", {
        minSize: 100,
        header: "Status",
        cell: (row) => <Badge>{row.getValue()}</Badge>,
      }),
      columnHelper.accessor("type", { header: "Type", minSize: 100 }),
      columnHelper.accessor("size", { header: "Size", minSize: 100 }),
      columnHelper.accessor("read", { header: "Read", minSize: 100 }),
      columnHelper.accessor("write", { header: "Write", minSize: 100 }),
    ];
  }, []);

  const table = useReactTable({
    columns,
    data: RESOURCE_DATA_WITH_SUBROWS,
    getCoreRowModel: getCoreRowModel(),
    columnResizeMode: "onChange",
    enableColumnResizing: false,
    enableSorting: false,
    enableExpanding: true,
    getExpandedRowModel: getExpandedRowModel(),
    getSubRows: (row) => row.subRows,
    getRowId: (row) => row.id,
  });

  return (
    <div className="space-y-2 max-w-full">
      <TanstackTable.ColumnFilter table={table} />
      <LayerCard className="overflow-x-auto relative">
        <TanstackTable table={table} showExpandControl={true} className="text-sm" />
      </LayerCard>
    </div>
  );
}

export function TanstackExpandCustomDemo() {
  const columns = useMemo(() => {
    const columnHelper = createColumnHelper<Resource>();

    return [
      columnHelper.accessor("resourceName", {
        header: "Resource Name",
        minSize: 100,
        size: 300,
        cell: (props) => (
          <span className="line-clamp-1">{props.getValue()}</span>
        ),
      }),
      columnHelper.accessor("status", {
        minSize: 100,
        header: "Status",
        cell: (row) => <Badge>{row.getValue()}</Badge>,
      }),
      columnHelper.accessor("type", { header: "Type", minSize: 100 }),
      columnHelper.accessor("size", { header: "Size", minSize: 100 }),
      columnHelper.accessor("read", { header: "Read", minSize: 100 }),
      columnHelper.accessor("write", { header: "Write", minSize: 100 }),
    ];
  }, []);

  const table = useReactTable({
    columns,
    data: RESOURCE_DATA_WITH_SUBROWS,
    getCoreRowModel: getCoreRowModel(),
    columnResizeMode: "onChange",
    enableColumnResizing: false,
    enableSorting: false,
    enableExpanding: true,
    getRowCanExpand: () => true,
    getRowId: (row) => row.id,
  });

  const customRenderer = useCallback((row: Row<Resource>) => {
    return (
      <div className="p-4">
        This is custom component for {row.original.resourceName}
      </div>
    );
  }, []);

  return (
    <div className="space-y-2 max-w-full">
      <TanstackTable.ColumnFilter table={table} />
      <LayerCard className="overflow-x-auto relative">
        <TanstackTable
          table={table}
          showExpandControl
          customExpandChildren={customRenderer}
          className="text-sm"
        />
      </LayerCard>
    </div>
  );
}

export function TanstackSelectionDemo() {
  const [selection, setSelection] = useState<RowSelectionState>({});

  const columns = useMemo(() => {
    const columnHelper = createColumnHelper<Resource>();

    return [
      columnHelper.accessor("resourceName", {
        header: "Resource Name",
        minSize: 100,
        size: 300,
        cell: (props) => (
          <span className="line-clamp-1">{props.getValue()}</span>
        ),
      }),
      columnHelper.accessor("status", {
        minSize: 100,
        header: "Status",
        cell: (row) => <Badge>{row.getValue()}</Badge>,
      }),
      columnHelper.accessor("type", { header: "Type", minSize: 100 }),
      columnHelper.accessor("size", { header: "Size", minSize: 100 }),
      columnHelper.accessor("read", { header: "Read", minSize: 100 }),
      columnHelper.accessor("write", { header: "Write", minSize: 100 }),
    ];
  }, []);

  const table = useReactTable({
    columns,
    data: RESOURCE_DATA_WITH_SUBROWS,
    getCoreRowModel: getCoreRowModel(),
    columnResizeMode: "onChange",
    enableColumnResizing: false,
    enableSorting: false,
    enableRowSelection: true,
    getRowId: (row) => row.id,
    onRowSelectionChange: setSelection,
    state: {
      rowSelection: selection,
    },
  });

  return (
    <div className="space-y-2 max-w-full">
      <TanstackTable.ColumnFilter table={table} />
      <LayerCard className="overflow-x-auto relative">
        <TanstackTable table={table} showSelectionControl className="text-sm" />
      </LayerCard>
    </div>
  );
}
