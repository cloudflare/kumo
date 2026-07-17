import { Button, LayerCard, Text } from "@cloudflare/kumo";
import { CodeHighlighted } from "@cloudflare/kumo/code";
import { WarningIcon } from "@phosphor-icons/react";
import type { ReactNode } from "react";
import { CollapseSizeExample } from "./CollapseSizeExample";

export interface DesignTipExample {
  variant: "good" | "bad";
  exampleCode?: string;
  jsx: ReactNode;
}

export interface DesignTip {
  id: string;
  title: string;
  description?: string;
  examples: DesignTipExample[];
}

interface CodeExampleProps {
  code: string;
}

export function CodeExample({ code }: CodeExampleProps) {
  return (
    <CodeHighlighted
      className="code-block rounded-none border-0 bg-transparent p-2 [&_pre]:text-base!"
      code={code}
      lang="tsx"
    />
  );
}

export const designTips = [
  {
    id: "content-text-size",
    title: "Use 14px for content text",
    description:
      "All content text—body, buttons, data, other interactables—must be 14px in size. 16px and above are restricted to headings and subheadings.",
    examples: [
      {
        variant: "good",
        exampleCode: `<Text>Content text</Text>`,
        jsx: (
          <LayerCard className="grid w-full gap-1 p-5">
            <Text as="h3" variant="heading3">
              API tokens
            </Text>
            <Text>Production token expires in 30 days.</Text>
          </LayerCard>
        ),
      },
      {
        variant: "bad",
        exampleCode: `<Text size="lg">Content text</Text>`,
        jsx: (
          <LayerCard className="grid w-full gap-1 p-5">
            <Text as="h3" variant="heading3">
              API tokens
            </Text>
            <Text size="lg">Production token expires in 30 days.</Text>
          </LayerCard>
        ),
      },
    ],
  },
  {
    id: "heading-case",
    title: "Always sentence case headings",
    description:
      "Never capitalize or uppercase headings. Product names must be title-cased.",
    examples: [
      {
        variant: "good",
        exampleCode: `<Text as="h2">Recent requests</Text>`,
        jsx: (
          <LayerCard>
            <LayerCard.Secondary>Recent requests</LayerCard.Secondary>
            <LayerCard.Primary />
          </LayerCard>
        ),
      },
      {
        variant: "bad",
        exampleCode: `<Text as="h2">Recent Requests</Text>`,
        jsx: (
          <LayerCard>
            <LayerCard.Secondary>
              <span className="capitalize">Recent Requests</span>
            </LayerCard.Secondary>
            <LayerCard.Primary />
          </LayerCard>
        ),
      },
      {
        variant: "bad",
        exampleCode: `<Text as="h2" DANGEROUS_className="uppercase">Recent requests</Text>`,
        jsx: (
          <LayerCard>
            <LayerCard.Secondary>
              <span className="uppercase">Recent Requests</span>
            </LayerCard.Secondary>
            <LayerCard.Primary />
          </LayerCard>
        ),
      },
    ],
  },
  {
    id: "font-tracking",
    title: "Never change the font's tracking",
    description:
      "Do not use the `tracking-*` classes to change the spacing between characters.",
    examples: [
      {
        variant: "good",
        jsx: <span className="text-lg">Worker Metrics</span>,
      },
      {
        variant: "bad",
        jsx: <span className="text-lg tracking-tight">Worker Metrics</span>,
      },
    ],
  },
  {
    id: "font-weight",
    title: "Never use `font-bold`",
    description:
      "Use `font-semibold` for headings and `font-medium` for bold inline text.",
    examples: [
      {
        variant: "good",
        exampleCode: `<Text as="h3" variant="heading3">Account settings</Text>
<Text as="strong" bold>required</Text>`,
        jsx: (
          <div className="grid gap-1">
            <Text as="h3" variant="heading3">
              Account settings
            </Text>
            <Text>
              This action is{" "}
              <Text as="strong" bold>
                required
              </Text>
              .
            </Text>
          </div>
        ),
      },
      {
        variant: "bad",
        exampleCode: `<Text as="h3" DANGEROUS_className="font-bold">Account settings</Text>
<Text as="strong" DANGEROUS_className="font-bold">required</Text>`,
        jsx: (
          <div className="grid gap-1">
            <Text as="h3" DANGEROUS_className="text-lg font-bold">
              Account settings
            </Text>
            <Text>
              This action is{" "}
              <Text as="strong" DANGEROUS_className="font-bold">
                required
              </Text>
              .
            </Text>
          </div>
        ),
      },
    ],
  },
  {
    id: "related-text-spacing",
    title: "Put related text closer together",
    description:
      "Related text should have smaller spacing around it than the content it belongs to.",
    examples: [
      {
        variant: "good",
        exampleCode: `<div className="grid gap-6">
  <div className="grid gap-1.5">
    <Text as="h3">Web Analytics</Text>
    <Text>Measure site traffic without changing your code.</Text>
  </div>
  <Button>Configure</Button>
</div>`,
        jsx: (
          <LayerCard className="w-full p-5">
            <div className="grid gap-6">
              <div className="grid gap-1.5">
                <Text as="h3" variant="heading3">
                  Web Analytics
                </Text>
                <Text variant="secondary" DANGEROUS_className="text-pretty">
                  Measure site traffic without changing your code.
                </Text>
              </div>
              <Button className="justify-self-start">Configure</Button>
            </div>
          </LayerCard>
        ),
      },
      {
        variant: "bad",
        exampleCode: `<div className="grid gap-4">
  <Text as="h3">Web Analytics</Text>
  <Text>Measure site traffic without changing your code.</Text>
  <Button>Configure</Button>
</div>`,
        jsx: (
          <LayerCard className="w-full p-5">
            <div className="grid gap-4">
              <Text as="h3" variant="heading3">
                Web Analytics
              </Text>
              <Text variant="secondary" DANGEROUS_className="text-pretty">
                Measure site traffic without changing your code.
              </Text>
              <Button className="justify-self-start">Configure</Button>
            </div>
          </LayerCard>
        ),
      },
    ],
  },
  {
    id: "text-spacing",
    title: "Optically align spacing around text",
    description:
      "Spacing around text should take into account its line height. Typically this means vertical spacing should be slightly smaller than horizontal.",
    examples: [
      {
        variant: "good",
        exampleCode: `<LayerCard className="px-5 py-4">...</LayerCard>`,
        jsx: (
          <LayerCard className="px-5 py-4">
            <Text bold>Production</Text>
          </LayerCard>
        ),
      },
      {
        variant: "bad",
        exampleCode: `<LayerCard className="p-5">...</LayerCard>`,
        jsx: (
          <LayerCard className="p-5">
            <Text bold>Production</Text>
          </LayerCard>
        ),
      },
    ],
  },
  {
    id: "hover-color-transitions",
    title: "Never transition colors for hover states",
    description:
      "Color changes on hover must be immediate. Transitions on fast interactions make the UI feel sluggish.",
    examples: [
      {
        variant: "good",
        exampleCode: `<button className="hover:bg-kumo-tint">...</button>`,
        jsx: (
          <button
            type="button"
            className="cursor-pointer rounded-lg bg-kumo-base px-4 py-2 font-medium ring ring-kumo-line hover:bg-kumo-tint"
          >
            Hover me
          </button>
        ),
      },
      {
        variant: "bad",
        exampleCode: `<button className="transition-colors duration-300 hover:bg-kumo-tint">...</button>`,
        jsx: (
          <button
            type="button"
            className="cursor-pointer rounded-lg bg-kumo-base px-4 py-2 font-medium ring ring-kumo-line transition-colors duration-300 hover:bg-kumo-tint"
          >
            Hover me
          </button>
        ),
      },
    ],
  },
  {
    id: "shadow-borders",
    title: "Never use borders with drop shadows",
    description:
      "Use `ring ring-kumo-line` to create a transparent border that maintains sharp edges.",
    examples: [
      {
        variant: "good",
        exampleCode: `<LayerCard className="shadow-md ring ring-kumo-line">...</LayerCard>`,
        jsx: (
          <LayerCard className="w-full shadow-md ring ring-kumo-line">
            <LayerCard.Primary className="grid gap-1 p-5">
              <Text as="h3" variant="heading3">
                Workers API
              </Text>
              <Text variant="secondary">Last deployed 4 minutes ago</Text>
            </LayerCard.Primary>
          </LayerCard>
        ),
      },
      {
        variant: "bad",
        exampleCode: `<LayerCard className="border border-kumo-line shadow-md">...</LayerCard>`,
        jsx: (
          <LayerCard className="w-full border border-kumo-line shadow-md ring-0">
            <LayerCard.Primary className="grid gap-1 p-5 ring-0">
              <Text as="h3" variant="heading3">
                Workers API
              </Text>
              <Text variant="secondary">Last deployed 4 minutes ago</Text>
            </LayerCard.Primary>
          </LayerCard>
        ),
      },
    ],
  },
  {
    id: "concentric-border-radius",
    title: "Use concentric border radii",
    description:
      "When borders or rings are 8px or less apart, their corner radii must be mathematically concentric: outer radius = inner radius + padding.",
    examples: [
      {
        variant: "good",
        exampleCode: `<div className="rounded-xl p-1">
  <div className="rounded-lg">...</div>
</div>`,
        jsx: (
          <div className="size-40 overflow-hidden">
            <div className="size-80 rounded-[48px] bg-kumo-tint p-4 ring-2 ring-inset ring-kumo-line">
              <div className="size-full rounded-4xl bg-kumo-base ring-2 ring-inset ring-kumo-line" />
            </div>
          </div>
        ),
      },
      {
        variant: "bad",
        exampleCode: `<div className="rounded-xl p-1">
  <div className="rounded-xl">...</div>
</div>`,
        jsx: (
          <div className="size-40 overflow-hidden">
            <div className="size-80 rounded-[48px] bg-kumo-tint p-4 ring-2 ring-inset ring-kumo-line">
              <div className="size-full rounded-[48px] bg-kumo-base ring-2 ring-inset ring-kumo-line" />
            </div>
          </div>
        ),
      },
    ],
  },
  {
    id: "icon-alignment",
    title: "Align icons with the first line of text",
    description:
      "Inline icons must be optically the same size as and be center-aligned with text. Use `h-lh flex items-center` for multi-line alignment.",
    examples: [
      {
        variant: "good",
        exampleCode: `<div className="flex items-start gap-2">
  <span className="h-lh flex items-center"><Icon /></span>
  <Text>Text that may wrap onto multiple lines</Text>
</div>`,
        jsx: (
          <div className="flex max-w-64 items-start gap-2">
            <span className="flex h-lh shrink-0 items-center">
              <WarningIcon aria-hidden="true" size={14} />
            </span>
            <Text>API token permissions cannot be changed after creation.</Text>
          </div>
        ),
      },
      {
        variant: "bad",
        exampleCode: `<div className="flex items-start gap-2">
  <span className="flex items-center"><Icon /></span>
  <Text>Text that may wrap onto multiple lines</Text>
</div>`,
        jsx: (
          <div className="flex max-w-64 items-start gap-2">
            <span className="flex shrink-0 items-center">
              <WarningIcon aria-hidden="true" size={14} />
            </span>
            <Text>API token permissions cannot be changed after creation.</Text>
          </div>
        ),
      },
      {
        variant: "bad",
        exampleCode: `<div className="flex items-center gap-2">
  <Icon />
  <Text>Text that may wrap onto multiple lines</Text>
</div>`,
        jsx: (
          <div className="flex max-w-64 items-center gap-2">
            <WarningIcon aria-hidden="true" className="shrink-0" size={14} />
            <Text>API token permissions cannot be changed after creation.</Text>
          </div>
        ),
      },
    ],
  },
  {
    id: "inline-monospace-size",
    title: "Reduce the font size of inline monospaced text",
    description:
      "Monospaced text should have a slightly smaller font size (~0.9em) when mixed with regular text.",
    examples: [
      {
        variant: "good",
        jsx: (
          <Text size="lg">
            Edit <span className="font-mono text-[0.9em]">wrangler.toml</span>{" "}
            to continue.
          </Text>
        ),
      },
      {
        variant: "bad",
        jsx: (
          <Text size="lg">
            Edit <span className="font-mono">wrangler.toml</span> to continue.
          </Text>
        ),
      },
    ],
  },
  {
    id: "sticky-borders",
    title: "Use `border` to separate sticky elements from the content",
    examples: [
      {
        variant: "good",
        exampleCode: `<div className="sticky top-0 border-b border-kumo-line">...</div>`,
        jsx: (
          <LayerCard className="h-56 w-full overflow-auto">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-kumo-line bg-kumo-base px-3 py-2">
              <Text bold>API tokens</Text>
              <Button size="sm">Create</Button>
            </div>
            <div className="grid gap-4 p-3">
              <Text>Production token</Text>
              <Text>Preview token</Text>
              <Text>Staging token</Text>
              <Text>Development token</Text>
              <Text>Testing token</Text>
              <Text>Production token</Text>
              <Text>Preview token</Text>
              <Text>Staging token</Text>
              <Text>Development token</Text>
              <Text>Testing token</Text>
            </div>
          </LayerCard>
        ),
      },
      {
        variant: "bad",
        exampleCode: `<div className="sticky top-0">...</div>`,
        jsx: (
          <LayerCard className="h-56 w-full overflow-auto">
            <div className="sticky top-0 z-10 flex items-center justify-between bg-kumo-base px-3 py-2">
              <Text bold>API tokens</Text>
              <Button size="sm">Create</Button>
            </div>
            <div className="grid gap-4 p-3">
              <Text>Production token</Text>
              <Text>Preview token</Text>
              <Text>Staging token</Text>
              <Text>Development token</Text>
              <Text>Testing token</Text>
              <Text>Production token</Text>
              <Text>Preview token</Text>
              <Text>Staging token</Text>
              <Text>Development token</Text>
              <Text>Testing token</Text>
            </div>
          </LayerCard>
        ),
      },
    ],
  },
  {
    id: "collapse-content-size",
    title: "Maintain content size during collapse animations",
    description:
      "Collapsible content must maintain its content size while closing to avoid its content shifting during animations.",
    examples: [
      {
        variant: "good",
        exampleCode: `<motion.div animate={{ width: open ? 256 : 0 }}>
  <div className="w-64">...</div>
</motion.div>`,
        jsx: <CollapseSizeExample preserveContentSize />,
      },
      {
        variant: "bad",
        exampleCode: `<motion.div animate={{ width: open ? 256 : 0 }}>
  <div className="w-full min-w-0">...</div>
</motion.div>`,
        jsx: <CollapseSizeExample />,
      },
    ],
  },
  {
    id: "layer-card-nesting",
    title: "Never stack `LayerCard` on top of one another",
    examples: [
      {
        variant: "good",
        exampleCode: `<div>
  <Text as="h3">Recent requests</Text>
  <LayerCard>...</LayerCard>
</div>`,
        jsx: (
          <div className="grid w-full">
            <div className="flex h-10 items-center">
              <Text as="h3" bold>
                Recent Requests
              </Text>
            </div>
            <LayerCard>
              <LayerCard.Secondary className="grid h-12 grid-cols-3 items-center gap-4 px-3 py-0">
                <Text bold size="sm">
                  Time
                </Text>
                <Text bold size="sm">
                  Status
                </Text>
                <Text bold size="sm">
                  Query
                </Text>
              </LayerCard.Secondary>
              <LayerCard.Primary className="grid h-10 grid-cols-3 items-center gap-4 px-3 py-0">
                <Text size="sm">00:50 UTC</Text>
                <Text size="sm" variant="error">
                  Error
                </Text>
                <Text size="sm">kumo</Text>
              </LayerCard.Primary>
            </LayerCard>
          </div>
        ),
      },
      {
        variant: "bad",
        exampleCode: `<LayerCard>
  <Text as="h3">Recent requests</Text>
  <LayerCard>...</LayerCard>
</LayerCard>`,
        jsx: (
          <LayerCard className="w-full">
            <div className="flex h-10 items-center px-3">
              <Text as="h3" bold>
                Recent Requests
              </Text>
            </div>
            <LayerCard>
              <LayerCard.Secondary className="grid h-12 grid-cols-3 gap-4 px-3 py-0">
                <Text bold>Time</Text>
                <Text bold>Status</Text>
                <Text bold>Query</Text>
              </LayerCard.Secondary>
              <LayerCard.Primary className="grid h-10 grid-cols-3 items-center gap-4 px-3 py-0">
                <Text>00:50 UTC</Text>
                <Text variant="error">Error</Text>
                <Text>kumo</Text>
              </LayerCard.Primary>
            </LayerCard>
          </LayerCard>
        ),
      },
    ],
  },
  {
    id: "dialog-rendering",
    title: "Never conditionally render dialogs",
    description:
      "Conditionally rendering dialogs disables their open/close animation. Use the `open` prop to determine if a dialog should be visible or not.",
    examples: [
      {
        variant: "good",
        jsx: (
          <CodeExample
            code={`<Dialog.Root open={open} onOpenChange={setOpen}>
  <Dialog>
    <Dialog.Title>Edit Worker</Dialog.Title>
    <Dialog.Description>Update this Worker's settings.</Dialog.Description>
  </Dialog>
</Dialog.Root>`}
          />
        ),
      },
      {
        variant: "bad",
        jsx: (
          <CodeExample
            code={`{open && (
  <Dialog.Root open>
    <Dialog>
      <Dialog.Title>Edit Worker</Dialog.Title>
    </Dialog>
  </Dialog.Root>
)}`}
          />
        ),
      },
    ],
  },
] satisfies DesignTip[];
