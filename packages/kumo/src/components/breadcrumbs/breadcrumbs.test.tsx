import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Breadcrumb as Breadcrumbs, type BreadcrumbItem } from "./breadcrumbs";

describe("Breadcrumbs", () => {
  describe("Compound Component API (legacy)", () => {
    it("renders breadcrumb links and current item", () => {
      render(
        <Breadcrumbs>
          <Breadcrumbs.Link href="/home">Home</Breadcrumbs.Link>
          <Breadcrumbs.Separator />
          <Breadcrumbs.Link href="/docs">Docs</Breadcrumbs.Link>
          <Breadcrumbs.Separator />
          <Breadcrumbs.Current>Current Page</Breadcrumbs.Current>
        </Breadcrumbs>,
      );

      // Component renders both mobile and desktop views, so use getAllBy
      expect(screen.getAllByText("Home").length).toBeGreaterThan(0);
      expect(screen.getAllByText("Docs").length).toBeGreaterThan(0);
      expect(screen.getAllByText("Current Page").length).toBeGreaterThan(0);
    });

    it("renders current item with aria-current", () => {
      render(
        <Breadcrumbs>
          <Breadcrumbs.Current>Current Page</Breadcrumbs.Current>
        </Breadcrumbs>,
      );

      // Component renders both mobile and desktop views, so find within nav
      const nav = document.querySelector('nav[aria-label="breadcrumb"]');
      const current = nav?.querySelector("[aria-current='page']");
      expect(current).toBeTruthy();
      expect(current?.textContent).toContain("Current Page");
    });

    it("renders with icons", () => {
      render(
        <Breadcrumbs>
          <Breadcrumbs.Link
            href="/home"
            icon={<span data-testid="home-icon" />}
          >
            Home
          </Breadcrumbs.Link>
          <Breadcrumbs.Separator />
          <Breadcrumbs.Current icon={<span data-testid="current-icon" />}>
            Current
          </Breadcrumbs.Current>
        </Breadcrumbs>,
      );

      // Icons appear in both mobile and desktop views
      expect(screen.getAllByTestId("home-icon").length).toBeGreaterThan(0);
      expect(screen.getAllByTestId("current-icon").length).toBeGreaterThan(0);
    });
  });

  describe("Items API", () => {
    it("renders items-based breadcrumbs", () => {
      const items: BreadcrumbItem[] = [
        { label: "Home", href: "/" },
        { label: "Projects", href: "/projects" },
      ];

      render(<Breadcrumbs items={items} currentItem={{ label: "Settings" }} />);

      // Items appear in both measurement container and nav, so use getAllByText
      expect(screen.getAllByText("Home").length).toBeGreaterThan(0);
      expect(screen.getAllByText("Projects").length).toBeGreaterThan(0);
      expect(screen.getAllByText("Settings").length).toBeGreaterThan(0);
    });

    it("renders nav with aria-label", () => {
      render(
        <Breadcrumbs
          items={[{ label: "Home", href: "/" }]}
          currentItem={{ label: "Settings" }}
        />,
      );

      const nav = document.querySelector('nav[aria-label="Breadcrumb"]');
      expect(nav).toBeTruthy();
    });

    it("renders current item with aria-current", () => {
      render(
        <Breadcrumbs
          items={[{ label: "Home", href: "/" }]}
          currentItem={{ label: "Current" }}
        />,
      );

      const nav = document.querySelector('nav[aria-label="Breadcrumb"]');
      const current = nav?.querySelector("[aria-current='page']");
      expect(current).toBeTruthy();
      expect(current?.textContent).toContain("Current");
    });

    it("renders items with icons", () => {
      const items: BreadcrumbItem[] = [
        { label: "Home", href: "/", icon: <span data-testid="home-icon" /> },
      ];

      render(
        <Breadcrumbs
          items={items}
          currentItem={{
            label: "Settings",
            icon: <span data-testid="settings-icon" />,
          }}
        />,
      );

      // Icons appear in measurement container too, so check for multiple
      expect(screen.getAllByTestId("home-icon").length).toBeGreaterThan(0);
      expect(screen.getAllByTestId("settings-icon").length).toBeGreaterThan(0);
    });
  });
});
