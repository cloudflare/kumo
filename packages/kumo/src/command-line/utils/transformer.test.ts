import { describe, it, expect } from "vitest";
import { transformImports } from "./transformer";

describe("transformImports", () => {
  it("transforms component imports from relative to package", () => {
    const input = `import { Tabs } from "../../components/tabs";`;
    const expected = `import { Tabs } from "@cloudflare/kumo";`;
    expect(transformImports(input)).toBe(expected);
  });

  it("transforms util imports from relative to package", () => {
    const input = `import { cn } from "../../utils/cn";`;
    const expected = `import { cn } from "@cloudflare/kumo";`;
    expect(transformImports(input)).toBe(expected);
  });

  it("transforms multiple imports in one statement", () => {
    const input = `import { Tabs, Button } from "../../components/tabs";`;
    const expected = `import { Tabs, Button } from "@cloudflare/kumo";`;
    expect(transformImports(input)).toBe(expected);
  });

  it("preserves type-only imports with import type syntax", () => {
    const input = `import type { TabsItem } from "../../components/tabs";`;
    const expected = `import type { TabsItem } from "@cloudflare/kumo";`;
    expect(transformImports(input)).toBe(expected);
  });

  it("splits mixed value and type imports into separate statements", () => {
    const input = `import { Tabs, type TabsItem } from "../../components/tabs";`;
    const expected = `import { Tabs } from "@cloudflare/kumo";\nimport type { TabsItem } from "@cloudflare/kumo";`;
    expect(transformImports(input)).toBe(expected);
  });

  it("handles inline type imports for multiple types", () => {
    const input = `import { type TabsItem, type TabsProps } from "../../components/tabs";`;
    const expected = `import type { TabsItem, TabsProps } from "@cloudflare/kumo";`;
    expect(transformImports(input)).toBe(expected);
  });

  it("preserves non-relative imports unchanged", () => {
    const input = `import { ReactNode } from "react";`;
    expect(transformImports(input)).toBe(input);
  });

  it("preserves imports from other relative paths unchanged", () => {
    const input = `import { something } from "./local-file";`;
    expect(transformImports(input)).toBe(input);
  });

  it("transforms multiple import statements in a file", () => {
    const input = `import { ReactNode } from "react";
import { Tabs, type TabsItem } from "../../components/tabs";
import { cn } from "../../utils/cn";`;

    const expected = `import { ReactNode } from "react";
import { Tabs } from "@cloudflare/kumo";
import type { TabsItem } from "@cloudflare/kumo";
import { cn } from "@cloudflare/kumo";`;

    expect(transformImports(input)).toBe(expected);
  });

  it("handles complex mixed imports with multiple values and types", () => {
    const input = `import { Button, Input, type ButtonProps, Select, type InputProps } from "../../components/button";`;
    const expected = `import { Button, Input, Select } from "@cloudflare/kumo";
import type { ButtonProps, InputProps } from "@cloudflare/kumo";`;
    expect(transformImports(input)).toBe(expected);
  });

  it("handles imports without semicolons", () => {
    const input = `import { Tabs } from "../../components/tabs"`;
    const expected = `import { Tabs } from "@cloudflare/kumo";`;
    expect(transformImports(input)).toBe(expected);
  });

  it("preserves whitespace and formatting in non-import code", () => {
    const input = `import { Tabs } from "../../components/tabs";

export function Component() {
  return <Tabs />;
}`;

    const expected = `import { Tabs } from "@cloudflare/kumo";

export function Component() {
  return <Tabs />;
}`;

    expect(transformImports(input)).toBe(expected);
  });

  it("handles real-world PageHeader example", () => {
    const input = `import { ReactNode } from "react";
import { Tabs, type TabsItem } from "../../components/tabs";
import { cn } from "../../utils/cn";`;

    const expected = `import { ReactNode } from "react";
import { Tabs } from "@cloudflare/kumo";
import type { TabsItem } from "@cloudflare/kumo";
import { cn } from "@cloudflare/kumo";`;

    expect(transformImports(input)).toBe(expected);
  });

  it("handles real-world ResourceListPage example", () => {
    const input = `import type { ReactNode } from "react";
import { cn } from "../../utils/cn";`;

    const expected = `import type { ReactNode } from "react";
import { cn } from "@cloudflare/kumo";`;

    expect(transformImports(input)).toBe(expected);
  });

  it("transforms imports with single quotes", () => {
    const input = `import { Tabs } from '../../components/tabs';`;
    const expected = `import { Tabs } from "@cloudflare/kumo";`;
    expect(transformImports(input)).toBe(expected);
  });

  it("does not transform imports from parent directories that are not components or utils", () => {
    const input = `import { something } from "../../other/thing";`;
    expect(transformImports(input)).toBe(input);
  });
});
