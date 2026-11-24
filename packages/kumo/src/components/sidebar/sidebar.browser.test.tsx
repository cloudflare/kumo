import { GlobeIcon } from "@phosphor-icons/react";
import { beforeEach, describe, expect, test } from "vite-plus/test";
import { page } from "vite-plus/test/browser";
import { render } from "vitest-browser-react";
import {
  Sidebar,
  SidebarContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarProvider,
} from "./sidebar";

function DocsSidebar({ open }: { open: boolean }) {
  return (
    <SidebarProvider open={open}>
      <Sidebar>
        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuButton
              icon={GlobeIcon}
              href="https://example.com/docs"
              target="_blank"
            >
              Docs
            </SidebarMenuButton>
          </SidebarMenu>
        </SidebarContent>
      </Sidebar>
    </SidebarProvider>
  );
}

const newTabIconDisplay = (element: Element) =>
  getComputedStyle(element, "::after").display;

describe("Sidebar new-tab icon", () => {
  beforeEach(async () => {
    // Desktop width, so the sidebar renders as a rail instead of a drawer.
    await page.viewport(1280, 800);
  });

  test("shows the icon on an expanded sidebar", async () => {
    const { container } = await render(<DocsSidebar open />);
    const link = container.querySelector("a")!;
    expect(link.hasAttribute("data-kumo-new-tab-icon")).toBe(true);
    expect(newTabIconDisplay(link)).not.toBe("none");
  });

  test("hides the icon on a collapsed sidebar", async () => {
    const { container } = await render(<DocsSidebar open={false} />);
    const link = container.querySelector("a")!;
    expect(link.hasAttribute("data-kumo-new-tab-icon")).toBe(true);
    expect(newTabIconDisplay(link)).toBe("none");
  });
});
