import { useState, useMemo } from "react";
import {
  Badge,
  Button,
  cn,
  DropdownMenu,
  Input,
  LayerCard,
  Pagination,
  Select,
  Table,
  Tooltip,
} from "@cloudflare/kumo";
import {
  Article,
  ChatCircle,
  DotsThree,
  Eye,
  Gear,
  House,
  Images,
  Minus,
  Moon,
  Newspaper,
  Palette,
  PencilSimple,
  Plus,
  PlugsConnected,
  Sun,
  Trash,
  User,
  Users,
  Wrench,
} from "@phosphor-icons/react";

// ---------------------------------------------------------------------------
// WordPress theme token overrides
// ---------------------------------------------------------------------------
const wpThemeStyles = `
[data-theme="wordpress"] {
  /* WP Admin primary brand — the classic blue */
  --color-kumo-brand: #2271b1;
  --color-kumo-brand-hover: #135e96;
  --text-color-kumo-brand: #2271b1;

  /* WP surfaces */
  --color-kumo-base: #ffffff;
  --color-kumo-elevated: #f0f0f1;
  --color-kumo-recessed: #dcdcde;
  --color-kumo-overlay: #ffffff;
  --color-kumo-control: #ffffff;
  --color-kumo-tint: #f0f0f1;
  --color-kumo-fill: #dcdcde;
  --color-kumo-fill-hover: #c3c4c7;
  --color-kumo-contrast: #1d2327;
  --color-kumo-interact: #c3c4c7;

  /* WP borders — very subtle gray */
  --color-kumo-hairline: #c3c4c7;
  --color-kumo-hairline: #2271b1;

  /* WP text hierarchy */
  --text-color-kumo-default: #1d2327;
  --text-color-kumo-strong: #50575e;
  --text-color-kumo-subtle: #787c82;
  --text-color-kumo-inactive: #a7aaad;
  --text-color-kumo-link: #2271b1;

  /* WP semantic colors */
  --color-kumo-info: #72aee6;
  --color-kumo-info-tint: #e7f4fe;
  --color-kumo-success: #00a32a;
  --color-kumo-success-tint: #edfaef;
  --color-kumo-warning: #dba617;
  --color-kumo-warning-tint: #fcf9e8;
  --color-kumo-danger: #d63638;
  --color-kumo-danger-tint: #fcf0f1;
  --text-color-kumo-success: #00a32a;
  --text-color-kumo-danger: #d63638;
  --text-color-kumo-warning: #dba617;
}
`;

// ---------------------------------------------------------------------------
// Sample post data
// ---------------------------------------------------------------------------
interface Post {
  id: string;
  title: string;
  author: string;
  categories: string[];
  tags: string[];
  comments: number;
  date: string;
  status: "published" | "draft" | "pending" | "trash";
}

const samplePosts: Post[] = [
  {
    id: "1",
    title: "Hello World!",
    author: "admin",
    categories: ["Uncategorized"],
    tags: [],
    comments: 1,
    date: "2026-03-10",
    status: "published",
  },
  {
    id: "2",
    title: "Getting Started with KumoPress",
    author: "admin",
    categories: ["Tutorials", "Getting Started"],
    tags: ["kumo", "introduction"],
    comments: 12,
    date: "2026-03-09",
    status: "published",
  },
  {
    id: "3",
    title: "Customizing Your Theme",
    author: "editor",
    categories: ["Design"],
    tags: ["themes", "css", "customization"],
    comments: 5,
    date: "2026-03-08",
    status: "published",
  },
  {
    id: "4",
    title: "Draft: Upcoming Features in KumoPress 2.0",
    author: "admin",
    categories: ["News"],
    tags: ["release", "features"],
    comments: 0,
    date: "2026-03-07",
    status: "draft",
  },
  {
    id: "5",
    title: "Building Blocks with Kumo Components",
    author: "contributor",
    categories: ["Development", "Tutorials"],
    tags: ["components", "react", "blocks"],
    comments: 8,
    date: "2026-03-06",
    status: "published",
  },
  {
    id: "6",
    title: "Performance Optimization Guide",
    author: "admin",
    categories: ["Development"],
    tags: ["performance", "optimization"],
    comments: 3,
    date: "2026-03-05",
    status: "pending",
  },
  {
    id: "7",
    title: "Community Spotlight: March 2026",
    author: "editor",
    categories: ["Community"],
    tags: ["community", "spotlight"],
    comments: 15,
    date: "2026-03-04",
    status: "published",
  },
  {
    id: "8",
    title: "Accessibility Best Practices",
    author: "contributor",
    categories: ["Development", "Accessibility"],
    tags: ["a11y", "aria", "wcag"],
    comments: 7,
    date: "2026-03-03",
    status: "published",
  },
  {
    id: "9",
    title: "Old Migration Notes",
    author: "admin",
    categories: ["Internal"],
    tags: ["migration"],
    comments: 0,
    date: "2026-02-15",
    status: "trash",
  },
  {
    id: "10",
    title: "API Reference Documentation",
    author: "admin",
    categories: ["Documentation"],
    tags: ["api", "reference"],
    comments: 2,
    date: "2026-03-02",
    status: "draft",
  },
];

// ---------------------------------------------------------------------------
// Sidebar nav items
// ---------------------------------------------------------------------------
const sidebarNav = [
  { icon: House, label: "Dashboard", active: false },
  { icon: Article, label: "Posts", active: true },
  { icon: Images, label: "Media", active: false },
  { icon: Newspaper, label: "Pages", active: false },
  { icon: ChatCircle, label: "Comments", active: false },
  { icon: Palette, label: "Appearance", active: false },
  { icon: PlugsConnected, label: "Plugins", active: false },
  { icon: Users, label: "Users", active: false },
  { icon: Wrench, label: "Tools", active: false },
  { icon: Gear, label: "Settings", active: false },
];

// ---------------------------------------------------------------------------
// Status helpers
// ---------------------------------------------------------------------------
function statusBadgeVariant(
  status: Post["status"],
): "primary" | "secondary" | "destructive" | "success" | "outline" {
  switch (status) {
    case "published":
      return "success";
    case "draft":
      return "secondary";
    case "pending":
      return "outline";
    case "trash":
      return "destructive";
  }
}

function statusLabel(status: Post["status"]) {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

// ---------------------------------------------------------------------------
// WP Admin Sidebar Component
// ---------------------------------------------------------------------------
function WPSidebar({ collapsed }: { collapsed: boolean }) {
  return (
    <div
      className={cn(
        "flex h-full flex-col bg-[#1d2327] text-white transition-all duration-300",
        collapsed ? "w-[48px]" : "w-[200px]",
      )}
    >
      {/* WP Logo area */}
      <div className="flex h-[48px] items-center gap-2 border-b border-white/10 px-3">
        {!collapsed && (
          <span className="text-sm font-semibold tracking-wide text-white/90">
            KumoPress
          </span>
        )}
        {collapsed && (
          <span className="mx-auto text-sm font-bold text-white/90">K</span>
        )}
      </div>

      {/* Nav items */}
      <nav className="flex flex-1 flex-col gap-px py-2">
        {sidebarNav.map((item) => (
          <button
            key={item.label}
            type="button"
            className={cn(
              "flex items-center gap-3 px-3 py-2 text-sm transition-colors",
              "hover:bg-white/10",
              item.active
                ? "bg-[#2271b1] text-white"
                : "text-white/70 hover:text-white",
            )}
          >
            <item.icon size={18} weight={item.active ? "fill" : "regular"} />
            {!collapsed && <span>{item.label}</span>}
          </button>
        ))}
      </nav>

      {/* Collapse toggle */}
      <div className="border-t border-white/10 p-2">
        <div className="flex items-center justify-center text-xs text-white/40">
          {!collapsed && "Collapse menu"}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// WP Admin Top Bar
// ---------------------------------------------------------------------------
function WPTopBar({
  darkMode,
  onToggleDarkMode,
}: {
  darkMode: boolean;
  onToggleDarkMode: () => void;
}) {
  return (
    <div className="flex h-[48px] items-center justify-between border-b border-kumo-hairline bg-kumo-elevated px-4">
      <div className="flex items-center gap-4">
        <h1 className="text-lg font-semibold text-kumo-default">Posts</h1>
        <Button variant="primary" size="sm">
          <Plus size={14} weight="bold" />
          Add New Post
        </Button>
      </div>
      <div className="flex items-center gap-2">
        <Input
          aria-label="Search posts"
          placeholder="Search posts..."
          size="sm"
          className="w-[200px]"
        />
        <Tooltip content={darkMode ? "Light mode" : "Dark mode"}>
          <Button
            variant="ghost"
            size="sm"
            shape="square"
            aria-label={darkMode ? "Light mode" : "Dark mode"}
            onClick={onToggleDarkMode}
          >
            {darkMode ? <Sun size={16} /> : <Moon size={16} />}
          </Button>
        </Tooltip>
        <Tooltip content="View site">
          <Button
            variant="ghost"
            size="sm"
            shape="square"
            aria-label="View site"
          >
            <Eye size={16} />
          </Button>
        </Tooltip>
        <Button
          variant="ghost"
          size="sm"
          shape="circle"
          aria-label="User profile"
        >
          <User size={16} />
        </Button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Posts Dashboard Demo
// ---------------------------------------------------------------------------
export function KumoPressDemo() {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [bulkAction, setBulkAction] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(20);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  // Derive status counts
  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { all: samplePosts.length };
    for (const post of samplePosts) {
      counts[post.status] = (counts[post.status] || 0) + 1;
    }
    return counts;
  }, []);

  // Filter posts
  const filteredPosts = useMemo(() => {
    return samplePosts.filter((post) => {
      if (statusFilter !== "all" && post.status !== statusFilter) return false;
      if (categoryFilter !== "all" && !post.categories.includes(categoryFilter))
        return false;
      return true;
    });
  }, [statusFilter, categoryFilter]);

  // Derive unique categories
  const allCategories = useMemo(() => {
    const cats = new Set<string>();
    for (const post of samplePosts) {
      for (const cat of post.categories) {
        cats.add(cat);
      }
    }
    return Array.from(cats).sort();
  }, []);

  // Selection helpers
  const toggleRow = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selectedIds.size === filteredPosts.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredPosts.map((p) => p.id)));
    }
  };

  return (
    <>
      {/* Inject WP theme tokens */}
      <style dangerouslySetInnerHTML={{ __html: wpThemeStyles }} />

      <div
        data-theme="wordpress"
        data-mode={darkMode ? "dark" : undefined}
        className="flex h-[720px] overflow-hidden rounded-xl border border-kumo-hairline bg-kumo-elevated font-sans shadow-lg"
      >
        {/* Sidebar */}
        <div
          className="flex-none cursor-pointer"
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
        >
          <WPSidebar collapsed={sidebarCollapsed} />
        </div>

        {/* Main content */}
        <div className="flex flex-1 flex-col overflow-hidden">
          <WPTopBar
            darkMode={darkMode}
            onToggleDarkMode={() => setDarkMode(!darkMode)}
          />

          <div className="flex-1 overflow-y-auto bg-kumo-elevated p-6">
            {/* Status tabs — the WordPress filter bar */}
            <div className="mb-4 flex items-center gap-1 text-sm">
              {[
                { key: "all", label: "All" },
                { key: "published", label: "Published" },
                { key: "draft", label: "Drafts" },
                { key: "pending", label: "Pending" },
                { key: "trash", label: "Trash" },
              ].map((tab, idx, arr) => (
                <span key={tab.key} className="flex items-center">
                  <button
                    type="button"
                    onClick={() => {
                      setStatusFilter(tab.key);
                      setPage(1);
                    }}
                    className={cn(
                      "transition-colors hover:text-kumo-default",
                      statusFilter === tab.key
                        ? "font-semibold text-kumo-default"
                        : "text-kumo-link",
                    )}
                  >
                    {tab.label}
                    <span className="ml-1 text-kumo-subtle">
                      ({statusCounts[tab.key] || 0})
                    </span>
                  </button>
                  {idx < arr.length - 1 && (
                    <span className="mx-2 text-kumo-subtle">|</span>
                  )}
                </span>
              ))}
            </div>

            {/* Bulk actions bar */}
            <div className="mb-4 flex items-center gap-3">
              <Select
                aria-label="Bulk actions"
                placeholder="Bulk actions"
                className="w-[160px]"
                value={bulkAction}
                onValueChange={(v) => setBulkAction(v as string | null)}
                items={{ edit: "Edit", trash: "Move to Trash" }}
              />
              <Button
                variant="secondary"
                size="sm"
                disabled={!bulkAction || selectedIds.size === 0}
              >
                Apply
              </Button>

              <div className="flex-1" />

              <Select
                aria-label="Filter by category"
                placeholder="All categories"
                className="w-[180px]"
                value={categoryFilter === "all" ? null : categoryFilter}
                onValueChange={(v) => {
                  setCategoryFilter((v as string) || "all");
                  setPage(1);
                }}
                items={allCategories.reduce(
                  (acc, cat) => {
                    acc[cat] = cat;
                    return acc;
                  },
                  {} as Record<string, string>,
                )}
              />
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setCategoryFilter("all");
                  setPage(1);
                }}
              >
                Filter
              </Button>
            </div>

            {/* Posts table */}
            <LayerCard>
              <LayerCard.Primary className="w-full overflow-x-auto p-0">
                <Table layout="fixed">
                  <colgroup>
                    <col style={{ width: "40px" }} />
                    <col />
                    <col style={{ width: "120px" }} />
                    <col style={{ width: "160px" }} />
                    <col style={{ width: "120px" }} />
                    <col style={{ width: "70px" }} />
                    <col style={{ width: "130px" }} />
                    <col style={{ width: "50px" }} />
                  </colgroup>
                  <Table.Header>
                    <Table.Row>
                      <Table.CheckHead
                        checked={
                          filteredPosts.length > 0 &&
                          selectedIds.size === filteredPosts.length
                        }
                        indeterminate={
                          selectedIds.size > 0 &&
                          selectedIds.size < filteredPosts.length
                        }
                        onValueChange={toggleAll}
                        aria-label="Select all posts"
                      />
                      <Table.Head>Title</Table.Head>
                      <Table.Head>Author</Table.Head>
                      <Table.Head>Categories</Table.Head>
                      <Table.Head>Tags</Table.Head>
                      <Table.Head>
                        <span className="flex items-center gap-1">
                          <ChatCircle size={14} />
                        </span>
                      </Table.Head>
                      <Table.Head>Date</Table.Head>
                      <Table.Head />
                    </Table.Row>
                  </Table.Header>
                  <Table.Body>
                    {filteredPosts.length === 0 ? (
                      <Table.Row>
                        <Table.Cell
                          colSpan={8}
                          className="py-12 text-center text-kumo-subtle"
                        >
                          No posts found.
                        </Table.Cell>
                      </Table.Row>
                    ) : (
                      filteredPosts.map((post) => (
                        <Table.Row
                          key={post.id}
                          variant={
                            selectedIds.has(post.id) ? "selected" : "default"
                          }
                        >
                          <Table.CheckCell
                            checked={selectedIds.has(post.id)}
                            onValueChange={() => toggleRow(post.id)}
                            aria-label={`Select "${post.title}"`}
                          />
                          <Table.Cell>
                            <div className="flex flex-col gap-0.5">
                              <span className="font-medium text-kumo-link hover:underline cursor-pointer">
                                {post.title}
                              </span>
                              {post.status !== "published" && (
                                <Badge
                                  variant={statusBadgeVariant(post.status)}
                                >
                                  {statusLabel(post.status)}
                                </Badge>
                              )}
                            </div>
                          </Table.Cell>
                          <Table.Cell>
                            <span className="text-kumo-link cursor-pointer hover:underline">
                              {post.author}
                            </span>
                          </Table.Cell>
                          <Table.Cell>
                            <div className="flex flex-wrap gap-1">
                              {post.categories.map((cat) => (
                                <span
                                  key={cat}
                                  className="text-kumo-link cursor-pointer text-xs hover:underline"
                                >
                                  {cat}
                                </span>
                              ))}
                            </div>
                          </Table.Cell>
                          <Table.Cell>
                            <div className="flex flex-wrap gap-1">
                              {post.tags.length > 0 ? (
                                post.tags.map((tag) => (
                                  <span
                                    key={tag}
                                    className="text-kumo-link cursor-pointer text-xs hover:underline"
                                  >
                                    {tag}
                                  </span>
                                ))
                              ) : (
                                <Minus
                                  size={14}
                                  className="text-kumo-inactive"
                                />
                              )}
                            </div>
                          </Table.Cell>
                          <Table.Cell>
                            <span
                              className={cn(
                                "tabular-nums",
                                post.comments > 0
                                  ? "text-kumo-link"
                                  : "text-kumo-subtle",
                              )}
                            >
                              {post.comments}
                            </span>
                          </Table.Cell>
                          <Table.Cell>
                            <div className="flex flex-col text-xs">
                              <span className="text-kumo-default">
                                {post.status === "published"
                                  ? "Published"
                                  : "Last Modified"}
                              </span>
                              <span className="text-kumo-subtle">
                                {post.date}
                              </span>
                            </div>
                          </Table.Cell>
                          <Table.Cell>
                            <DropdownMenu>
                              <DropdownMenu.Trigger
                                render={
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    shape="square"
                                    aria-label="Post actions"
                                  >
                                    <DotsThree weight="bold" size={16} />
                                  </Button>
                                }
                              />
                              <DropdownMenu.Content>
                                <DropdownMenu.Item icon={PencilSimple}>
                                  Edit
                                </DropdownMenu.Item>
                                <DropdownMenu.Item icon={Eye}>
                                  View
                                </DropdownMenu.Item>
                                <DropdownMenu.Separator />
                                <DropdownMenu.Item
                                  icon={Trash}
                                  variant="danger"
                                >
                                  Trash
                                </DropdownMenu.Item>
                              </DropdownMenu.Content>
                            </DropdownMenu>
                          </Table.Cell>
                        </Table.Row>
                      ))
                    )}
                  </Table.Body>
                </Table>
              </LayerCard.Primary>
            </LayerCard>

            {/* Pagination */}
            <div className="mt-4">
              <Pagination
                page={page}
                setPage={setPage}
                perPage={perPage}
                totalCount={filteredPosts.length}
              >
                <Pagination.Info />
                <Pagination.Separator />
                <Pagination.PageSize
                  value={perPage}
                  onChange={(size) => {
                    setPerPage(size);
                    setPage(1);
                  }}
                  options={[10, 20, 50]}
                />
                <Pagination.Controls />
              </Pagination>
            </div>

            {/* Quick Stats row — inspired by WP dashboard widgets */}
            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <LayerCard>
                <LayerCard.Primary className="p-4">
                  <div className="text-xs font-medium uppercase tracking-wide text-kumo-subtle">
                    Published
                  </div>
                  <div className="mt-1 text-2xl font-bold text-kumo-default">
                    {statusCounts.published || 0}
                  </div>
                </LayerCard.Primary>
              </LayerCard>
              <LayerCard>
                <LayerCard.Primary className="p-4">
                  <div className="text-xs font-medium uppercase tracking-wide text-kumo-subtle">
                    Drafts
                  </div>
                  <div className="mt-1 text-2xl font-bold text-kumo-default">
                    {statusCounts.draft || 0}
                  </div>
                </LayerCard.Primary>
              </LayerCard>
              <LayerCard>
                <LayerCard.Primary className="p-4">
                  <div className="text-xs font-medium uppercase tracking-wide text-kumo-subtle">
                    Total Comments
                  </div>
                  <div className="mt-1 text-2xl font-bold text-kumo-default">
                    {samplePosts.reduce((sum, p) => sum + p.comments, 0)}
                  </div>
                </LayerCard.Primary>
              </LayerCard>
              <LayerCard>
                <LayerCard.Primary className="p-4">
                  <div className="text-xs font-medium uppercase tracking-wide text-kumo-subtle">
                    Categories
                  </div>
                  <div className="mt-1 text-2xl font-bold text-kumo-default">
                    {allCategories.length}
                  </div>
                </LayerCard.Primary>
              </LayerCard>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
