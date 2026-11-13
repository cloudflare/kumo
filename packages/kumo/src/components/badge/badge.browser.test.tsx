import type { CSSProperties } from "react";
import { ArrowRightIcon } from "@phosphor-icons/react";
import { describe, expect, test } from "vite-plus/test";
import { render } from "vitest-browser-react";
import { Badge } from "./badge";

describe("Badge typography", () => {
  test.each(["leading-none", "leading-4", "leading-8", "leading-[48px]"])(
    "keeps a consistent height inside a %s parent",
    async (className) => {
      const screen = await render(
        // Consumer typography themes may define text-xs without a line-height.
        <div
          className={className}
          style={{ "--text-xs--line-height": "initial" } as CSSProperties}
        >
          <Badge>Text badge</Badge>
          <Badge icon={ArrowRightIcon}>Icon badge</Badge>
          <Badge variant="success" appearance="dot">
            Dot badge
          </Badge>
        </div>,
      );

      for (const label of ["Text badge", "Icon badge", "Dot badge"]) {
        const badge = screen.getByText(label).element();
        expect(getComputedStyle(badge).lineHeight).toBe("16px");
        expect(badge.getBoundingClientRect().height).toBe(20);
      }
    },
  );
});
