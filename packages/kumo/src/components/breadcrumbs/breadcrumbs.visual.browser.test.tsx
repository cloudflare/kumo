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
  return { nav, margin: getComputedStyle(nav) };
}

function getVisibleChevron(nav: Element) {
  const chevron = Array.from(
    nav.querySelectorAll<SVGPathElement>('span[aria-hidden="true"] svg path'),
  ).find((path) => path.getBoundingClientRect().width > 0);
  if (!chevron) {
    throw new Error("Breadcrumbs test separator chevron not found");
  }
  return chevron;
}

function getChevronTipSide(nav: Element) {
  const chevron = getVisibleChevron(nav);
  const svg = chevron.ownerSVGElement!;
  const matrix = svg.getScreenCTM();
  if (!matrix) {
    throw new Error("Breadcrumbs test separator has no screen matrix");
  }
  const tip = chevron
    .getPointAtLength(chevron.getTotalLength() / 2)
    .matrixTransform(matrix);
  const box = svg.getBoundingClientRect();
  return tip.x > box.left + box.width / 2 ? "right" : "left";
}

describe("Breadcrumbs direction", () => {
  test("points the separator and keeps the end margin on the right in LTR", async () => {
    const { nav, margin } = await renderTrail({ dir: "ltr" });

    expect(getChevronTipSide(nav)).toBe("right");
    expect(margin.marginRight).toBe("16px");
    expect(margin.marginLeft).toBe("0px");
  });

  test("lets className='mr-0' remove the end margin in LTR", async () => {
    const { margin } = await renderTrail({ dir: "ltr", className: "mr-0" });

    expect(margin.marginRight).toBe("0px");
  });

  test("mirrors the separator and the end margin in RTL", async () => {
    const { nav, margin } = await renderTrail({ dir: "rtl" });

    expect(getChevronTipSide(nav)).toBe("left");
    expect(margin.marginLeft).toBe("16px");
    expect(margin.marginRight).toBe("0px");
  });
});
