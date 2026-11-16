import { describe, expect, test } from "vite-plus/test";
import { render } from "vitest-browser-react";
import { Breadcrumbs } from "./index";

async function renderTrail({
  dir,
  className,
}: {
  dir: "ltr" | "rtl";
  className?: string;
}) {
  const screen = await render(
    <div dir={dir}>
      <Breadcrumbs className={className}>
        <Breadcrumbs.Link href="/">Home</Breadcrumbs.Link>
        <Breadcrumbs.Separator />
        <Breadcrumbs.Current>Settings</Breadcrumbs.Current>
      </Breadcrumbs>
    </div>,
  );
  const nav = screen.getByRole("navigation", { name: "breadcrumb" }).element();
  return { nav, style: getComputedStyle(nav) };
}

function getSeparatorRotation(nav: Element) {
  const separator = Array.from(
    nav.querySelectorAll('span[aria-hidden="true"] svg'),
  ).find((svg) => svg.getBoundingClientRect().width > 0);
  if (!separator) {
    throw new Error("Breadcrumbs test separator not found");
  }
  return getComputedStyle(separator).rotate;
}

describe("Breadcrumbs direction", () => {
  test("keeps the separator unrotated and the end margin on the right in LTR", async () => {
    const { nav, style } = await renderTrail({ dir: "ltr" });

    expect(getSeparatorRotation(nav)).toBe("none");
    expect(style.marginRight).toBe("16px");
    expect(style.marginLeft).toBe("0px");
  });

  test("lets className='mr-0' remove the end margin in LTR", async () => {
    const { style } = await renderTrail({ dir: "ltr", className: "mr-0" });

    expect(style.marginRight).toBe("0px");
  });

  test("mirrors the separator and the end margin in RTL", async () => {
    const { nav, style } = await renderTrail({ dir: "rtl" });

    expect(getSeparatorRotation(nav)).toBe("180deg");
    expect(style.marginLeft).toBe("16px");
    expect(style.marginRight).toBe("0px");
  });
});
