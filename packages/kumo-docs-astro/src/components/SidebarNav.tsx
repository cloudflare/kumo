import { useState, useEffect } from "react";
import { cn, Button } from "@cloudflare/kumo";
import { CaretDownIcon, MagnifyingGlassIcon } from "@phosphor-icons/react";
import { KumoMenuIcon } from "./KumoMenuIcon";
import { SearchDialog } from "./SearchDialog";

interface NavItem {
  label: string;
  href: string;
}

const staticPages: NavItem[] = [
  { label: "Home", href: "/" },
  { label: "Installation", href: "/installation" },
  { label: "Contributing", href: "/contributing" },
  { label: "Colors", href: "/colors" },
  { label: "Accessibility", href: "/accessibility" },
  { label: "Figma Resources", href: "/figma" },
  { label: "CLI", href: "/cli" },
  { label: "Registry", href: "/registry" },
  { label: "Streaming UI", href: "/streaming" },
  { label: "Components vs Blocks", href: "/components-vs-blocks" },
];

const componentItems: NavItem[] = [
  { label: "Badge", href: "/components/badge" },
  { label: "Banner", href: "/components/banner" },
  { label: "Breadcrumbs", href: "/components/breadcrumbs" },
  { label: "Button", href: "/components/button" },
  { label: "Checkbox", href: "/components/checkbox" },
  { label: "Clipboard Text", href: "/components/clipboard-text" },
  { label: "Cloudflare Logo", href: "/components/cloudflare-logo" },
  { label: "Code", href: "/components/code" },
  { label: "Collapsible", href: "/components/collapsible" },
  { label: "Combobox", href: "/components/combobox" },
  { label: "Command Palette", href: "/components/command-palette" },
  { label: "Date Range Picker", href: "/components/date-range-picker" },
  { label: "Dialog", href: "/components/dialog" },
  { label: "Dropdown", href: "/components/dropdown" },
  { label: "Empty", href: "/components/empty" },
  { label: "Grid", href: "/components/grid" },
  { label: "Input", href: "/components/input" },
  { label: "Label", href: "/components/label" },
  { label: "Layer Card", href: "/components/layer-card" },
  { label: "Link", href: "/components/link" },
  { label: "Loader", href: "/components/loader" },
  { label: "MenuBar", href: "/components/menubar" },
  { label: "Meter", href: "/components/meter" },
  { label: "Pagination", href: "/components/pagination" },
  { label: "Popover", href: "/components/popover" },
  { label: "Radio", href: "/components/radio" },
  { label: "Select", href: "/components/select" },
  { label: "Sensitive Input", href: "/components/sensitive-input" },
  { label: "Skeleton Line", href: "/components/skeleton-line" },
  { label: "Surface", href: "/components/surface" },
  { label: "Switch", href: "/components/switch" },
  { label: "Table", href: "/components/table" },
  { label: "Tabs", href: "/components/tabs" },
  { label: "Text", href: "/components/text" },
  { label: "Toast", href: "/components/toast" },
  { label: "Tooltip", href: "/components/tooltip" },
];

// Blocks are CLI-installed components that you own and can customize
// Use `npx @cloudflare/kumo blocks` to see available blocks
// Use `npx @cloudflare/kumo add <block>` to install
const blockItems: NavItem[] = [
  { label: "Page Header", href: "/blocks/page-header" },
  { label: "Resource List", href: "/blocks/resource-list" },
  { label: "Delete Resource", href: "/blocks/delete-resource" },
];

// Build info injected via Vite define in astro.config.mjs
declare const __DOCS_VERSION__: string;
declare const __BUILD_COMMIT__: string;
declare const __BUILD_DATE__: string;

const LI_STYLE =
  "block rounded-lg text-kumo-strong hover:text-kumo-default hover:bg-kumo-control p-2 my-[.05rem] cursor-pointer transition-colors no-underline relative z-10";
const LI_ACTIVE_STYLE = "font-semibold text-kumo-default bg-kumo-control";

interface SidebarNavProps {
  currentPath: string;
}

export function SidebarNav({ currentPath }: SidebarNavProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [componentsOpen, setComponentsOpen] = useState(true);
  const [blocksOpen, setBlocksOpen] = useState(true);

  const [searchOpen, setSearchOpen] = useState(false);

  const toggleSidebar = () => setSidebarOpen((v) => !v);

  // Keyboard shortcut: Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <>
      {/* Left rail that always stays put */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-12 bg-kumo-elevated",
          "border-r border-kumo-line",
        )}
      >
        <div className="relative h-[49px] border-b border-kumo-line">
          <div className="absolute top-2 right-1">
            <Button
              variant="ghost"
              shape="square"
              aria-label="Toggle sidebar"
              aria-pressed={sidebarOpen}
              onClick={toggleSidebar}
            >
              <KumoMenuIcon />
            </Button>
          </div>
        </div>
      </div>

      {/* Kumo brand label: only visible when sidebar is closed */}
      <div
        className={cn(
          "pointer-events-none fixed top-0 left-12 z-50 flex h-[49px] items-center px-4 font-medium transition-opacity duration-300 select-none",
          sidebarOpen ? "opacity-0" : "opacity-100",
        )}
      >
        <h1 className="flex gap-2 text-base">
          <span>Kumo</span>
        </h1>
      </div>

      {/* Sliding panel that opens to the right of the rail */}
      <aside
        data-sidebar-open={sidebarOpen}
        className={cn(
          "fixed inset-y-0 left-12 z-40 flex w-64 flex-col bg-kumo-elevated backdrop-blur",
          "transition-transform duration-300 will-change-transform",
          sidebarOpen
            ? "translate-x-0 border-r border-kumo-line"
            : "-translate-x-full",
        )}
      >
        {/* Panel header with Kumo title and search button */}
        <div
          className={cn(
            "flex h-[49px] flex-none items-center gap-3 px-3",
            "border-b border-kumo-line",
          )}
        >
          <h1 className="shrink-0 text-base font-medium">Kumo</h1>
          <button
            onClick={() => setSearchOpen(true)}
            className="flex min-w-0 flex-1 items-center gap-2 rounded-md border border-kumo-line bg-kumo-control px-2 py-1 text-sm text-kumo-subtle transition-colors hover:bg-kumo-control"
          >
            <MagnifyingGlassIcon size={14} className="shrink-0" />
            <span className="flex-1 truncate text-left text-xs">Search...</span>
            <kbd className="hidden shrink-0 items-center gap-0.5 rounded border border-kumo-line bg-kumo-base px-1 py-0.5 text-[10px] sm:inline-flex">
              ⌘K
            </kbd>
          </button>
        </div>

        <div className="min-h-0 grow overflow-y-auto overscroll-contain p-4 text-sm text-kumo-strong">
          <div>
            <ul className="flex flex-col">
              {staticPages.map((item) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    className={cn(
                      LI_STYLE,
                      currentPath === item.href && LI_ACTIVE_STYLE,
                    )}
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="mb-6">
            {/* Components Section */}
            <h4
              className="mt-4 mb-2 ml-2 flex cursor-pointer items-center justify-between text-xs font-medium text-kumo-subtle uppercase transition-colors select-none hover:text-kumo-default"
              onClick={() => setComponentsOpen(!componentsOpen)}
            >
              <span>Components</span>
              <CaretDownIcon
                size={12}
                weight="bold"
                className={cn(
                  "transition-transform duration-200",
                  componentsOpen && "rotate-180",
                )}
              />
            </h4>
            <ul
              className={cn(
                "flex flex-col overflow-hidden transition-all duration-300 ease-in-out",
                componentsOpen
                  ? "max-h-[2000px] opacity-100"
                  : "max-h-0 opacity-0",
              )}
            >
              {componentItems.map((item) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    className={cn(
                      LI_STYLE,
                      currentPath === item.href && LI_ACTIVE_STYLE,
                    )}
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>

            {/* Blocks Section */}
            <h4
              className="mt-4 mb-2 ml-2 flex cursor-pointer items-center justify-between text-xs font-medium text-kumo-subtle uppercase transition-colors select-none hover:text-kumo-default"
              onClick={() => setBlocksOpen(!blocksOpen)}
            >
              <span>Blocks</span>
              <CaretDownIcon
                size={12}
                weight="bold"
                className={cn(
                  "transition-transform duration-200",
                  blocksOpen && "rotate-180",
                )}
              />
            </h4>
            <ul
              className={cn(
                "flex flex-col overflow-hidden transition-all duration-300 ease-in-out",
                blocksOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0",
              )}
            >
              {blockItems.map((item) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    className={cn(
                      LI_STYLE,
                      currentPath === item.href && LI_ACTIVE_STYLE,
                    )}
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Version badge at bottom of sidebar */}
        <div className="flex-none border-t border-kumo-line p-3 text-xs text-kumo-subtle">
          <span title={`Built: ${__BUILD_DATE__}`}>
            docs v{__DOCS_VERSION__} ({__BUILD_COMMIT__})
          </span>
        </div>
      </aside>

      {/* Search Dialog */}
      <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
    </>
  );
}
