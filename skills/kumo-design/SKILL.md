---
name: kumo-design
description: Cloudflare product design guidance. Use when designing, implementing, or reviewing Cloudflare dashboard interfaces, Kumo UI, responsive styling, dialogs, or frontend tests.
---

# Cloudflare Design

Apply these rules when designing, implementing, or reviewing Cloudflare product interfaces. Follow recommended examples and avoid patterns marked as examples to avoid.

## Rules

### `content-text-size` Use 14px for content text

All content text—body, buttons, data, other interactables—must be 14px in size. 16px and above are restricted to headings and subheadings.

**Good**

```tsx
<Text>Content text</Text>
```

**Avoid**

```tsx
<Text size="lg">Content text</Text>
```

### `heading-case` Always sentence case headings

Never capitalize or uppercase headings. Product names must be title-cased.

**Good**

```tsx
<Text as="h2">Recent requests</Text>
```

**Avoid**

```tsx
<Text as="h2">Recent Requests</Text>
```

```tsx
<Text as="h2" DANGEROUS_className="uppercase">
  Recent requests
</Text>
```

### `font-tracking` Never change the font's tracking

Do not use the `tracking-*` classes to change the spacing between characters.

**Good**

```tsx
<span className="text-lg">Worker Metrics</span>
```

**Avoid**

```tsx
<span className="text-lg tracking-tight">Worker Metrics</span>
```

### `font-weight` Never use `font-bold`

Use `font-semibold` for headings and `font-medium` for bold inline text.

**Good**

```tsx
<Text as="h3" variant="heading3">Account settings</Text>
<Text as="strong" bold>required</Text>
```

**Avoid**

```tsx
<Text as="h3" DANGEROUS_className="font-bold">Account settings</Text>
<Text as="strong" DANGEROUS_className="font-bold">required</Text>
```

### `related-text-spacing` Put related text closer together

Related text should have smaller spacing around it than the content it belongs to.

**Good**

```tsx
<div className="grid gap-6">
  <div className="grid gap-1.5">
    <Text as="h3">Web Analytics</Text>
    <Text>Measure site traffic without changing your code.</Text>
  </div>
  <Button>Configure</Button>
</div>
```

**Avoid**

```tsx
<div className="grid gap-4">
  <Text as="h3">Web Analytics</Text>
  <Text>Measure site traffic without changing your code.</Text>
  <Button>Configure</Button>
</div>
```

### `text-spacing` Optically align spacing around text

Spacing around text should take into account its line height. Typically this means vertical spacing should be slightly smaller than horizontal.

**Good**

```tsx
<LayerCard className="px-5 py-4">...</LayerCard>
```

**Avoid**

```tsx
<LayerCard className="p-5">...</LayerCard>
```

### `hover-color-transitions` Never transition colors for hover states

Color changes on hover must be immediate. Transitions on fast interactions make the UI feel sluggish.

**Good**

```tsx
<button className="hover:bg-kumo-tint">...</button>
```

**Avoid**

```tsx
<button className="transition-colors duration-300 hover:bg-kumo-tint">
  ...
</button>
```

### `shadow-borders` Never use borders with drop shadows

Use `ring ring-kumo-line` to create a transparent border that maintains sharp edges.

**Good**

```tsx
<LayerCard className="shadow-md ring ring-kumo-line">...</LayerCard>
```

**Avoid**

```tsx
<LayerCard className="border border-kumo-line shadow-md">...</LayerCard>
```

### `concentric-border-radius` Use concentric border radii

When borders or rings are 8px or less apart, their corner radii must be mathematically concentric: outer radius = inner radius + padding.

**Good**

```tsx
<div className="rounded-xl p-1">
  <div className="rounded-lg">...</div>
</div>
```

**Avoid**

```tsx
<div className="rounded-xl p-1">
  <div className="rounded-xl">...</div>
</div>
```

### `icon-alignment` Align icons with the first line of text

Inline icons must be optically the same size as and be center-aligned with text. Use `h-lh flex items-center` for multi-line alignment.

**Good**

```tsx
<div className="flex items-start gap-2">
  <span className="h-lh flex items-center">
    <Icon />
  </span>
  <Text>Text that may wrap onto multiple lines</Text>
</div>
```

**Avoid**

```tsx
<div className="flex items-start gap-2">
  <span className="flex items-center">
    <Icon />
  </span>
  <Text>Text that may wrap onto multiple lines</Text>
</div>
```

```tsx
<div className="flex items-center gap-2">
  <Icon />
  <Text>Text that may wrap onto multiple lines</Text>
</div>
```

### `inline-monospace-size` Reduce the font size of inline monospaced text

Monospaced text should have a slightly smaller font size (~0.9em) when mixed with regular text.

**Good**

```tsx
<Text size="lg">
  Edit <span className="font-mono text-[0.9em]">wrangler.toml</span> to
  continue.
</Text>
```

**Avoid**

```tsx
<Text size="lg">
  Edit <span className="font-mono">wrangler.toml</span> to continue.
</Text>
```

### `sticky-borders` Use `border` to separate sticky elements from the content

**Good**

```tsx
<div className="sticky top-0 border-b border-kumo-line">...</div>
```

**Avoid**

```tsx
<div className="sticky top-0">...</div>
```

### `collapse-content-size` Maintain content size during collapse animations

Collapsible content must maintain its content size while closing to avoid its content shifting during animations.

**Good**

```tsx
<motion.div animate={{ width: open ? 256 : 0 }}>
  <div className="w-64">...</div>
</motion.div>
```

**Avoid**

```tsx
<motion.div animate={{ width: open ? 256 : 0 }}>
  <div className="w-full min-w-0">...</div>
</motion.div>
```

### `layer-card-nesting` Never stack `LayerCard` on top of one another

**Good**

```tsx
<div>
  <Text as="h3">Recent requests</Text>
  <LayerCard>...</LayerCard>
</div>
```

**Avoid**

```tsx
<LayerCard>
  <Text as="h3">Recent requests</Text>
  <LayerCard>...</LayerCard>
</LayerCard>
```

### `dialog-rendering` Never conditionally render dialogs

Conditionally rendering dialogs disables their open/close animation. Use the `open` prop to determine if a dialog should be visible or not.

**Good**

```tsx
<Dialog.Root open={open} onOpenChange={setOpen}>
  <Dialog>
    <Dialog.Title>Edit Worker</Dialog.Title>
    <Dialog.Description>Update this Worker's settings.</Dialog.Description>
  </Dialog>
</Dialog.Root>
```

**Avoid**

```tsx
{
  open && (
    <Dialog.Root open>
      <Dialog>
        <Dialog.Title>Edit Worker</Dialog.Title>
      </Dialog>
    </Dialog.Root>
  );
}
```
