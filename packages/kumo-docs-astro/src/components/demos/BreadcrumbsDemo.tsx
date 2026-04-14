import { useState } from "react";
import { Breadcrumbs, type BreadcrumbItem } from "@cloudflare/kumo";
import { HouseIcon, DatabaseIcon } from "@phosphor-icons/react";

export function BreadcrumbsDemo() {
  return (
    <Breadcrumbs>
      <Breadcrumbs.Link href="#">Home</Breadcrumbs.Link>
      <Breadcrumbs.Separator />
      <Breadcrumbs.Link href="#">Docs</Breadcrumbs.Link>
      <Breadcrumbs.Separator />
      <Breadcrumbs.Current>Breadcrumbs</Breadcrumbs.Current>
    </Breadcrumbs>
  );
}

export function BreadcrumbsWithIconsDemo() {
  return (
    <Breadcrumbs>
      <Breadcrumbs.Link href="#" icon={<HouseIcon size={16} />}>
        Home
      </Breadcrumbs.Link>
      <Breadcrumbs.Separator />
      <Breadcrumbs.Link href="#">Projects</Breadcrumbs.Link>
      <Breadcrumbs.Separator />
      <Breadcrumbs.Current>Current Project</Breadcrumbs.Current>
    </Breadcrumbs>
  );
}

export function BreadcrumbsLoadingDemo() {
  return (
    <Breadcrumbs>
      <Breadcrumbs.Link href="#" icon={<HouseIcon size={16} />}>
        Home
      </Breadcrumbs.Link>
      <Breadcrumbs.Separator />
      <Breadcrumbs.Link href="#">Docs</Breadcrumbs.Link>
      <Breadcrumbs.Separator />
      <Breadcrumbs.Current loading></Breadcrumbs.Current>
    </Breadcrumbs>
  );
}

export function BreadcrumbsRootDemo() {
  return (
    <Breadcrumbs>
      <Breadcrumbs.Current icon={<HouseIcon size={16} />}>
        Worker Analytics
      </Breadcrumbs.Current>
    </Breadcrumbs>
  );
}

export function BreadcrumbsWithClipboardDemo() {
  return (
    <Breadcrumbs>
      <Breadcrumbs.Link href="#">Home</Breadcrumbs.Link>
      <Breadcrumbs.Separator />
      <Breadcrumbs.Current>Breadcrumbs</Breadcrumbs.Current>
      <Breadcrumbs.Clipboard text="#" />
    </Breadcrumbs>
  );
}

/**
 * Items-based API: basic usage with href for navigation.
 */
export function BreadcrumbsItemsDemo() {
  const items: BreadcrumbItem[] = [
    { label: "Home", href: "/", icon: <HouseIcon size={16} /> },
    { label: "Projects", href: "/projects" },
  ];

  return <Breadcrumbs items={items} currentItem={{ label: "My Project" }} />;
}

/**
 * Items-based API with loading state on current item.
 */
export function BreadcrumbsItemsLoadingDemo() {
  const items: BreadcrumbItem[] = [
    { label: "Home", href: "#", icon: <HouseIcon size={16} /> },
    { label: "Projects", href: "#" },
  ];

  return (
    <Breadcrumbs items={items} currentItem={{ label: "", loading: true }} />
  );
}

/**
 * Items-based API with custom render prop for router integration.
 * Use the `render` prop to provide your own link component (e.g., Next.js Link, React Router Link).
 * The component will clone your element and inject the label + icon as children.
 */
export function BreadcrumbsItemsCustomRenderDemo() {
  // Simulating a router Link component
  const RouterLink = ({
    to,
    children,
    ...props
  }: {
    to: string;
    children?: React.ReactNode;
    className?: string;
  }) => (
    <a href={to} {...props}>
      {children}
    </a>
  );

  const items: BreadcrumbItem[] = [
    {
      label: "Home",
      icon: <HouseIcon size={16} />,
      // Use render prop for custom link component
      render: <RouterLink to="/" />,
    },
    {
      label: "Projects",
      render: <RouterLink to="/projects" />,
    },
    {
      label: "Settings",
      render: <RouterLink to="/projects/settings" />,
    },
  ];

  return (
    <Breadcrumbs
      items={items}
      currentItem={{ label: "General", icon: <DatabaseIcon size={16} /> }}
    />
  );
}

/**
 * Interactive demo showing the items-based API with automatic overflow.
 * Drag the slider to resize and watch items collapse into a dropdown.
 *
 * This demo showcases:
 * - Automatic overflow with tree visualization in dropdown
 * - Icons on breadcrumb items
 * - Custom render prop for router integration (simulated)
 * - Loading state toggle
 */
export function BreadcrumbsOverflowDemo() {
  const [width, setWidth] = useState(600);
  const [isLoading, setIsLoading] = useState(false);

  // Simulated router Link component
  const RouterLink = ({
    to,
    children,
    ...props
  }: {
    to: string;
    children?: React.ReactNode;
    className?: string;
  }) => (
    <a href={to} {...props}>
      {children}
    </a>
  );

  const items: BreadcrumbItem[] = [
    {
      label: "Acme Corp",
      icon: <HouseIcon size={16} className="shrink-0" />,
      // Using render prop for custom link component (e.g., Next.js Link)
      render: <RouterLink to="#" />,
    },
    { label: "Workers & Pages", href: "#" },
    { label: "production-db", href: "#" },
  ];

  const currentItem: BreadcrumbItem = {
    label: "Settings",
    icon: <DatabaseIcon size={16} className="shrink-0" />,
    loading: isLoading,
  };

  return (
    <div className="flex w-full flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <label className="text-sm text-kumo-subtle whitespace-nowrap">
          Container width:
        </label>
        <input
          type="range"
          min={200}
          max={700}
          value={width}
          onChange={(e) => setWidth(Number(e.target.value))}
          className="flex-1 max-w-48"
        />
        <span className="text-sm text-kumo-subtle tabular-nums w-14">
          {width}px
        </span>
        <label className="flex items-center gap-2 text-sm text-kumo-subtle">
          <input
            type="checkbox"
            checked={isLoading}
            onChange={(e) => setIsLoading(e.target.checked)}
          />
          Loading
        </label>
      </div>

      <div
        className="border border-kumo-line rounded-lg p-5 bg-kumo-base"
        style={{ width }}
      >
        <Breadcrumbs
          items={items}
          currentItem={currentItem}
          collapseFrom="start"
          minVisibleItems={1}
        />
      </div>
    </div>
  );
}
