import { useEffect, useState } from "react";
import { cn } from "@cloudflare/kumo";
import { GithubLogo } from "@phosphor-icons/react";
import { BaseUIIcon } from "./icons/BaseUIIcon";

/** Height of the sticky header in pixels - matches h-12 Tailwind class (3rem) */
const STICKY_HEADER_HEIGHT = 48;

interface StickyDocHeaderProps {
  title: string;
  githubSourceUrl?: string | null;
  baseUIUrl?: string | null;
}

export function StickyDocHeader({
  title,
  githubSourceUrl,
  baseUIUrl,
}: StickyDocHeaderProps) {
  const [showStickyTitle, setShowStickyTitle] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Watch for sidebar state changes
  useEffect(() => {
    const checkSidebarState = () => {
      const sidebar = document.querySelector("aside[data-sidebar-open]");
      if (sidebar) {
        const isOpen = sidebar.getAttribute("data-sidebar-open") === "true";
        setSidebarOpen(isOpen);
      }
    };

    // Check initially
    checkSidebarState();

    // Watch for attribute changes
    const sidebar = document.querySelector("aside[data-sidebar-open]");
    if (!sidebar) return;

    const observer = new MutationObserver(checkSidebarState);
    observer.observe(sidebar, {
      attributes: true,
      attributeFilter: ["data-sidebar-open"],
    });

    return () => observer.disconnect();
  }, []);

  // Watch for page header visibility
  useEffect(() => {
    const pageHeader = document.getElementById("page-header");
    const mainContent = document.getElementById("main-content");
    if (!pageHeader) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        // Show sticky title when page header is not visible
        setShowStickyTitle(!entry.isIntersecting);
      },
      {
        root: mainContent, // Use main-content as scroll container
        threshold: 0,
        rootMargin: `-${STICKY_HEADER_HEIGHT}px 0px 0px 0px`,
      },
    );

    observer.observe(pageHeader);
    return () => observer.disconnect();
  }, []);

  return (
    <>
      {/* Sticky title that appears when sidebar is collapsed - positioned to appear after "Kumo" */}
      {!sidebarOpen && (
        <div
          className={cn(
            "pointer-events-none fixed top-0 left-12 z-50 flex h-[49px] items-center font-medium transition-opacity duration-200 select-none",
            showStickyTitle ? "opacity-100" : "opacity-0",
          )}
          style={{ paddingLeft: "4.25rem" }} // Position after "Kumo" text (px-4 + "Kumo" width)
        >
          <span className="pointer-events-auto flex items-center gap-2 text-base">
            <span className="text-kumo-subtle">/ </span>
            <span className="font-semibold">{title}</span>
            {githubSourceUrl && (
              <a
                href={githubSourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-kumo-subtle transition-colors hover:text-kumo-strong"
                title="View source on GitHub"
                aria-label="View source on GitHub"
                tabIndex={showStickyTitle ? 0 : -1}
              >
                <GithubLogo size={18} weight="fill" />
              </a>
            )}
            {baseUIUrl && (
              <a
                href={baseUIUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-kumo-subtle transition-colors hover:text-kumo-strong"
                title="View Base UI documentation"
                aria-label="View Base UI documentation"
                tabIndex={showStickyTitle ? 0 : -1}
              >
                <BaseUIIcon size={18} />
              </a>
            )}
          </span>
        </div>
      )}

      {/* Sticky header bar */}
      <header className="sticky top-0 z-10 border-b border-kumo-line bg-kumo-elevated md:pr-12">
        <div className="mx-auto flex h-12 items-center justify-between md:border-r md:border-kumo-line px-4">
          <div
            className={cn(
              "flex items-center gap-2 transition-opacity duration-200",
              showStickyTitle && sidebarOpen
                ? "opacity-100"
                : "pointer-events-none opacity-0",
            )}
          >
            <span className="text-lg font-semibold text-kumo-default">
              {title}
            </span>
            {githubSourceUrl && (
              <a
                href={githubSourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-kumo-subtle transition-colors hover:text-kumo-strong"
                title="View source on GitHub"
                aria-label="View source on GitHub"
                tabIndex={showStickyTitle && sidebarOpen ? 0 : -1}
              >
                <GithubLogo size={20} weight="fill" />
              </a>
            )}
            {baseUIUrl && (
              <a
                href={baseUIUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-kumo-subtle transition-colors hover:text-kumo-strong"
                title="View Base UI documentation"
                aria-label="View Base UI documentation"
                tabIndex={showStickyTitle && sidebarOpen ? 0 : -1}
              >
                <BaseUIIcon size={20} />
              </a>
            )}
          </div>
          <a
            href="https://github.com/cloudflare/kumo"
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-sm text-kumo-subtle transition-colors hover:text-kumo-default"
          >
            @cloudflare/kumo
          </a>
        </div>
      </header>
    </>
  );
}
