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

  it("preserves type-only imports using inline type syntax", () => {
    const input = `import type { TabsItem } from "../../components/tabs";`;
    const expected = `import { type TabsItem } from "@cloudflare/kumo";`;
    expect(transformImports(input)).toBe(expected);
  });

  it("consolidates mixed value and type imports using inline type syntax", () => {
    const input = `import { Tabs, type TabsItem } from "../../components/tabs";`;
    const expected = `import { Tabs, type TabsItem } from "@cloudflare/kumo";`;
    expect(transformImports(input)).toBe(expected);
  });

  it("handles inline type imports for multiple types", () => {
    const input = `import { type TabsItem, type TabsProps } from "../../components/tabs";`;
    const expected = `import { type TabsItem, type TabsProps } from "@cloudflare/kumo";`;
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

  it("consolidates multiple import statements from kumo into a single import", () => {
    const input = `import { ReactNode } from "react";
import { Tabs, type TabsItem } from "../../components/tabs";
import { cn } from "../../utils/cn";`;

    const expected = `import { ReactNode } from "react";
import { Tabs, cn, type TabsItem } from "@cloudflare/kumo";`;

    expect(transformImports(input)).toBe(expected);
  });

  it("handles complex mixed imports with multiple values and types", () => {
    const input = `import { Button, Input, type ButtonProps, Select, type InputProps } from "../../components/button";`;
    const expected = `import { Button, Input, Select, type ButtonProps, type InputProps } from "@cloudflare/kumo";`;
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

  it("handles real-world PageHeader example with consolidated imports", () => {
    const input = `import { ReactNode } from "react";
import { Tabs, type TabsItem } from "../../components/tabs";
import { cn } from "../../utils/cn";`;

    const expected = `import { ReactNode } from "react";
import { Tabs, cn, type TabsItem } from "@cloudflare/kumo";`;

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

  it("consolidates the DeleteResource block imports correctly", () => {
    const input = `import { useState, useCallback, useEffect } from "react";
import {
  Dialog,
  DialogRoot,
  DialogTitle,
  DialogClose,
} from "../../components/dialog";
import { Input } from "../../components/input";
import { Button } from "../../components/button";
import { cn } from "../../utils/cn";
import {
  CheckIcon,
  CopyIcon,
  WarningCircleIcon,
  XIcon,
} from "@phosphor-icons/react";
import { Banner } from "../../components/banner";`;

    const expected = `import { useState, useCallback, useEffect } from "react";
import { Dialog, DialogRoot, DialogTitle, DialogClose, Input, Button, cn, Banner } from "@cloudflare/kumo";
import {
  CheckIcon,
  CopyIcon,
  WarningCircleIcon,
  XIcon,
} from "@phosphor-icons/react";`;

    expect(transformImports(input)).toBe(expected);
  });

  it("consolidates imports from multiple components with types", () => {
    const input = `import { Dialog, type DialogProps } from "../../components/dialog";
import { Button, type ButtonProps } from "../../components/button";
import { Input, type InputProps } from "../../components/input";`;

    const expected = `import { Dialog, Button, Input, type DialogProps, type ButtonProps, type InputProps } from "@cloudflare/kumo";`;

    expect(transformImports(input)).toBe(expected);
  });

  it("handles type-only imports from multiple sources consolidated together", () => {
    const input = `import type { DialogProps } from "../../components/dialog";
import type { ButtonProps } from "../../components/button";`;

    const expected = `import { type DialogProps, type ButtonProps } from "@cloudflare/kumo";`;

    expect(transformImports(input)).toBe(expected);
  });
});
