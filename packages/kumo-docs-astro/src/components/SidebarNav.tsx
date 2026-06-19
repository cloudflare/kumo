import { useState, useEffect, useRef } from "react";
import { cn, Button } from "@cloudflare/kumo";
import {
  CaretDownIcon,
  MagnifyingGlassIcon,
  XIcon,
} from "@phosphor-icons/react";
import { KumoMenuIcon } from "./KumoMenuIcon";
import { SearchDialog } from "./SearchDialog";
import { ThemeToggle } from "./ThemeToggle";

interface NavItem {
  label: string;
  href: string;
}

function normalizePathname(pathname: string) {
  if (!pathname) return "/";
  if (pathname === "/") return "/";
  return pathname.replace(/\/+$/, "");
}

function isActivePath(activePath: string, href: string) {
  const normalized = normalizePathname(href);
  return activePath === normalized || activePath.startsWith(normalized + "/");
}

function isCurrentPath(activePath: string, href: string) {
  return activePath === normalizePathname(href);
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
  { label: "Changelog", href: "/changelog" },
];

const componentItems: NavItem[] = [
  { label: "Autocomplete", href: "/components/autocomplete" },
  { label: "Badge", href: "/components/badge" },
  { label: "Banner", href: "/components/banner" },
  { label: "Breadcrumbs", href: "/components/breadcrumbs" },
  { label: "Button", href: "/components/button" },
  { label: "Checkbox", href: "/components/checkbox" },
  { label: "Clipboard Text", href: "/components/clipboard-text" },
  { label: "Cloudflare Logo", href: "/components/cloudflare-logo" },
  { label: "CodeHighlighted", href: "/components/code-highlighted" },
  { label: "Collapsible", href: "/components/collapsible" },
  { label: "Combobox", href: "/components/combobox" },
  { label: "Command Palette", href: "/components/command-palette" },
  { label: "Date Picker", href: "/components/date-picker" },
  { label: "Dialog", href: "/components/dialog" },
  { label: "Dropdown", href: "/components/dropdown" },
  { label: "Empty", href: "/components/empty" },
  { label: "Flow", href: "/components/flow" },
  { label: "Grid", href: "/components/grid" },
  { label: "Input", href: "/components/input" },
  { label: "InputArea", href: "/components/input-area" },
  { label: "InputGroup", href: "/components/input-group" },
  { label: "Label", href: "/components/label" },
  { label: "Layer Card", href: "/components/layer-card" },
  { label: "Link", href: "/components/link" },
  { label: "Loader", href: "/components/loader" },
  { label: "MenuBar", href: "/components/menu-bar" },
  { label: "Meter", href: "/components/meter" },
  { label: "Pagination", href: "/components/pagination" },
  { label: "Popover", href: "/components/popover" },
  { label: "Radio", href: "/components/radio" },
  { label: "Select", href: "/components/select" },
  { label: "Sensitive Input", href: "/components/sensitive-input" },
  { label: "Sidebar", href: "/components/sidebar" },
  { label: "Skeleton Line", href: "/components/skeleton-line" },
  { label: "Switch", href: "/components/switch" },
  { label: "Table", href: "/components/table" },
  { label: "Table of Contents", href: "/components/table-of-contents" },
  { label: "Tabs", href: "/components/tabs" },
  { label: "Text", href: "/components/text" },
  { label: "Toast", href: "/components/toast" },
  { label: "Tooltip", href: "/components/tooltip" },
];

const chartItems: NavItem[] = [
  { label: "Charts", href: "/charts" },
  { label: "Colors", href: "/charts/colors" },
  { label: "Timeseries", href: "/charts/timeseries" },
  { label: "Sankey", href: "/charts/sankey" },
  { label: "Custom Chart", href: "/charts/custom" },
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
  "block rounded-lg text-kumo-subtle hover:text-kumo-default hover:bg-kumo-tint p-2 my-[.05rem] cursor-pointer transition-colors motion-reduce:transition-none no-underline relative z-10 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-kumo-brand";
const LI_ACTIVE_STYLE = "font-semibold text-kumo-default bg-kumo-tint";
const MOBILE_DRAWER_ID = "kumo-mobile-navigation-drawer";
const MOBILE_DRAWER_TITLE_ID = "kumo-mobile-navigation-title";
const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
  '[contenteditable="true"]',
].join(",");

function getFocusableElements(container: HTMLElement) {
  return Array.from(
    container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
  ).filter((element) => {
    if (element.closest("[inert]") || element.closest('[aria-hidden="true"]')) {
      return false;
    }

    const style = window.getComputedStyle(element);
    return style.display !== "none" && style.visibility !== "hidden";
  });
}

function preventPointerFocus(e: React.MouseEvent<HTMLElement>) {
  e.preventDefault();
}

interface SidebarNavProps {
  currentPath: string;
}

export function SidebarNav({ currentPath }: SidebarNavProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [componentsOpen, setComponentsOpen] = useState(true);
  const [chartsOpen, setChartsOpen] = useState(true);
  const [blocksOpen, setBlocksOpen] = useState(true);

  const activePath = normalizePathname(currentPath);

  const [searchOpen, setSearchOpen] = useState(false);

  // Refs for scroll containers
  const mobileScrollRef = useRef<HTMLDivElement>(null);
  const desktopScrollRef = useRef<HTMLDivElement>(null);
  const mobileHeaderRef = useRef<HTMLDivElement>(null);
  const mobileMenuTriggerRef = useRef<HTMLButtonElement>(null);
  const mobileDrawerRef = useRef<HTMLElement>(null);
  const mobileCloseButtonRef = useRef<HTMLButtonElement>(null);
  const wasMobileMenuOpenRef = useRef(false);

  const toggleSidebar = () => setSidebarOpen((v) => !v);
  const openMobileMenu = () => setMobileMenuOpen(true);
  const closeMobileMenu = () => setMobileMenuOpen(false);

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

  // Save scroll position on scroll and navigation
  useEffect(() => {
    const STORAGE_KEY = "kumo-sidebar-scroll";

    // Save scroll position before navigation
    const handleBeforeUnload = () => {
      const scrollPosition =
        mobileScrollRef.current?.scrollTop ||
        desktopScrollRef.current?.scrollTop ||
        0;
      sessionStorage.setItem(STORAGE_KEY, scrollPosition.toString());
    };

    // Save on scroll for more reliable restoration
    const handleScroll = (e: Event) => {
      const target = e.target as HTMLElement;
      sessionStorage.setItem(STORAGE_KEY, target.scrollTop.toString());
    };

    // Listen for navigation events
    window.addEventListener("beforeunload", handleBeforeUnload);

    // Attach scroll listeners to both containers
    const mobileContainer = mobileScrollRef.current;
    const desktopContainer = desktopScrollRef.current;

    if (mobileContainer) {
      mobileContainer.addEventListener("scroll", handleScroll);
    }
    if (desktopContainer) {
      desktopContainer.addEventListener("scroll", handleScroll);
    }

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      if (mobileContainer) {
        mobileContainer.removeEventListener("scroll", handleScroll);
      }
      if (desktopContainer) {
        desktopContainer.removeEventListener("scroll", handleScroll);
      }
    };
  }, []);

  useEffect(() => {
    if (!mobileMenuOpen) {
      if (wasMobileMenuOpenRef.current) {
        mobileMenuTriggerRef.current?.focus({ preventScroll: true });
      }
      wasMobileMenuOpenRef.current = false;
      return;
    }

    wasMobileMenuOpenRef.current = true;

    if (searchOpen) return;

    const drawer = mobileDrawerRef.current;
    if (!drawer) return;

    const focusInitialElement = () => {
      const initialElement =
        mobileCloseButtonRef.current ??
        getFocusableElements(drawer)[0] ??
        drawer;
      initialElement.focus({ preventScroll: true });
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        closeMobileMenu();
        return;
      }

      if (e.key !== "Tab") return;

      const focusableElements = getFocusableElements(drawer);
      if (focusableElements.length === 0) {
        e.preventDefault();
        drawer.focus({ preventScroll: true });
        return;
      }

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];
      const activeElement = document.activeElement;

      if (!drawer.contains(activeElement)) {
        e.preventDefault();
        firstElement.focus({ preventScroll: true });
        return;
      }

      if (e.shiftKey && activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus({ preventScroll: true });
        return;
      }

      if (!e.shiftKey && activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus({ preventScroll: true });
      }
    };

    focusInitialElement();
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [mobileMenuOpen, searchOpen]);

  useEffect(() => {
    if (!mobileMenuOpen) return;

    const backgroundElements = [
      document.querySelector<HTMLElement>(".docs-skip-link"),
      mobileHeaderRef.current,
      document.getElementById("main-content"),
    ].filter((element): element is HTMLElement => Boolean(element));

    const previousState = backgroundElements.map((element) => ({
      element,
      ariaHidden: element.getAttribute("aria-hidden"),
      hadAriaHidden: element.hasAttribute("aria-hidden"),
      hadInert: element.hasAttribute("inert"),
    }));

    for (const element of backgroundElements) {
      element.setAttribute("aria-hidden", "true");
      element.setAttribute("inert", "");
    }

    return () => {
      for (const {
        element,
        ariaHidden,
        hadAriaHidden,
        hadInert,
      } of previousState) {
        if (hadAriaHidden && ariaHidden !== null) {
          element.setAttribute("aria-hidden", ariaHidden);
        } else {
          element.removeAttribute("aria-hidden");
        }

        if (!hadInert) {
          element.removeAttribute("inert");
        }
      }
    };
  }, [mobileMenuOpen]);

  // Shared nav content for both mobile and desktop. IDs include the panel
  // context because both nav trees are mounted in the DOM at the same time.
  const renderNavContent = (panelId: "mobile" | "desktop") => {
    const componentsListId = `kumo-${panelId}-components-nav`;
    const chartsListId = `kumo-${panelId}-charts-nav`;
    const blocksListId = `kumo-${panelId}-blocks-nav`;

    return (
      <>
        <button
          onClick={() => setSearchOpen(true)}
          className="mb-3 flex w-full items-center gap-2 rounded-lg bg-kumo-control px-3 py-2 text-sm text-kumo-subtle ring-1 ring-kumo-line transition-[background-color,color,box-shadow] hover:ring-kumo-hairline focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-kumo-brand motion-reduce:transition-none"
        >
          <MagnifyingGlassIcon
            size={16}
            className="shrink-0"
            aria-hidden="true"
            focusable="false"
          />
          <span>Search...</span>
        </button>

        <ul className="flex flex-col gap-px">
          {staticPages.map((item) => {
            const isActive = isActivePath(activePath, item.href);
            const isCurrent = isCurrentPath(activePath, item.href);

            return (
              <li key={item.href}>
                <a
                  href={item.href}
                  aria-current={isCurrent ? "page" : undefined}
                  onMouseDown={preventPointerFocus}
                  className={cn(LI_STYLE, isActive && LI_ACTIVE_STYLE)}
                >
                  {item.label}
                </a>
              </li>
            );
          })}
        </ul>

        <div className="my-4 border-b border-kumo-hairline" />

        <div className="mb-4">
          {/* Components Section */}
          <button
            type="button"
            aria-expanded={componentsOpen}
            aria-controls={componentsListId}
            className="flex w-full cursor-pointer items-center justify-between rounded-lg px-2 py-2 text-sm font-medium text-kumo-default transition-colors hover:bg-kumo-tint focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-kumo-brand motion-reduce:transition-none"
            onClick={() => setComponentsOpen(!componentsOpen)}
          >
            <span>Components</span>
            <CaretDownIcon
              size={12}
              className={cn(
                "text-kumo-subtle transition-transform duration-200 motion-reduce:transition-none",
                !componentsOpen && "-rotate-90",
              )}
              aria-hidden="true"
              focusable="false"
            />
          </button>
          <ul
            id={componentsListId}
            aria-hidden={!componentsOpen}
            inert={!componentsOpen}
            className={cn(
              "mt-1 flex flex-col gap-px overflow-y-hidden overflow-x-visible transition-[max-height,opacity] duration-300 ease-in-out motion-reduce:transition-none",
              componentsOpen
                ? "max-h-[2000px] opacity-100"
                : "max-h-0 opacity-0",
            )}
          >
            {componentItems.map((item) => {
              const isCurrent = isCurrentPath(activePath, item.href);

              return (
                <li key={item.href}>
                  <a
                    href={item.href}
                    aria-current={isCurrent ? "page" : undefined}
                    onMouseDown={preventPointerFocus}
                    className={cn(
                      LI_STYLE,
                      "pl-4",
                      isCurrent && LI_ACTIVE_STYLE,
                    )}
                  >
                    {item.label}
                  </a>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="mb-4">
          <button
            type="button"
            aria-expanded={chartsOpen}
            aria-controls={chartsListId}
            className="flex w-full cursor-pointer items-center justify-between rounded-lg px-2 py-2 text-sm font-medium text-kumo-default transition-colors hover:bg-kumo-tint focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-kumo-brand motion-reduce:transition-none"
            onClick={() => setChartsOpen(!chartsOpen)}
          >
            <span>Charts</span>
            <CaretDownIcon
              size={12}
              className={cn(
                "text-kumo-subtle transition-transform duration-200 motion-reduce:transition-none",
                !chartsOpen && "-rotate-90",
              )}
              aria-hidden="true"
              focusable="false"
            />
          </button>
          <ul
            id={chartsListId}
            aria-hidden={!chartsOpen}
            inert={!chartsOpen}
            className={cn(
              "mt-1 flex flex-col gap-px overflow-y-hidden overflow-x-visible transition-[max-height,opacity] duration-300 ease-in-out motion-reduce:transition-none",
              chartsOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0",
            )}
          >
            {chartItems.map((item) => {
              const isCurrent = isCurrentPath(activePath, item.href);

              return (
                <li key={item.href}>
                  <a
                    href={item.href}
                    aria-current={isCurrent ? "page" : undefined}
                    onMouseDown={preventPointerFocus}
                    className={cn(
                      LI_STYLE,
                      "pl-4",
                      isCurrent && LI_ACTIVE_STYLE,
                    )}
                  >
                    {item.label}
                  </a>
                </li>
              );
            })}
          </ul>
        </div>

        <div>
          {/* Blocks Section */}
          <button
            type="button"
            aria-expanded={blocksOpen}
            aria-controls={blocksListId}
            className="flex w-full cursor-pointer items-center justify-between rounded-lg px-2 py-2 text-sm font-medium text-kumo-default transition-colors hover:bg-kumo-tint focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-kumo-brand motion-reduce:transition-none"
            onClick={() => setBlocksOpen(!blocksOpen)}
          >
            <span>Blocks</span>
            <CaretDownIcon
              size={12}
              className={cn(
                "text-kumo-subtle transition-transform duration-200 motion-reduce:transition-none",
                !blocksOpen && "-rotate-90",
              )}
              aria-hidden="true"
              focusable="false"
            />
          </button>
          <ul
            id={blocksListId}
            aria-hidden={!blocksOpen}
            inert={!blocksOpen}
            className={cn(
              "mt-1 flex flex-col gap-px overflow-y-hidden overflow-x-visible transition-[max-height,opacity] duration-300 ease-in-out motion-reduce:transition-none",
              blocksOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0",
            )}
          >
            {blockItems.map((item) => {
              const isCurrent = isCurrentPath(activePath, item.href);

              return (
                <li key={item.href}>
                  <a
                    href={item.href}
                    aria-current={isCurrent ? "page" : undefined}
                    onMouseDown={preventPointerFocus}
                    className={cn(
                      LI_STYLE,
                      "pl-4",
                      isCurrent && LI_ACTIVE_STYLE,
                    )}
                  >
                    {item.label}
                  </a>
                </li>
              );
            })}
          </ul>
        </div>
      </>
    );
  };

  return (
    <>
      {/* Mobile header bar with hamburger */}
      <div
        ref={mobileHeaderRef}
        className={cn(
          "fixed inset-x-0 top-0 z-50 flex h-12 items-center justify-between border-b border-kumo-hairline bg-kumo-canvas px-3 md:hidden",
        )}
      >
        <Button
          ref={mobileMenuTriggerRef}
          variant="ghost"
          shape="square"
          aria-label="Open menu"
          aria-controls={MOBILE_DRAWER_ID}
          aria-expanded={mobileMenuOpen}
          onClick={openMobileMenu}
        >
          <KumoMenuIcon />
        </Button>
        <h1 className="text-base font-medium">Kumo</h1>
        <ThemeToggle />
      </div>

      {/* Mobile slide-out drawer */}
      <aside
        ref={mobileDrawerRef}
        id={MOBILE_DRAWER_ID}
        role="dialog"
        aria-modal={mobileMenuOpen}
        aria-labelledby={MOBILE_DRAWER_TITLE_ID}
        aria-hidden={!mobileMenuOpen}
        inert={!mobileMenuOpen}
        tabIndex={-1}
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-kumo-hairline bg-kumo-canvas md:hidden",
          "transition-transform duration-300 will-change-transform motion-reduce:transition-none motion-reduce:will-change-auto",
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-12 flex-none items-center justify-between border-b border-kumo-hairline px-3">
          <h1 id={MOBILE_DRAWER_TITLE_ID} className="text-base font-medium">
            Kumo
          </h1>
          <Button
            ref={mobileCloseButtonRef}
            variant="ghost"
            shape="square"
            aria-label="Close menu"
            onClick={closeMobileMenu}
          >
            <XIcon size={20} aria-hidden="true" focusable="false" />
          </Button>
        </div>
        <div
          ref={mobileScrollRef}
          data-sidebar-scroll="mobile"
          className="min-h-0 grow overflow-y-auto overscroll-contain px-3 py-4 text-sm text-kumo-subtle"
          style={{ scrollBehavior: "auto" }}
        >
          {renderNavContent("mobile")}
        </div>
      </aside>

      {/* Desktop: Left rail that always stays put */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 hidden w-12 bg-kumo-canvas ated md:block",
          "border-r border-kumo-hairline",
        )}
      >
        <div className="relative h-12 border-b border-kumo-hairline">
          <div className="absolute inset-0 grid place-items-center">
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
      <div className="pointer-events-none fixed top-0 left-12 z-50 hidden h-12 items-center px-3 font-medium select-none md:flex">
        <h1 className="text-base">Kumo</h1>
      </div>

      {/* Desktop: Sliding panel that opens to the right of the rail */}
      <aside
        data-sidebar-open={sidebarOpen}
        aria-hidden={!sidebarOpen}
        inert={!sidebarOpen}
        className={cn(
          "fixed inset-y-0 left-12 z-40 hidden w-64 flex-col bg-kumo-canvas md:flex",
          "transition-transform duration-300 ease-out will-change-transform motion-reduce:transition-none motion-reduce:will-change-auto",
          sidebarOpen
            ? "translate-x-0 border-r border-kumo-hairline"
            : "-translate-x-full",
        )}
      >
        <div className="h-12 flex-none border-b border-kumo-hairline" />

        <div
          ref={desktopScrollRef}
          data-sidebar-scroll="desktop"
          className="min-h-0 grow overflow-y-auto overscroll-contain px-3 py-4 text-sm text-kumo-subtle"
        >
          {renderNavContent("desktop")}
        </div>
      </aside>

      {/* Search Dialog */}
      <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
    </>
  );
}
