import { useState, useEffect } from "react";
import { cn, Button } from "@cloudflare/kumo";
import {
  CaretDownIcon,
  MagnifyingGlassIcon,
  XIcon,
} from "@phosphor-icons/react";
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
  "block rounded-lg text-kumo-strong hover:text-kumo-default hover:bg-kumo-tint p-2 my-[.05rem] cursor-pointer transition-colors no-underline relative z-10";
const LI_ACTIVE_STYLE = "font-semibold text-kumo-default bg-kumo-tint";

interface SidebarNavProps {
  currentPath: string;
}

export function SidebarNav({ currentPath }: SidebarNavProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [componentsOpen, setComponentsOpen] = useState(true);
  const [blocksOpen, setBlocksOpen] = useState(true);

  const [searchOpen, setSearchOpen] = useState(false);

  const toggleSidebar = () => setSidebarOpen((v) => !v);
  const toggleMobileMenu = () => setMobileMenuOpen((v) => !v);

  // Keyboard shortcut: Cmd+K / Ctrl+K + custom event from headers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    const handleOpenSearch = () => setSearchOpen(true);

    document.addEventListener("keydown", handleKeyDown);
    window.addEventListener("kumo:open-search", handleOpenSearch);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("kumo:open-search", handleOpenSearch);
    };
  }, []);

  // Shared nav content for both mobile and desktop
  const navContent = (
    <>
      <button
        onClick={() => setSearchOpen(true)}
        className="mb-3 flex w-full items-center gap-2 rounded-lg bg-kumo-control px-3 py-2 text-sm text-kumo-subtle ring-1 ring-kumo-line transition-all hover:ring-kumo-ring"
      >
        <MagnifyingGlassIcon size={16} className="shrink-0" />
        <span>Search...</span>
      </button>

      <ul className="flex flex-col gap-px">
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

      <div className="my-4 border-b border-kumo-line" />

      <div className="mb-4">
        {/* Components Section */}
        <button
          type="button"
          className="flex w-full cursor-pointer items-center justify-between rounded-lg px-2 py-2 text-sm font-medium text-kumo-default transition-colors hover:bg-kumo-tint"
          onClick={() => setComponentsOpen(!componentsOpen)}
        >
          <span>Components</span>
          <CaretDownIcon
            size={12}
            className={cn(
              "text-kumo-subtle transition-transform duration-200",
              !componentsOpen && "-rotate-90",
            )}
          />
        </button>
        <ul
          className={cn(
            "flex flex-col gap-px overflow-hidden transition-all duration-300 ease-in-out mt-1",
            componentsOpen ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0",
          )}
        >
          {componentItems.map((item) => (
            <li key={item.href}>
              <a
                href={item.href}
                className={cn(
                  LI_STYLE,
                  "pl-4",
                  currentPath === item.href && LI_ACTIVE_STYLE,
                )}
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </div>

      <div>
        {/* Blocks Section */}
        <button
          type="button"
          className="flex w-full cursor-pointer items-center justify-between rounded-lg px-2 py-2 text-sm font-medium text-kumo-default transition-colors hover:bg-kumo-tint"
          onClick={() => setBlocksOpen(!blocksOpen)}
        >
          <span>Blocks</span>
          <CaretDownIcon
            size={12}
            className={cn(
              "text-kumo-subtle transition-transform duration-200",
              !blocksOpen && "-rotate-90",
            )}
          />
        </button>
        <ul
          className={cn(
            "flex flex-col gap-px overflow-hidden transition-all duration-300 ease-in-out mt-1",
            blocksOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0",
          )}
        >
          {blockItems.map((item) => (
            <li key={item.href}>
              <a
                href={item.href}
                className={cn(
                  LI_STYLE,
                  "pl-4",
                  currentPath === item.href && LI_ACTIVE_STYLE,
                )}
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile header bar with hamburger */}
      <div
        className={cn(
          "fixed inset-x-0 top-0 z-50 flex h-[49px] items-center justify-between border-b border-kumo-line bg-kumo-elevated px-3 md:hidden",
        )}
      >
        <Button
          variant="ghost"
          shape="square"
          aria-label="Open menu"
          onClick={toggleMobileMenu}
        >
          <KumoMenuIcon />
        </Button>
        <h1 className="text-base font-medium">Kumo</h1>
        {/* Spacer to center the title */}
        <div className="size-9" />
      </div>

      {/* Mobile slide-out drawer */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-kumo-line bg-kumo-elevated md:hidden",
          "transition-transform duration-300 will-change-transform",
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-[49px] flex-none items-center justify-between border-b border-kumo-line px-3">
          <h1 className="text-base font-medium">Kumo</h1>
          <Button
            variant="ghost"
            shape="square"
            aria-label="Close menu"
            onClick={toggleMobileMenu}
          >
            <XIcon size={20} />
          </Button>
        </div>
        <div className="min-h-0 grow overflow-y-auto overscroll-contain px-3 py-4 text-sm text-kumo-strong">
          {navContent}
        </div>
      </aside>

      {/* Desktop: Left rail that always stays put */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 hidden w-12 bg-kumo-elevated md:block",
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

      {/* Desktop: Kumo brand label - always visible, panel slides behind it */}
      <div className="pointer-events-none fixed top-0 left-12 z-50 hidden h-[49px] items-center px-3 font-medium select-none md:flex">
        <h1 className="text-base">Kumo</h1>
      </div>

      {/* Desktop: Sliding panel that opens to the right of the rail */}
      <aside
        data-sidebar-open={sidebarOpen}
        className={cn(
          "fixed inset-y-0 left-12 z-40 hidden w-64 flex-col bg-kumo-elevated md:flex",
          "transition-transform duration-300 ease-out will-change-transform",
          sidebarOpen
            ? "translate-x-0 border-r border-kumo-line"
            : "-translate-x-full",
        )}
      >
        <div className="h-[49px] flex-none border-b border-kumo-line" />

        <div className="min-h-0 grow overflow-y-auto overscroll-contain px-3 py-4 text-sm text-kumo-strong">
          {navContent}
        </div>
      </aside>

      {/* Search Dialog */}
      <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
    </>
  );
}
