import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vite-plus/test";
import { forwardRef, type ReactNode } from "react";
import { render, screen } from "@testing-library/react";
import { Banner } from "../components/banner/banner";
import { Breadcrumbs } from "../components/breadcrumbs";
import { Button } from "../components/button/button";
import { DropdownMenu } from "../components/dropdown/dropdown";
import { Link } from "../components/link/link";
import {
  Sidebar,
  SidebarContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuSubButton,
  SidebarProvider,
} from "../components/sidebar/sidebar";
import { TableOfContents } from "../components/table-of-contents/table-of-contents";
import { Toolbar } from "../components/toolbar/toolbar";
import {
  LinkProvider,
  ResolvedLink,
  useLink,
  type RouterLinkProps,
} from "./link-provider";

const RouterLink = forwardRef<HTMLAnchorElement, RouterLinkProps>(
  function RouterLink({ routerOptions, ...props }, ref) {
    return (
      // oxlint-disable-next-line anchor-has-content
      <a
        ref={ref}
        data-router=""
        data-router-options={
          routerOptions === undefined
            ? undefined
            : JSON.stringify(routerOptions)
        }
        {...props}
      />
    );
  },
);

const OPTIONS = { state: { from: "list" }, replace: true };

function renderWithRouter(ui: ReactNode) {
  return render(<LinkProvider router={RouterLink}>{ui}</LinkProvider>);
}

function CustomLink({ href, children }: { href: string; children: ReactNode }) {
  const { Component, linkProps, newTabCue } = useLink({
    href,
    routerOptions: OPTIONS,
  });
  return (
    <Component {...linkProps}>
      {children}
      {newTabCue}
    </Component>
  );
}

// Every link-like component, rendered with `routerOptions` and the given href.
const CASES: Array<[string, (href: string) => ReactNode]> = [
  [
    "Link",
    (href) => (
      <Link href={href} routerOptions={OPTIONS}>
        Go
      </Link>
    ),
  ],
  [
    "ResolvedLink",
    (href) => (
      <ResolvedLink href={href} routerOptions={OPTIONS}>
        Go
      </ResolvedLink>
    ),
  ],
  ["useLink", (href) => <CustomLink href={href}>Go</CustomLink>],
  [
    "Button href",
    (href) => (
      <Button href={href} routerOptions={OPTIONS}>
        Go
      </Button>
    ),
  ],
  [
    "Banner.Action",
    (href) => (
      <Banner
        title="Notice"
        action={
          <Banner.Action href={href} routerOptions={OPTIONS}>
            Go
          </Banner.Action>
        }
      />
    ),
  ],
  [
    "Toolbar.Link",
    (href) => (
      <Toolbar>
        <Toolbar.Link href={href} routerOptions={OPTIONS}>
          Go
        </Toolbar.Link>
      </Toolbar>
    ),
  ],
  [
    "DropdownMenu.LinkItem",
    (href) => (
      <DropdownMenu open>
        <DropdownMenu.Trigger>Open</DropdownMenu.Trigger>
        <DropdownMenu.Content>
          <DropdownMenu.LinkItem href={href} routerOptions={OPTIONS}>
            Go
          </DropdownMenu.LinkItem>
        </DropdownMenu.Content>
      </DropdownMenu>
    ),
  ],
  [
    "Breadcrumbs.Link",
    (href) => (
      <Breadcrumbs>
        <Breadcrumbs.Link href={href} routerOptions={OPTIONS}>
          Go
        </Breadcrumbs.Link>
        <Breadcrumbs.Separator />
        <Breadcrumbs.Current>Here</Breadcrumbs.Current>
      </Breadcrumbs>
    ),
  ],
  [
    "Sidebar.MenuButton",
    (href) => (
      <SidebarProvider defaultOpen>
        <Sidebar>
          <SidebarContent>
            <SidebarMenu>
              <SidebarMenuButton href={href} routerOptions={OPTIONS}>
                Go
              </SidebarMenuButton>
            </SidebarMenu>
          </SidebarContent>
        </Sidebar>
      </SidebarProvider>
    ),
  ],
  [
    "Sidebar.MenuSubButton",
    (href) => (
      <SidebarProvider defaultOpen>
        <Sidebar>
          <SidebarContent>
            <SidebarMenu>
              <SidebarMenuSubButton href={href} routerOptions={OPTIONS}>
                Go
              </SidebarMenuSubButton>
            </SidebarMenu>
          </SidebarContent>
        </Sidebar>
      </SidebarProvider>
    ),
  ],
  [
    "TableOfContents.Item",
    (href) => (
      <TableOfContents>
        <TableOfContents.List>
          <TableOfContents.Item href={href} routerOptions={OPTIONS}>
            Go
          </TableOfContents.Item>
        </TableOfContents.List>
      </TableOfContents>
    ),
  ],
  [
    "TableOfContents.Group",
    (href) => (
      <TableOfContents>
        <TableOfContents.List>
          <TableOfContents.Group label="Go" href={href} routerOptions={OPTIONS}>
            <TableOfContents.Item href="#a">A</TableOfContents.Item>
          </TableOfContents.Group>
        </TableOfContents.List>
      </TableOfContents>
    ),
  ],
];

function getLinks(name: string) {
  return screen.getAllByRole(
    name === "DropdownMenu.LinkItem" ? "menuitem" : "link",
    { name: "Go" },
  );
}

describe("routerOptions", () => {
  let consoleError: ReturnType<typeof vi.spyOn>;
  beforeEach(() => {
    consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
  });
  afterEach(() => {
    consoleError.mockRestore();
  });

  it.each(CASES)(
    "%s passes routerOptions to the router",
    (_name, renderCase) => {
      renderWithRouter(renderCase("/projects/new"));
      for (const link of getLinks(_name)) {
        expect(link.hasAttribute("data-router")).toBe(true);
        expect(
          JSON.parse(link.getAttribute("data-router-options") ?? "null"),
        ).toEqual(OPTIONS);
      }
    },
  );

  it.each(CASES)(
    "%s drops routerOptions on a plain <a>",
    (_name, renderCase) => {
      renderWithRouter(renderCase("https://example.com/docs"));
      for (const link of getLinks(_name)) {
        expect(link.hasAttribute("data-router")).toBe(false);
        expect(link.hasAttribute("routeroptions")).toBe(false);
      }
      expect(consoleError).not.toHaveBeenCalled();
    },
  );

  it.each([
    [
      "Button",
      <Button href="/projects/new" routerOptions={OPTIONS} disabled>
        Go
      </Button>,
    ],
    [
      "Toolbar.Link",
      <Toolbar>
        <Toolbar.Link href="/projects/new" routerOptions={OPTIONS} disabled>
          Go
        </Toolbar.Link>
      </Toolbar>,
    ],
  ])("a disabled %s drops routerOptions", (_name, ui) => {
    renderWithRouter(ui);
    const button = screen.getByRole("button", { name: "Go" });
    expect(button.hasAttribute("routeroptions")).toBe(false);
    expect(consoleError).not.toHaveBeenCalled();
  });

  it("doesn't pass routerOptions to the router when the link has none", () => {
    renderWithRouter(<Link href="/projects">Projects</Link>);
    const link = screen.getByRole("link", { name: "Projects" });
    expect(link.hasAttribute("data-router")).toBe(true);
    expect(link.hasAttribute("data-router-options")).toBe(false);
  });
});
