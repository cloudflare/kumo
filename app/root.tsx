import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  Link,
  useLocation,
} from "react-router";
import React, { useEffect, useState } from "react";
import { cn } from "~/components/utils";
import { Button } from "~/components/button/button";
import { KumoMenuIcon } from "~/components/kumo-menu-icon";
import { ThemeToggle } from "~/components/theme-toggle";
import { CaretDownIcon } from "@phosphor-icons/react";

import type { Route } from "./+types/root";
import "./app.css";

export const links: Route.LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=optional",
  },
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html className="bg-neutral-50 dark:bg-black" lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

// -translate-x-2 
const LI_STYLE = `block rounded-lg font-medium !text-neutral-600 dark:text-neutral-200 text-surface hover:text-neutral-800 dark:hover:text-white hover:bg-neutral-200/30 dark:hover:bg-neutral-800/50 p-2 my-[.05rem] cursor-pointer transition-colors no-underline relative z-10`;
const LI_ACTIVE_STYLE = `text-neutral-800 dark:text-white`;

export default function App() {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const toggleSidebar = () => setSidebarOpen((v) => !v);
  const [isDark, setIsDark] = useState(false);
  const [componentsOpen, setComponentsOpen] = useState(true);
  const [blocksOpen, setBlocksOpen] = useState(true);
  const [layoutsOpen, setLayoutsOpen] = useState(true);
  const [activeIndicator, setActiveIndicator] = useState<{ top: number; height: number } | null>(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const navRef = React.useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    // Check if dark mode is enabled
    const isDarkMode = document.documentElement.classList.contains('dark-mode');
    setIsDark(isDarkMode);
  }, []);

  useEffect(() => {
    // Update active indicator position when route changes
    if (!navRef.current) return;
    
    const updateIndicator = () => {
      const activeLink = navRef.current?.querySelector(`[href="${location.pathname}"]`);
      if (activeLink && navRef.current) {
        const navRect = navRef.current.getBoundingClientRect();
        const linkRect = activeLink.getBoundingClientRect();
        
        setActiveIndicator({
          top: linkRect.top - navRect.top,
          height: linkRect.height,
        });
      }
    };

    // Use requestAnimationFrame to avoid layout shift
    if (isInitialLoad) {
      requestAnimationFrame(() => {
        updateIndicator();
        setIsInitialLoad(false);
      });
    } else {
      updateIndicator();
    }
  }, [location.pathname, componentsOpen, blocksOpen, layoutsOpen, isInitialLoad]);

  const toggleTheme = () => {
    const newIsDark = !isDark;
    setIsDark(newIsDark);
    
    if (newIsDark) {
      document.documentElement.classList.add('dark-mode');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark-mode');
      localStorage.setItem('theme', 'light');
    }
  };

  return (
    <div className="min-h-screen">
      {/* Left rail that always stays put */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-12 bg-surface-secondary",
          "border-r border-neutral-200 dark:border-neutral-800"
        )}
      >
        <div className="h-[49px] border-b border-neutral-200 dark:border-neutral-800 relative">
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

      {/* Kumo brand label: fixed next to the rail; stays in same position */}
      <div className="fixed left-12 top-0 z-50 h-[49px] flex items-center px-4 font-medium select-none pointer-events-none">
        <h1 className="flex gap-2 text-base">
          {/* <span>雲</span> */}
          <span>Kumo</span>
        </h1>
      </div>

      {/* Theme toggle: fixed in top right corner */}
      <div className="fixed right-2 top-0 z-50 h-[49px] flex items-center pointer-events-auto">
        <Button
          variant="ghost"
          shape="square"
          aria-label="Toggle theme"
          onClick={toggleTheme}
        >
          <ThemeToggle isDark={isDark} onClick={() => {}} />
        </Button>
      </div>

      {/* Sliding panel that opens to the right of the rail */}
      <aside
        className={cn(
          "fixed inset-y-0 left-12 z-40 w-64 backdrop-blur flex flex-col",
          "transition-transform duration-300 will-change-transform",
          sidebarOpen
            ? "translate-x-0 border-r border-neutral-200 dark:border-neutral-800"
            : "-translate-x-full"
        )}
      >
        {/* Panel header */}
        <div className={cn("h-[49px] px-4 flex items-center font-medium flex-none", "border-b border-neutral-200 dark:border-neutral-800")}>        
          {/* Sidebar */}
        </div>
        <div ref={navRef} className="p-4 text-sm text-neutral-600 overflow-y-auto overscroll-contain grow min-h-0 relative">
          {/* Animated background indicator */}
          {activeIndicator && (
            <div
              className={cn(
                "absolute left-4 right-4 bg-neutral-200/50 dark:bg-neutral-800 rounded-lg pointer-events-none",
                !isInitialLoad && "transition-all duration-300 ease-out"
              )}
              style={{
                top: `${activeIndicator.top}px`,
                height: `${activeIndicator.height}px`,
              }}
            />
          )}
          <div className="relative">
            <ul className="flex flex-col">
              <li>
                <Link 
                  to="/" 
                  prefetch="intent"
                  className={cn(LI_STYLE, location.pathname === "/" && LI_ACTIVE_STYLE)}
                >
                  Home
                </Link>
              </li>
              <li>
                <Link 
                  to="/installation" 
                  prefetch="intent"
                  className={cn(LI_STYLE, location.pathname === "/installation" && LI_ACTIVE_STYLE)}
                >
                  Installation
                </Link>
              </li>
              <li>
                <Link 
                  to="/accessibility" 
                  prefetch="intent"
                  className={cn(LI_STYLE, location.pathname === "/accessibility" && LI_ACTIVE_STYLE)}
                >
                  Accessibility
                </Link>
              </li>
              <li>
                <Link 
                  to="/figma" 
                  prefetch="intent"
                  className={cn(LI_STYLE, location.pathname === "/figma" && LI_ACTIVE_STYLE)}
                >
                  Figma Resources
                </Link>
              </li>
            </ul>
          </div>

          <div className="mb-6">
            <h4 
              className="text-xs mt-4 mb-2 ml-2 font-medium uppercase text-neutral-400 flex items-center justify-between cursor-pointer select-none hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors"
              onClick={() => setComponentsOpen(!componentsOpen)}
            >
              <span>Components</span>
              <CaretDownIcon 
                size={12} 
                weight="bold"
                className={cn("transition-transform duration-200", componentsOpen && "rotate-180")} 
              />
            </h4>
            <ul className={cn(
              "flex flex-col overflow-hidden transition-all duration-300 ease-in-out",
              componentsOpen ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"
            )}>
              <li>
                <Link 
                  to="/components/button"
                  prefetch="intent"
                  className={cn(LI_STYLE, location.pathname === "/components/button" && LI_ACTIVE_STYLE)}
                >
                  Button
                </Link>
              </li>
              <li>
                <Link 
                  to="/components/input" 
                  prefetch="intent"
                  className={cn(LI_STYLE, location.pathname === "/components/input" && LI_ACTIVE_STYLE)}
                >
                  Input
                </Link>
              </li>
              <li>
                <Link 
                  to="/components/select" 
                  prefetch="intent"
                  className={cn(LI_STYLE, location.pathname === "/components/select" && LI_ACTIVE_STYLE)}
                >
                  Select
                </Link>
              </li>
              <li>
                <Link 
                  to="/components/combobox" 
                  prefetch="intent"
                  className={cn(LI_STYLE, location.pathname === "/components/combobox" && LI_ACTIVE_STYLE)}
                >
                  Combobox
                </Link>
              </li>
              <li>
                <Link 
                  to="/components/switch" 
                  prefetch="intent"
                  className={cn(LI_STYLE, location.pathname === "/components/switch" && LI_ACTIVE_STYLE)}
                >
                  Switch
                </Link>
              </li>
              <li>
                <Link 
                  to="/components/field" 
                  prefetch="intent"
                  className={cn(LI_STYLE, location.pathname === "/components/field" && LI_ACTIVE_STYLE)}
                >
                  Field
                </Link>
              </li>
              <li>
                <Link 
                  to="/components/dialog" 
                  prefetch="intent"
                  className={cn(LI_STYLE, location.pathname === "/components/dialog" && LI_ACTIVE_STYLE)}
                >
                  Dialog
                </Link>
              </li>
              <li>
                <Link 
                  to="/components/tooltip" 
                  prefetch="intent"
                  className={cn(LI_STYLE, location.pathname === "/components/tooltip" && LI_ACTIVE_STYLE)}
                >
                  Tooltip
                </Link>
              </li>
              <li>
                <Link 
                  to="/components/dropdown" 
                  prefetch="intent"
                  className={cn(LI_STYLE, location.pathname === "/components/dropdown" && LI_ACTIVE_STYLE)}
                >
                  Dropdown
                </Link>
              </li>
              <li>
                <Link 
                  to="/components/expandable" 
                  prefetch="intent"
                  className={cn(LI_STYLE, location.pathname === "/components/expandable" && LI_ACTIVE_STYLE)}
                >
                  Expandable
                </Link>
              </li>
              <li>
                <Link 
                  to="/components/checkbox" 
                  prefetch="intent"
                  className={cn(LI_STYLE, location.pathname === "/components/checkbox" && LI_ACTIVE_STYLE)}
                >
                  Checkbox
                </Link>
              </li>
              <li>
                <Link 
                  to="/components/layer-card" 
                  prefetch="intent"
                  className={cn(LI_STYLE, location.pathname === "/components/layer-card" && LI_ACTIVE_STYLE)}
                >
                  Layer Card
                </Link>
              </li>
              <li>
                <Link 
                  to="/components/loader" 
                  prefetch="intent"
                  className={cn(LI_STYLE, location.pathname === "/components/loader" && LI_ACTIVE_STYLE)}
                >
                  Loader
                </Link>
              </li>
              <li>
                <Link 
                  to="/components/skeleton-line" 
                  prefetch="intent"
                  className={cn(LI_STYLE, location.pathname === "/components/skeleton-line" && LI_ACTIVE_STYLE)}
                >
                  Skeleton Line
                </Link>
              </li>
              <li>
                <Link 
                  to="/components/menubar" 
                  prefetch="intent"
                  className={cn(LI_STYLE, location.pathname === "/components/menubar" && LI_ACTIVE_STYLE)}
                >
                  MenuBar
                </Link>
              </li>
              <li>
                <Link 
                  to="/components/clipboard-text" 
                  prefetch="intent"
                  className={cn(LI_STYLE, location.pathname === "/components/clipboard-text" && LI_ACTIVE_STYLE)}
                >
                  Clipboard Text
                </Link>
              </li>
              <li>
                <Link 
                  to="/components/surface" 
                  prefetch="intent"
                  className={cn(LI_STYLE, location.pathname === "/components/surface" && LI_ACTIVE_STYLE)}
                >
                  Surface
                </Link>
              </li>
              <li>
                <Link 
                  to="/components/code" 
                  prefetch="intent"
                  className={cn(LI_STYLE, location.pathname === "/components/code" && LI_ACTIVE_STYLE)}
                >
                  Code
                </Link>
              </li>
            </ul>
            <h4 
              className="text-xs mt-4 mb-2 ml-2 font-medium uppercase text-neutral-400 flex items-center justify-between cursor-pointer select-none hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors"
              onClick={() => setBlocksOpen(!blocksOpen)}
            >
              <span>Blocks</span>
              <CaretDownIcon 
                size={12} 
                weight="bold"
                className={cn("transition-transform duration-200", blocksOpen && "rotate-180")} 
              />
            </h4>
            <ul className={cn(
              "flex flex-col overflow-hidden transition-all duration-300 ease-in-out",
              blocksOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
            )}>
              <li>
                <Link 
                  to="/blocks/breadcrumbs" 
                  prefetch="intent"
                  className={cn(LI_STYLE, location.pathname === "/blocks/breadcrumbs" && LI_ACTIVE_STYLE)}
                >
                  Breadcrumbs
                </Link>
              </li>
              <li>
                <Link 
                  to="/blocks/empty" 
                  prefetch="intent"
                  className={cn(LI_STYLE, location.pathname === "/blocks/empty" && LI_ACTIVE_STYLE)}
                >
                  Empty State
                </Link>
              </li>
              <li>
                <Link 
                  to="/blocks/page-header" 
                  prefetch="intent"
                  className={cn(LI_STYLE, location.pathname === "/blocks/page-header" && LI_ACTIVE_STYLE)}
                >
                  Page Header
                </Link>
              </li>
            </ul>
            <h4 
              className="text-xs mt-4 mb-2 ml-2 font-medium uppercase text-neutral-400 flex items-center justify-between cursor-pointer select-none hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors"
              onClick={() => setLayoutsOpen(!layoutsOpen)}
            >
              <span>Layouts</span>
              <CaretDownIcon 
                size={12} 
                weight="bold"
                className={cn("transition-transform duration-200", layoutsOpen && "rotate-180")} 
              />
            </h4>
            <ul className={cn(
              "flex flex-col overflow-hidden transition-all duration-300 ease-in-out",
              layoutsOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
            )}>
              <li>
                <Link 
                  to="/layouts/resource-list" 
                  prefetch="intent"
                  className={cn(LI_STYLE, location.pathname === "/layouts/resource-list" && LI_ACTIVE_STYLE)}
                >
                  Resource List
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </aside>

      {/* Content shifts by rail width when closed, and rail+panel when open on md+ */}
      <div
        className={cn(
          "transition-[margin] duration-300 h-screen overflow-y-auto overscroll-y-none",
          sidebarOpen ? "ml-12 md:ml-[304px]" : "ml-12"
        )}
      >
        <Outlet context={{ sidebarOpen, setSidebarOpen, toggleSidebar }} />
      </div>
    </div>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details =
      error.status === 404
        ? "The requested page could not be found."
        : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="pt-16 p-4 container mx-auto">
      <h1>{message}</h1>
      <p>{details}</p>
      {stack && (
        <pre className="w-full p-4 overflow-x-auto">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}
