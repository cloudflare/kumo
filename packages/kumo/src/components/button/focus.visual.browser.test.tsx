import type { CDPSession } from "vite-plus/test/browser-playwright";
import { afterEach, describe, expect, test } from "vite-plus/test";
import { cdp, userEvent } from "vite-plus/test/browser";
import { render } from "vitest-browser-react";
import { Button, LinkButton } from "./button";
import { Input } from "../input/input";
import { InputArea } from "../input/input-area";
import { InputGroup } from "../input-group/input-group";
import { Checkbox } from "../checkbox/checkbox";
import { Radio } from "../radio/radio";
import { Switch } from "../switch/switch";
import { Select } from "../select/select";
import { Tabs } from "../tabs/tabs";
import { Slider } from "../slider/slider";
import { TagInput } from "../tag-input/tag-input";
import { InlineCopyText } from "../inline-copy-text/inline-copy-text";

function emulateForcedColors(active: boolean) {
  // Vite+ re-exports cdp() without the Playwright provider's type augmentation.
  return (cdp() as CDPSession).send("Emulation.setEmulatedMedia", {
    features: [{ name: "forced-colors", value: active ? "active" : "none" }],
  });
}

afterEach(async () => {
  await emulateForcedColors(false);
});

describe("Keyboard focus in forced colors", () => {
  const controls = [
    ["Button", <Button>Save</Button>],
    ["InlineCopyText", <InlineCopyText>account-id</InlineCopyText>],
    ["LinkButton", <LinkButton href="#settings">Settings</LinkButton>],
    ["Input", <Input aria-label="Name" />],
    ["InputArea", <InputArea aria-label="Notes" />],
    ["Checkbox", <Checkbox label="Subscribe" />],
    [
      "Radio",
      <Radio.Group legend="Plan" defaultValue="free">
        <Radio.Item label="Free" value="free" />
      </Radio.Group>,
    ],
    ["Switch", <Switch label="Notifications" />],
    [
      "Select",
      <Select aria-label="Region">
        <Select.Option value="us">US</Select.Option>
      </Select>,
    ],
    [
      "Tabs",
      <Tabs
        tabs={[
          { value: "overview", label: "Overview" },
          { value: "settings", label: "Settings" },
        ]}
      />,
    ],
  ] as const;

  test.each(controls)(
    "%s retains an outline when shadows are suppressed",
    async (_name, control) => {
      await emulateForcedColors(true);
      const { getByRole } = await render(
        <>
          <button>Start</button>
          {control}
        </>,
      );
      await getByRole("button", { name: "Start" }).click();
      await userEvent.tab();
      const focused = document.activeElement!;
      expect(focused.matches(":focus-visible")).toBe(true);
      const style = getComputedStyle(focused);
      expect(style.boxShadow).toBe("none");
      expect(style.outlineStyle).not.toBe("none");
      expect(Number.parseFloat(style.outlineWidth)).toBeGreaterThanOrEqual(2);
      expect(style.outlineColor).not.toBe("rgba(0, 0, 0, 0)");
      await getByRole("button", { name: "Start" }).click();
      expect(getComputedStyle(focused).outlineStyle).toBe("none");
    },
  );

  test.each(["container", "hybrid"] as const)(
    "InputGroup %s draws focus around the shared container",
    async (focusMode) => {
      await emulateForcedColors(true);
      const { getByRole } = await render(
        <>
          <button>Start</button>
          <InputGroup label="Domain">
            <InputGroup.Addon>https://</InputGroup.Addon>
            <InputGroup.Input aria-label="Domain" />
            <InputGroup.Suffix>.com</InputGroup.Suffix>
            {focusMode === "hybrid" && (
              <InputGroup.Button variant="secondary">Go</InputGroup.Button>
            )}
          </InputGroup>
        </>,
      );
      await getByRole("button", { name: "Start" }).click();
      await userEvent.tab();
      const focused = document.activeElement!;
      expect(focused.tagName).toBe("INPUT");
      const container = focused.closest(
        focusMode === "hybrid"
          ? "[data-slot='input-group-container-zone']"
          : "[data-slot='input-group']",
      )!;
      const style = getComputedStyle(container);
      expect(style.boxShadow).toBe("none");
      expect(style.outlineStyle).not.toBe("none");
      expect(Number.parseFloat(style.outlineWidth)).toBeGreaterThanOrEqual(2);
    },
  );

  test.each(controls)(
    "%s preserves its normal focus ring",
    async (_name, control) => {
      const { getByRole } = await render(
        <>
          <button>Start</button>
          {control}
        </>,
      );
      await getByRole("button", { name: "Start" }).click();
      await userEvent.tab();
      const style = getComputedStyle(document.activeElement!);
      expect(style.boxShadow).not.toBe("none");
      expect(style.outlineStyle).toBe("none");
    },
  );

  test.each([
    ["Slider", <Slider label="Volume" defaultValue={50} />],
    ["TagInput", <TagInput label="Tags" />],
  ] as const)(
    "%s outlines the parent of its focused input",
    async (_name, control) => {
      await emulateForcedColors(true);
      const { getByRole } = await render(
        <>
          <button>Start</button>
          {control}
        </>,
      );
      await getByRole("button", { name: "Start" }).click();
      await userEvent.tab();
      const focused = document.activeElement!;
      expect(focused.tagName).toBe("INPUT");
      const style = getComputedStyle(focused.parentElement!);
      expect(style.boxShadow).toBe("none");
      expect(style.outlineStyle).not.toBe("none");
      expect(Number.parseFloat(style.outlineWidth)).toBeGreaterThanOrEqual(2);
      expect(style.outlineColor).not.toBe("rgba(0, 0, 0, 0)");
    },
  );
});

describe("Tab focus outline clipping", () => {
  test.each([
    ["segmented", "base", 300],
    ["segmented", "sm", 300],
    ["underline", "base", 300],
    ["underline", "sm", 300],
    ["segmented", "base", 120],
    ["segmented", "sm", 120],
    ["underline", "base", 120],
    ["underline", "sm", 120],
  ] as const)(
    "%s %s at %s px keeps every edge of the outline inside its scroll viewport",
    async (variant, size, width) => {
      await emulateForcedColors(true);
      const { getByRole } = await render(
        <div style={{ padding: 16, width }}>
          <button>Start</button>
          <Tabs
            variant={variant}
            size={size}
            tabs={[
              { value: "overview", label: "Overview" },
              { value: "settings", label: "Settings" },
            ]}
          />
        </div>,
      );
      await getByRole("button", { name: "Start" }).click();
      await userEvent.tab();
      for (const name of ["Overview", "Settings"]) {
        if (name === "Settings") await userEvent.keyboard("{End}");
        const tab = getByRole("tab", { name }).element();
        await expect.element(getByRole("tab", { name })).toHaveFocus();
        const style = getComputedStyle(tab);
        expect(style.outlineStyle).toBe("solid");
        expect(Number.parseFloat(style.outlineWidth)).toBeGreaterThanOrEqual(2);
        const extent =
          Number.parseFloat(style.outlineOffset) +
          Number.parseFloat(style.outlineWidth);
        // An outline can exist in computed styles and still be clipped by the
        // tab list. Check its painted bounds after keyboard scrolling settles.
        await expect
          .poll(() => {
            const rect = tab.getBoundingClientRect();
            const clippedEdges: string[] = [];
            // Scroll positions round to pixels while text widths can be fractional.
            const tolerance = 0.5;
            for (
              let ancestor = tab.parentElement;
              ancestor;
              ancestor = ancestor.parentElement
            ) {
              const clipping = getComputedStyle(ancestor);
              const bounds = ancestor.getBoundingClientRect();
              if (
                clipping.overflowX !== "visible" &&
                (rect.left - extent < bounds.left - tolerance ||
                  rect.right + extent > bounds.right + tolerance)
              )
                clippedEdges.push(
                  `horizontal: ${rect.left - extent}..${rect.right + extent} outside ${bounds.left}..${bounds.right}`,
                );
              if (
                clipping.overflowY !== "visible" &&
                (rect.top - extent < bounds.top - tolerance ||
                  rect.bottom + extent > bounds.bottom + tolerance)
              )
                clippedEdges.push(
                  `vertical: ${rect.top - extent}..${rect.bottom + extent} outside ${bounds.top}..${bounds.bottom}`,
                );
            }
            return clippedEdges;
          })
          .toEqual([]);
      }
    },
  );
});
