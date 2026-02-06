# Kumo Component Registry

> Auto-generated component metadata for AI/agent consumption.

---

### Badge

Badge component

**Type:** component

**Import:** `import { Badge } from "@cloudflare/kumo";`

**Category:** Display

**Props:**

- `variant`: enum [default: primary]
  - `"primary"`: Default high-emphasis badge for important labels
  - `"secondary"`: Subtle badge for secondary information
  - `"destructive"`: Error or danger state indicator
  - `"outline"`: Bordered badge with transparent background
  - `"beta"`: Indicates beta or experimental features
- `className`: string
- `children`: ReactNode

**Colors (kumo tokens used):**

`bg-kumo-contrast`, `bg-kumo-danger`, `bg-kumo-fill`, `border-kumo-brand`, `border-kumo-fill`, `text-kumo-default`, `text-kumo-inverse`, `text-kumo-link`

**Examples:**

```tsx
<div className="flex flex-wrap items-center gap-2">
      <Badge variant="primary">Primary</Badge>
      <Badge variant="secondary">Secondary</Badge>
      <Badge variant="destructive">Destructive</Badge>
      <Badge variant="outline">Outline</Badge>
      <Badge variant="beta">Beta</Badge>
    </div>
```

```tsx
<Badge variant="primary">Primary</Badge>
```

```tsx
<p className="flex items-center gap-2">
      Workers
      <Badge variant="beta">Beta</Badge>
    </p>
```


---

### Banner

Banner component

**Type:** component

**Import:** `import { Banner } from "@cloudflare/kumo";`

**Category:** Feedback

**Props:**

- `icon`: ReactNode
- `text`: string
- `children`: ReactNode
- `variant`: enum [default: default]
  - `"default"`: Informational banner for general messages
  - `"alert"`: Warning banner for cautionary messages
  - `"error"`: Error banner for critical issues
- `className`: string

**Colors (kumo tokens used):**

`bg-kumo-danger`, `bg-kumo-danger-tint`, `bg-kumo-info`, `bg-kumo-info-tint`, `bg-kumo-warning`, `bg-kumo-warning-tint`, `border-kumo-danger`, `border-kumo-info`, `border-kumo-warning`, `text-kumo-danger`, `text-kumo-link`, `text-kumo-warning`

**Examples:**

```tsx
<div className="space-y-3">
      <Banner>This is an informational banner.</Banner>
      <Banner variant="alert">This is an alert banner.</Banner>
      <Banner variant="error">This is an error banner.</Banner>
    </div>
```

```tsx
<Banner>This is an informational banner.</Banner>
```

```tsx
<Banner variant="alert">Your session will expire soon.</Banner>
```

```tsx
<Banner icon={<WarningCircle />} variant="alert">
      Review your billing information.
    </Banner>
```

```tsx
<Banner icon={<Info />}>
      <Text DANGEROUS_className="text-inherit">
        This banner supports <strong>custom content</strong> with Text.
      </Text>
    </Banner>
```


---

### Breadcrumbs

Breadcrumbs component

**Type:** component

**Import:** `import { Breadcrumbs } from "@cloudflare/kumo";`

**Category:** Display

**Props:**

- `size`: enum [default: base]
  - `"sm"`: Compact breadcrumbs for dense UIs
  - `"base"`: Default breadcrumbs size
- `children`: ReactNode
- `className`: string

**Colors (kumo tokens used):**

`text-kumo-inactive`, `text-kumo-subtle`, `text-kumo-success`

**Sub-Components:**

This is a compound component. Use these sub-components:

#### Breadcrumbs.Link

Link sub-component

Props:
- `href`: string (required)
- `icon`: React.ReactNode

#### Breadcrumbs.Current

Current sub-component

Props:
- `loading`: boolean
- `icon`: React.ReactNode

#### Breadcrumbs.Separator

Separator sub-component

#### Breadcrumbs.Clipboard

Clipboard sub-component

Props:
- `text`: string (required)


**Examples:**

```tsx
<Breadcrumbs>
      <Breadcrumbs.Link href="#">Home</Breadcrumbs.Link>
      <Breadcrumbs.Separator />
      <Breadcrumbs.Link href="#">Docs</Breadcrumbs.Link>
      <Breadcrumbs.Separator />
      <Breadcrumbs.Current>Breadcrumbs</Breadcrumbs.Current>
    </Breadcrumbs>
```

```tsx
<Breadcrumbs>
      <Breadcrumbs.Link href="#" icon={<House size={16} />}>
        Home
      </Breadcrumbs.Link>
      <Breadcrumbs.Separator />
      <Breadcrumbs.Link href="#">Projects</Breadcrumbs.Link>
      <Breadcrumbs.Separator />
      <Breadcrumbs.Current>Current Project</Breadcrumbs.Current>
    </Breadcrumbs>
```

```tsx
<Breadcrumbs>
      <Breadcrumbs.Current icon={<House size={16} />}>
        Worker Analytics
      </Breadcrumbs.Current>
    </Breadcrumbs>
```

```tsx
<Breadcrumbs>
      <Breadcrumbs.Link href="#">Home</Breadcrumbs.Link>
      <Breadcrumbs.Separator />
      <Breadcrumbs.Current>Breadcrumbs</Breadcrumbs.Current>
      <Breadcrumbs.Clipboard text="#" />
    </Breadcrumbs>
```


---

### Button

Button component

**Type:** component

**Import:** `import { Button } from "@cloudflare/kumo";`

**Category:** Action

**Props:**

- `children`: ReactNode
- `className`: string
- `icon`: ReactNode
- `loading`: boolean
- `shape`: enum [default: base]
  - `"base"`: Default rectangular button shape
  - `"square"`: Square button for icon-only actions
  - `"circle"`: Circular button for icon-only actions
- `size`: enum [default: base]
  - `"xs"`: Extra small button for compact UIs
  - `"sm"`: Small button for secondary actions
  - `"base"`: Default button size
  - `"lg"`: Large button for primary CTAs
- `variant`: enum [default: secondary]
  - `"primary"`: High-emphasis button for primary actions
  - `"secondary"`: Default button style for most actions
  - `"ghost"`: Minimal button with no background
  - `"destructive"`: Danger button for destructive actions like delete
  - `"secondary-destructive"`: Secondary button with destructive text for less prominent dangerous actions
  - `"outline"`: Bordered button with transparent background

  **State Classes:**
  - `"primary"`:
    - `hover`: `hover:bg-kumo-brand-hover`
    - `focus`: `focus:bg-kumo-brand-hover`
    - `disabled`: `disabled:bg-kumo-brand/50`
  - `"secondary"`:
    - `not-disabled`: `not-disabled:hover:border-secondary! not-disabled:hover:bg-kumo-control`
    - `disabled`: `disabled:bg-kumo-control/50 disabled:!text-kumo-default/70`
    - `data-state`: `data-[state=open]:bg-kumo-control`
  - `"ghost"`:
    - `hover`: `hover:bg-kumo-tint`
  - `"destructive"`:
    - `hover`: `hover:bg-kumo-danger/70`
  - `"secondary-destructive"`:
    - `not-disabled`: `not-disabled:hover:border-secondary! not-disabled:hover:bg-kumo-control`
    - `disabled`: `disabled:bg-kumo-control/50 disabled:!text-kumo-danger/70`
    - `data-state`: `data-[state=open]:bg-kumo-control`
- `id`: string
- `lang`: string
- `title`: string
- `disabled`: boolean
- `name`: string
- `type`: enum
- `value`: string | string[] | number

**Colors (kumo tokens used):**

`bg-kumo-base`, `bg-kumo-brand`, `bg-kumo-brand-hover`, `bg-kumo-control`, `bg-kumo-danger`, `bg-kumo-tint`, `ring-kumo-line`, `ring-kumo-ring`, `text-kumo-danger`, `text-kumo-default`, `text-kumo-subtle`

**Examples:**

```tsx
<div className="flex flex-wrap items-center gap-2">
      <Button variant="secondary">Button</Button>
      <Button variant="secondary" shape="square" icon={PlusIcon} />
    </div>
```

```tsx
<Button variant="primary">Primary</Button>
```

```tsx
<div className="flex flex-wrap items-center gap-3">
      <Button size="xs" variant="secondary">
        Extra Small
      </Button>
      <Button size="sm" variant="secondary">
        Small
      </Button>
      <Button size="base" variant="secondary">
        Base
      </Button>
      <Button size="lg" variant="secondary">
        Large
      </Button>
    </div>
```

```tsx
<Button variant="secondary" icon={PlusIcon}>
      Create Worker
    </Button>
```

```tsx
<div className="flex flex-wrap items-center gap-3">
      <Button variant="secondary" shape="square" icon={PlusIcon} />
      <Button variant="secondary" shape="circle" icon={PlusIcon} />
    </div>
```


---

### Checkbox

Checkbox component

**Type:** component

**Import:** `import { Checkbox } from "@cloudflare/kumo";`

**Category:** Input

**Props:**

- `variant`: enum [default: default]
  - `"default"`: Default checkbox appearance
  - `"error"`: Error state for validation failures

  **State Classes:**
  - `"default"`:
    - `focus`: `[&:focus-within>span]:ring-kumo-ring`
    - `hover`: `[&:hover>span]:ring-kumo-ring`
- `label`: ReactNode
  Label content for the checkbox (enables built-in Field wrapper) - can be a string or any React node
- `labelTooltip`: ReactNode
  Tooltip content to display next to the label via an info icon
- `controlFirst`: boolean
  When true (default), checkbox appears before label. When false, label appears before checkbox.
- `checked`: boolean
  Whether the checkbox is checked (controlled)
- `indeterminate`: boolean
  Whether the checkbox is in indeterminate state
- `disabled`: boolean
  Whether the checkbox is disabled
- `name`: string
  Name for form submission
- `required`: boolean
  Whether the field is required
- `className`: string
  Additional class name
- `onValueChange`: (checked: boolean) => void
  Callback when checkbox value changes

**Colors (kumo tokens used):**

`bg-kumo-base`, `bg-kumo-contrast`, `border-kumo-line`, `ring-kumo-danger`, `ring-kumo-line`, `ring-kumo-ring`, `text-kumo-danger`, `text-kumo-default`, `text-kumo-inverse`, `text-kumo-subtle`

**Styling:**

- **Dimensions:** `h-4 w-4`
- **Border Radius:** `rounded-sm`
- **Base Tokens:** `bg-kumo-base`, `ring-kumo-line`
- **States:**
  - `checked`: `bg-kumo-contrast`, `text-kumo-inverse`
  - `indeterminate`: `bg-kumo-contrast`, `text-kumo-inverse`
  - `error`: `ring-kumo-danger`
  - `hover`: `ring-kumo-ring`
  - `focus`: `ring-kumo-ring`
  - `disabled`: `opacity-50`, `cursor-not-allowed`
- **Icons:**
  - `ph-check` (checked) size 12
  - `ph-minus` (indeterminate) size 12

**Sub-Components:**

This is a compound component. Use these sub-components:

#### Checkbox.Item

Item sub-component

#### Checkbox.Group

Group sub-component

Props:
- `legend`: string (required)
- `children`: ReactNode (required)
- `error`: string
- `description`: ReactNode
- `value`: string[]
- `allValues`: string[]
- `disabled`: boolean
- `controlFirst`: boolean
- `className`: string


**Examples:**

```tsx
<Checkbox
      label="Accept terms and conditions"
      checked={checked}
      onCheckedChange={setChecked}
    />
```

```tsx
<Checkbox
      label="Select all"
      indeterminate={indeterminate}
      onCheckedChange={setIndeterminate}
    />
```

```tsx
<Checkbox
      label="Remember me"
      controlFirst={false}
      checked={checked}
      onCheckedChange={setChecked}
    />
```

```tsx
<Checkbox label="Disabled option" disabled />
```

```tsx
<Checkbox label="Invalid option" variant="error" />
```

```tsx
<Checkbox.Group
      legend="Email preferences"
      description="Choose how you'd like to receive updates"
      value={preferences}
      onValueChange={setPreferences}
    >
      <Checkbox.Item value="email" label="Email notifications" />
      <Checkbox.Item value="sms" label="SMS notifications" />
      <Checkbox.Item value="push" label="Push notifications" />
    </Checkbox.Group>
```

```tsx
<Checkbox.Group
      legend="Required preferences"
      error="Please select at least one notification method"
      value={[]}
      onValueChange={() => {}}
    >
      <Checkbox.Item value="email" label="Email" variant="error" />
      <Checkbox.Item value="sms" label="SMS" variant="error" />
    </Checkbox.Group>
```


---

### ClipboardText

ClipboardText component

**Type:** component

**Import:** `import { ClipboardText } from "@cloudflare/kumo";`

**Category:** Action

**Props:**

- `size`: enum [default: lg]
  - `"sm"`: Small clipboard text for compact UIs
  - `"base"`: Default clipboard text size
  - `"lg"`: Large clipboard text for prominent display
- `text`: string (required)
  The text to display and copy to clipboard
- `className`: string
  Additional CSS classes

**Colors (kumo tokens used):**

`bg-kumo-base`, `border-kumo-line`

**Styling:**

- **Base Tokens:** `bg-kumo-base`, `text-kumo-default`, `ring-kumo-line`, `border-kumo-fill`
- **States:**
  - `input`: `bg-kumo-control`, `text-kumo-default`, `ring-kumo-line`
  - `text`: `bg-kumo-base`, `font-mono`
  - `button`: `border-kumo-fill`
- **Icons:**
  - `ph-clipboard` (default) size 16
  - `ph-check` (copied) size 16
- **Input Styles:**
  - Base: `bg-kumo-control text-kumo-default ring ring-kumo-line`
  - Sizes:
    - `xs`: `h-5 gap-1 rounded-sm px-1.5 text-xs`
    - `sm`: `h-6.5 gap-1 rounded-md px-2 text-xs`
    - `base`: `h-9 gap-1.5 rounded-lg px-3 text-base`
    - `lg`: `h-10 gap-2 rounded-lg px-4 text-base`
- **Size Variants:**
  - `sm`:
    - Height: 26px
    - Classes: `text-xs`
    - Button Size: `sm`
    - Dimensions:
      - paddingX: 8
      - gap: 1
      - borderRadius: 6
      - fontSize: 12
  - `base`:
    - Height: 36px
    - Classes: `text-sm`
    - Button Size: `base`
    - Dimensions:
      - paddingX: 12
      - gap: 6
      - borderRadius: 8
      - fontSize: 14
  - `lg`:
    - Height: 40px
    - Classes: `text-sm`
    - Button Size: `lg`
    - Dimensions:
      - paddingX: 16
      - gap: 8
      - borderRadius: 8
      - fontSize: 14

**Examples:**

```tsx
<ClipboardText text="0c239dd2" />
```


---

### Code

Code component

**Type:** component

**Import:** `import { Code } from "@cloudflare/kumo";`

**Category:** Display

**Props:**

- `lang`: enum [default: ts]
  - `"ts"`: TypeScript code
  - `"tsx"`: TypeScript JSX code
  - `"jsonc"`: JSON with comments
  - `"bash"`: Shell/Bash commands
  - `"css"`: CSS styles
- `code`: string (required)
  The code content to display
- `values`: Record<string, { value: string; highlight?: boolean }>
  Template values for interpolation
- `className`: string
  Additional CSS classes

**Colors (kumo tokens used):**

`bg-kumo-base`, `border-kumo-fill`, `text-kumo-strong`

**Styling:**

- **Dimensions:** `[object Object]`
- **Base Tokens:** `text-kumo-strong`

**Sub-Components:**

This is a compound component. Use these sub-components:

#### Code.Block

Block sub-component

Props:
- `code`: string (required)
- `lang`: CodeLang


**Examples:**

```tsx
<CodeBlock
      lang="tsx"
      code={`const greeting = "Hello, World!";
console.log(greeting);`}
    />
```

```tsx
<Code
      lang="bash"
      code="export API_KEY={{apiKey}}"
      values={{
        apiKey: { value: "sk_live_123", highlight: true },
      }}
    />
```


---

### Collapsible

Collapsible component for showing/hiding content.  Features: - Animated chevron indicator (rotates 180° when open) - Accessible with aria-expanded and aria-controls - Content panel with left border accent

**Type:** component

**Import:** `import { Collapsible } from "@cloudflare/kumo";`

**Category:** Display

**Props:**

- `children`: ReactNode
- `label`: string (required)
  Text label displayed in the trigger button
- `open`: boolean
  Whether the collapsible content is visible
- `className`: string
  Additional CSS classes for the content panel
- `onOpenChange`: (open: boolean) => void
  Callback when collapsed state changes

**Colors (kumo tokens used):**

`border-kumo-fill`, `text-kumo-link`

**Examples:**

```tsx
<div className="w-full">
      <Collapsible label="What is Kumo?" open={isOpen} onOpenChange={setIsOpen}>
        Kumo is Cloudflare's new design system.
      </Collapsible>
    </div>
```

```tsx
<div className="w-full space-y-2">
      <Collapsible label="What is Kumo?" open={open1} onOpenChange={setOpen1}>
        Kumo is Cloudflare's new design system.
      </Collapsible>
      <Collapsible
        label="How do I use it?"
        open={open2}
        onOpenChange={setOpen2}
      >
        Install the components and import them into your project.
      </Collapsible>
      <Collapsible
        label="Is it open source?"
        open={open3}
        onOpenChange={setOpen3}
      >
        Check the repository for license information.
      </Collapsible>
    </div>
```


---

### Combobox

Combobox component

**Type:** component

**Import:** `import { Combobox } from "@cloudflare/kumo";`

**Category:** Input

**Props:**

- `inputSide`: enum [default: right]
  - `"right"`: Input positioned inline to the right of chips
  - `"top"`: Input positioned above chips
- `items`: T[] (required)
  Array of items to display in the dropdown
- `value`: T | T[]
  Currently selected value(s)
- `children`: ReactNode
  Combobox content (trigger, content, items)
- `className`: string
  Additional CSS classes
- `label`: ReactNode
  Label content for the combobox (enables Field wrapper) - can be a string or any React node
- `required`: boolean
  Whether the combobox is required
- `labelTooltip`: ReactNode
  Tooltip content to display next to the label via an info icon
- `description`: ReactNode
  Helper text displayed below the combobox
- `error`: string | object
  Error message or validation error object
- `onValueChange`: (value: T | T[]) => void
  Callback when selection changes
- `multiple`: boolean
  Allow multiple selections
- `isItemEqualToValue`: (item: T, value: T) => boolean
  Custom equality function for comparing items

**Colors (kumo tokens used):**

`bg-kumo-control`, `bg-kumo-fill-hover`, `bg-kumo-overlay`, `fill-kumo-ring`, `ring-kumo-line`, `text-kumo-default`, `text-kumo-subtle`

**Sub-Components:**

This is a compound component. Use these sub-components:

#### Combobox.Content

Content sub-component

Props:
- `className`: string
- `align`: ComboboxBase.Positioner.Props["align"]
- `alignOffset`: ComboboxBase.Positioner.Props["alignOffset"]
- `side`: ComboboxBase.Positioner.Props["side"]
- `sideOffset`: ComboboxBase.Positioner.Props["sideOffset"]

#### Combobox.TriggerValue

TriggerValue sub-component

#### Combobox.TriggerInput

TriggerInput sub-component

#### Combobox.TriggerMultipleWithInput

TriggerMultipleWithInput sub-component

#### Combobox.Chip

Chip sub-component

#### Combobox.Item

Item sub-component

#### Combobox.Input

Input sub-component

#### Combobox.Empty

Empty sub-component

#### Combobox.GroupLabel

GroupLabel sub-component

#### Combobox.Group

Group sub-component

#### Combobox.List

A container for combobox items. Supports render prop for custom item rendering. Renders a `<div>` element.

Props:
- `children`: ReactNode | ((item: T, index: number) => ReactNode) - Items to render, or a function that receives each item and returns a node

Usage:
```tsx
<Combobox.List>
  {(item) => <Combobox.Item value={item}>{item.label}</Combobox.Item>}
</Combobox.List>
```

#### Combobox.Collection

Renders filtered list items. Use when you need more control over item rendering.

Props:
- `children`: (item: T, index: number) => ReactNode (required) - Function that receives each filtered item and returns a node

Usage:
```tsx
<Combobox.Collection>
  {(item, index) => (
    <Combobox.Item key={index} value={item}>
      {item.label}
    </Combobox.Item>
  )}
</Combobox.Collection>
```


**Examples:**

```tsx
<Combobox
      value={value}
      onValueChange={(v) => setValue(v as string | null)}
      items={fruits}
    >
      <Combobox.TriggerInput placeholder="Please select" />
      <Combobox.Content>
        <Combobox.Empty />
        <Combobox.List>
          {(item: string) => (
            <Combobox.Item key={item} value={item}>
              {item}
            </Combobox.Item>
          )}
        </Combobox.List>
      </Combobox.Content>
    </Combobox>
```

```tsx
<Combobox
      value={value}
      onValueChange={(v) => setValue(v as Language)}
      items={languages}
    >
      <Combobox.TriggerValue className="w-[200px]" />
      <Combobox.Content>
        <Combobox.Input placeholder="Search languages" />
        <Combobox.Empty />
        <Combobox.List>
          {(item: Language) => (
            <Combobox.Item key={item.value} value={item}>
              {item.emoji} {item.label}
            </Combobox.Item>
          )}
        </Combobox.List>
      </Combobox.Content>
    </Combobox>
```

```tsx
<Combobox
      value={value}
      onValueChange={(v) => setValue(v as ServerLocation | null)}
      items={servers}
    >
      <Combobox.TriggerInput
        className="w-[200px]"
        placeholder="Select server"
      />
      <Combobox.Content>
        <Combobox.Empty />
        <Combobox.List>
          {(group: ServerLocationGroup) => (
            <Combobox.Group key={group.value} items={group.items}>
              <Combobox.GroupLabel>{group.value}</Combobox.GroupLabel>
              <Combobox.Collection>
                {(item: ServerLocation) => (
                  <Combobox.Item key={item.value} value={item}>
                    {item.label}
                  </Combobox.Item>
                )}
              </Combobox.Collection>
            </Combobox.Group>
          )}
        </Combobox.List>
      </Combobox.Content>
    </Combobox>
```

```tsx
<div className="flex gap-2">
      <Combobox
        value={value}
        onValueChange={setValue}
        items={bots}
        isItemEqualToValue={(bot: BotItem, selected: BotItem) =>
          bot.value === selected.value
        }
        multiple
      >
        <Combobox.TriggerMultipleWithInput
          className="w-[400px]"
          placeholder="Select bots"
          renderItem={(selected: BotItem) => (
            <Combobox.Chip key={selected.value}>{selected.label}</Combobox.Chip>
          )}
          inputSide="right"
        />
        <Combobox.Content className="max-h-[200px] min-w-auto overflow-y-auto">
          <Combobox.Empty />
          <Combobox.List>
            {(item: BotItem) => (
              <Combobox.Item key={item.value} value={item}>
                <div className="flex gap-2">
                  <Text>{item.label}</Text>
                  <Text variant="secondary">{item.author}</Text>
                </div>
              </Combobox.Item>
            )}
          </Combobox.List>
        </Combobox.Content>
      </Combobox>
      <Button variant="primary">Submit</Button>
    </div>
```

```tsx
<div className="w-80">
      <Combobox
        items={databases}
        value={value}
        onValueChange={setValue}
        label="Database"
        description="Select your preferred database"
      >
        <Combobox.TriggerInput placeholder="Select database" />
        <Combobox.Content>
          <Combobox.Empty />
          <Combobox.List>
            {(item: DatabaseItem) => (
              <Combobox.Item key={item.value} value={item}>
                {item.label}
              </Combobox.Item>
            )}
          </Combobox.List>
        </Combobox.Content>
      </Combobox>
    </div>
```

```tsx
<div className="w-80">
      <Combobox
        items={databases}
        value={value}
        onValueChange={setValue}
        label="Database"
        error={{ message: "Please select a database", match: true }}
      >
        <Combobox.TriggerInput placeholder="Select database" />
        <Combobox.Content>
          <Combobox.Empty />
          <Combobox.List>
            {(item: DatabaseItem) => (
              <Combobox.Item key={item.value} value={item}>
                {item.label}
              </Combobox.Item>
            )}
          </Combobox.List>
        </Combobox.Content>
      </Combobox>
    </div>
```


---

### CommandPalette

CommandPalette component

**Type:** component

**Import:** `import { CommandPalette } from "@cloudflare/kumo";`

**Category:** Navigation

**Props:**

- `open`: boolean (required)
  Whether the dialog is open
- `children`: ReactNode
  Child content - typically one or more Panel components

**Colors (kumo tokens used):**

`bg-kumo-base`, `bg-kumo-elevated`, `bg-kumo-overlay`, `bg-kumo-warning`, `ring-kumo-line`, `text-kumo-default`, `text-kumo-strong`, `text-kumo-subtle`

**Examples:**

```tsx
<div className="flex flex-col items-start gap-4">
      <Button onClick={() => setOpen(true)}>Open Command Palette</Button>
      {selectedItem && (
        <p className="text-sm text-kumo-subtle">
          Last selected:{" "}
          <span className="text-kumo-default">{selectedItem}</span>
        </p>
      )}

      <CommandPalette.Root
        open={open}
        onOpenChange={setOpen}
        items={sampleGroups}
        value={search}
        onValueChange={setSearch}
        itemToStringValue={(group) => group.label}
        onSelect={(item, { newTab }) => {
          console.log("Selected:", item.title, newTab ? "(new tab)" : "");
          handleSelect(item);
        }}
        getSelectableItems={getSelectableItems}
      >
        <CommandPalette.Input placeholder="Type a command or search..." />
        <CommandPalette.List>
          <CommandPalette.Results>
            {(group: CommandGroup) => (
              <CommandPalette.Group key={group.id}>
                <CommandPalette.GroupLabel>
                  {group.label}
                </CommandPalette.GroupLabel>
                <CommandPalette.Items>
                  {(item: CommandItem) => (
                    <CommandPalette.Item
                      key={item.id}
                      value={item}
                      onClick={() => handleSelect(item)}
                    >
                      <span className="flex items-center gap-3">
                        {item.icon && (
                          <span className="text-kumo-subtle">{item.icon}</span>
                        )}
                        <span>{item.title}</span>
                      </span>
                    </CommandPalette.Item>
                  )}
                </CommandPalette.Items>
              </CommandPalette.Group>
            )}
          </CommandPalette.Results>
          <CommandPalette.Empty>No commands found</CommandPalette.Empty>
        </CommandPalette.List>
        <CommandPalette.Footer>
          <span className="flex items-center gap-2">
            <kbd className="rounded border border-kumo-line bg-kumo-base px-1.5 py-0.5 text-[10px]">
              ↑↓
            </kbd>
            <span>Navigate</span>
          </span>
          <span className="flex items-center gap-2">
            <kbd className="rounded border border-kumo-line bg-kumo-base px-1.5 py-0.5 text-[10px]">
              ↵
            </kbd>
            <span>Select</span>
          </span>
        </CommandPalette.Footer>
      </CommandPalette.Root>
    </div>
```

```tsx
<div>
      <Button onClick={() => setOpen(true)}>Open Simple Palette</Button>

      <CommandPalette.Root
        open={open}
        onOpenChange={setOpen}
        items={simpleItems}
        value={search}
        onValueChange={setSearch}
        itemToStringValue={(item) => item.title}
        onSelect={(item) => {
          console.log("Selected:", item.title);
          setOpen(false);
        }}
        getSelectableItems={(items) => items}
      >
        <CommandPalette.Input placeholder="Search actions..." />
        <CommandPalette.List>
          <CommandPalette.Results>
            {(item: SimpleItem) => (
              <CommandPalette.Item
                key={item.id}
                value={item}
                onClick={() => {
                  console.log("Clicked:", item.title);
                  setOpen(false);
                }}
              >
                {item.title}
              </CommandPalette.Item>
            )}
          </CommandPalette.Results>
          <CommandPalette.Empty>No actions found</CommandPalette.Empty>
        </CommandPalette.List>
      </CommandPalette.Root>
    </div>
```

```tsx
<div>
      <Button onClick={handleOpen}>Open with Loading</Button>

      <CommandPalette.Root
        open={open}
        onOpenChange={setOpen}
        items={loading ? [] : sampleGroups}
        value={search}
        onValueChange={setSearch}
        itemToStringValue={(group) => group.label}
        getSelectableItems={getSelectableItems}
      >
        <CommandPalette.Input placeholder="Search..." />
        <CommandPalette.List>
          {loading ? (
            <CommandPalette.Loading />
          ) : (
            <>
              <CommandPalette.Results>
                {(group: CommandGroup) => (
                  <CommandPalette.Group key={group.id}>
                    <CommandPalette.GroupLabel>
                      {group.label}
                    </CommandPalette.GroupLabel>
                    <CommandPalette.Items>
                      {(item: CommandItem) => (
                        <CommandPalette.Item
                          key={item.id}
                          value={item}
                          onClick={() => setOpen(false)}
                        >
                          <span className="flex items-center gap-3">
                            {item.icon && (
                              <span className="text-kumo-subtle">
                                {item.icon}
                              </span>
                            )}
                            <span>{item.title}</span>
                          </span>
                        </CommandPalette.Item>
                      )}
                    </CommandPalette.Items>
                  </CommandPalette.Group>
                )}
              </CommandPalette.Results>
              <CommandPalette.Empty>No results found</CommandPalette.Empty>
            </>
          )}
        </CommandPalette.List>
      </CommandPalette.Root>
    </div>
```

```tsx
<div>
      <Button onClick={() => setOpen(true)}>Open with ResultItem</Button>

      <CommandPalette.Root
        open={open}
        onOpenChange={setOpen}
        items={searchResults}
        value={search}
        onValueChange={setSearch}
        itemToStringValue={(item) => item.title}
        getSelectableItems={(items) => items}
      >
        <CommandPalette.Input placeholder="Search documentation..." />
        <CommandPalette.List>
          <CommandPalette.Results>
            {(item: SearchResult) => (
              <CommandPalette.ResultItem
                key={item.id}
                value={item}
                title={item.title}
                breadcrumbs={item.breadcrumbs}
                icon={item.icon}
                onClick={() => {
                  console.log("Navigate to:", item.title);
                  setOpen(false);
                }}
              />
            )}
          </CommandPalette.Results>
          <CommandPalette.Empty>No pages found</CommandPalette.Empty>
        </CommandPalette.List>
        <CommandPalette.Footer>
          <span className="flex items-center gap-2">
            <kbd className="rounded border border-kumo-line bg-kumo-base px-1.5 py-0.5 text-[10px]">
              ↑↓
            </kbd>
            <span>Navigate</span>
          </span>
          <span className="flex items-center gap-2">
            <kbd className="rounded border border-kumo-line bg-kumo-base px-1.5 py-0.5 text-[10px]">
              ⌘↵
            </kbd>
            <span>Open in new tab</span>
          </span>
        </CommandPalette.Footer>
      </CommandPalette.Root>
    </div>
```


---

### DateRangePicker

DateRangePicker component

**Type:** component

**Import:** `import { DateRangePicker } from "@cloudflare/kumo";`

**Category:** Input

**Props:**

- `size`: enum [default: base]
  - `"sm"`: Compact calendar for tight spaces
  - `"base"`: Default calendar size
  - `"lg"`: Large calendar for prominent date selection
- `variant`: enum [default: default]
  - `"default"`: Default calendar appearance
  - `"subtle"`: Subtle calendar with minimal background
- `timezone`: string
  Display timezone (display only)
- `className`: string
  Additional CSS classes
- `onStartDateChange`: (date: Date | null) => void
  Callback when start date changes
- `onEndDateChange`: (date: Date | null) => void
  Callback when end date changes

**Colors (kumo tokens used):**

`bg-kumo-base`, `bg-kumo-contrast`, `bg-kumo-fill`, `bg-kumo-interact`, `bg-kumo-overlay`, `text-kumo-default`, `text-kumo-inverse`, `text-kumo-strong`, `text-kumo-subtle`

**Styling:**

- **Size Variants:**
  - `sm`:
    - Classes: `p-3 gap-2`
    - Dimensions:
      - calendarWidth: 168
      - cellHeight: 22
      - cellWidth: 24
      - textSize: 12
      - iconSize: 14
      - padding: 12
      - gap: 8
  - `base`:
    - Classes: `p-4 gap-2.5`
    - Dimensions:
      - calendarWidth: 196
      - cellHeight: 26
      - cellWidth: 28
      - textSize: 14
      - iconSize: 16
      - padding: 16
      - gap: 10
  - `lg`:
    - Classes: `p-5 gap-3`
    - Dimensions:
      - calendarWidth: 252
      - cellHeight: 32
      - cellWidth: 36
      - textSize: 16
      - iconSize: 18
      - padding: 20
      - gap: 12

**Examples:**

```tsx
<div className="flex flex-col gap-4">
      <DateRangePicker
        onStartDateChange={setStartDate}
        onEndDateChange={setEndDate}
      />
      <div className="text-sm text-kumo-subtle">
        {startDate && endDate ? (
          <span>
            Selected: {startDate.toLocaleDateString()} -{" "}
            {endDate.toLocaleDateString()}
          </span>
        ) : startDate ? (
          <span>Start: {startDate.toLocaleDateString()} (select end date)</span>
        ) : (
          <span>Select a date range</span>
        )}
      </div>
    </div>
```

```tsx
<div className="flex flex-col gap-8">
      <div>
        <p className="mb-2 text-sm font-medium text-kumo-default">Small</p>
        <DateRangePicker
          size="sm"
          onStartDateChange={() => {}}
          onEndDateChange={() => {}}
        />
      </div>
      <div>
        <p className="mb-2 text-sm font-medium text-kumo-default">
          Base (default)
        </p>
        <DateRangePicker
          size="base"
          onStartDateChange={() => {}}
          onEndDateChange={() => {}}
        />
      </div>
      <div>
        <p className="mb-2 text-sm font-medium text-kumo-default">Large</p>
        <DateRangePicker
          size="lg"
          onStartDateChange={() => {}}
          onEndDateChange={() => {}}
        />
      </div>
    </div>
```

```tsx
<div className="flex flex-col gap-8">
      <div>
        <p className="mb-2 text-sm font-medium text-kumo-default">
          Default variant
        </p>
        <DateRangePicker
          variant="default"
          onStartDateChange={() => {}}
          onEndDateChange={() => {}}
        />
      </div>
      <div>
        <p className="mb-2 text-sm font-medium text-kumo-default">
          Subtle variant
        </p>
        <DateRangePicker
          variant="subtle"
          onStartDateChange={() => {}}
          onEndDateChange={() => {}}
        />
      </div>
    </div>
```

```tsx
<DateRangePicker
      timezone="London, UK (GMT+0)"
      onStartDateChange={() => {}}
      onEndDateChange={() => {}}
    />
```


---

### Dialog

Dialog component

**Type:** component

**Import:** `import { Dialog } from "@cloudflare/kumo";`

**Category:** Overlay

**Props:**

- `className`: string
- `children`: ReactNode
- `size`: enum [default: base]
  - `"base"`: Default dialog width
  - `"sm"`: Small dialog for simple confirmations
  - `"lg"`: Large dialog for complex content
  - `"xl"`: Extra large dialog for detailed views

**Colors (kumo tokens used):**

`bg-kumo-base`, `bg-kumo-overlay`, `text-kumo-default`

**Styling:**

- **Dimensions:** `[object Object]`

**Sub-Components:**

This is a compound component. Use these sub-components:

#### Dialog.Root

Controls the open state of the dialog. Doesn't render its own HTML element.

Props:
- `open`: boolean - Whether the dialog is currently open (controlled mode)
- `defaultOpen`: boolean [default: false] - Whether the dialog is initially open (uncontrolled mode)
- `onOpenChange`: (open: boolean, event: Event) => void - Callback fired when the dialog opens or closes
- `modal`: boolean | 'trap-focus' [default: true] - Whether the dialog is modal. When true, focus is trapped and page scroll is locked
- `dismissible`: boolean [default: true] - Whether clicking outside closes the dialog

Usage:
```tsx
<Dialog.Root open={isOpen} onOpenChange={setIsOpen}>
```
```tsx
<Dialog.Root defaultOpen={false}>
```

#### Dialog.Trigger

A button that opens the dialog when clicked. Renders a `<button>` element.

Props:
- `render`: ReactElement | ((props, state) => ReactElement) - Custom element to render instead of the default button
- `disabled`: boolean - Whether the trigger is disabled

Usage:
```tsx
<Dialog.Trigger render={<Button>Open</Button>} />
```
```tsx
<Dialog.Trigger>Open Dialog</Dialog.Trigger>
```

#### Dialog.Title

A heading that labels the dialog for accessibility. Renders a `<h2>` element.

Props:
- `render`: ReactElement | ((props, state) => ReactElement) - Custom element to render instead of the default h2

Usage:
```tsx
<Dialog.Title>Confirm Action</Dialog.Title>
```
```tsx
<Dialog.Title render={<h3 />}>Custom Heading</Dialog.Title>
```

#### Dialog.Description

A paragraph providing additional context about the dialog. Renders a `<p>` element.

Props:
- `render`: ReactElement | ((props, state) => ReactElement) - Custom element to render instead of the default p

Usage:
```tsx
<Dialog.Description>Are you sure you want to proceed?</Dialog.Description>
```

#### Dialog.Close

A button that closes the dialog when clicked. Renders a `<button>` element.

Props:
- `render`: ReactElement | ((props, state) => ReactElement) - Custom element to render instead of the default button
- `disabled`: boolean - Whether the close button is disabled

Usage:
```tsx
<Dialog.Close render={<Button>Cancel</Button>} />
```
```tsx
<Dialog.Close>×</Dialog.Close>
```


**Examples:**

```tsx
<Dialog.Root>
      <Dialog.Trigger render={(p) => <Button {...p}>Click me</Button>} />
      <Dialog className="p-8">
        <div className="mb-4 flex items-start justify-between gap-4">
          <Dialog.Title className="text-2xl font-semibold">
            Modal Title
          </Dialog.Title>
          <Dialog.Close
            aria-label="Close"
            render={(props) => (
              <Button
                {...props}
                variant="secondary"
                shape="square"
                icon={<X />}
              />
            )}
          />
        </div>
        <Dialog.Description className="text-kumo-subtle">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
          eiusmod tempor incididunt ut labore et dolore magna aliqua.
        </Dialog.Description>
      </Dialog>
    </Dialog.Root>
```

```tsx
<Dialog.Root>
      <Dialog.Trigger render={(p) => <Button {...p}>Delete</Button>} />
      <Dialog className="p-8">
        <div className="mb-4 flex items-start justify-between gap-4">
          <Dialog.Title className="text-2xl font-semibold">
            Modal Title
          </Dialog.Title>
          <Dialog.Close
            aria-label="Close"
            render={(props) => (
              <Button
                {...props}
                variant="secondary"
                shape="square"
                icon={<X />}
              />
            )}
          />
        </div>
        <Dialog.Description className="text-kumo-subtle">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
          eiusmod tempor incididunt ut labore et dolore magna aliqua.
        </Dialog.Description>
        <div className="mt-8 flex justify-end gap-2">
          <Button variant="secondary">Cancel</Button>
          <Dialog.Close
            render={(props) => (
              <Button variant="destructive" {...props}>
                Delete
              </Button>
            )}
          />
        </div>
      </Dialog>
    </Dialog.Root>
```


---

### DropdownMenu

DropdownMenu component

**Type:** component

**Import:** `import { DropdownMenu } from "@cloudflare/kumo";`

**Category:** Overlay

**Props:**

- `variant`: enum [default: default]
  - `"default"`: Default dropdown item appearance
  - `"danger"`: Destructive action item

**Colors (kumo tokens used):**

`bg-kumo-control`, `bg-kumo-danger`, `bg-kumo-line`, `bg-kumo-overlay`, `bg-kumo-tint`, `ring-kumo-line`, `text-kumo-danger`, `text-kumo-default`

**Sub-Components:**

This is a compound component. Use these sub-components:

#### DropdownMenu.Trigger

Trigger sub-component

#### DropdownMenu.Portal

Portal sub-component (wraps DropdownMenuPrimitive)

#### DropdownMenu.Sub

Sub sub-component (wraps DropdownMenuPrimitive)

#### DropdownMenu.SubTrigger

SubTrigger sub-component

#### DropdownMenu.SubContent

SubContent sub-component

#### DropdownMenu.Content

Content sub-component

#### DropdownMenu.Item

Item sub-component

#### DropdownMenu.CheckboxItem

CheckboxItem sub-component

#### DropdownMenu.RadioGroup

RadioGroup sub-component (wraps DropdownMenuPrimitive)

#### DropdownMenu.RadioItem

RadioItem sub-component

#### DropdownMenu.RadioItemIndicator

RadioItemIndicator sub-component

#### DropdownMenu.Label

Label sub-component

#### DropdownMenu.Separator

Separator sub-component

#### DropdownMenu.Shortcut

Shortcut sub-component

#### DropdownMenu.Group

Group sub-component (wraps DropdownMenuPrimitive)


---

### Empty

Empty component

**Type:** component

**Import:** `import { Empty } from "@cloudflare/kumo";`

**Category:** Display

**Props:**

- `size`: enum [default: base]
  - `"sm"`: Compact empty state for smaller containers
  - `"base"`: Default empty state size
  - `"lg"`: Large empty state for prominent placement
- `icon`: ReactNode
- `title`: string (required)
- `description`: string
- `commandLine`: string
- `contents`: ReactNode
- `className`: string

**Colors (kumo tokens used):**

`bg-kumo-control`, `bg-kumo-overlay`, `border-kumo-fill`, `border-kumo-interact`, `text-kumo-brand`, `text-kumo-default`, `text-kumo-inactive`, `text-kumo-strong`, `text-kumo-success`

**Examples:**

```tsx
<Empty
      icon={<PackageIcon size={48} />}
      title="No packages found"
      description="Get started by installing your first package."
      commandLine="npm install @cloudflare/kumo"
      contents={
        <div className="flex items-center gap-2">
          <Button icon={<CodeIcon />}>See examples</Button>
          <Button icon={<GlobeIcon />} variant="primary">
            View documentation
          </Button>
        </div>
      }
    />
```

```tsx
<div className="flex flex-col gap-8">
      <div>
        <p className="mb-2 text-sm text-kumo-subtle">Small</p>
        <Empty
          size="sm"
          icon={<Database size={32} className="text-kumo-inactive" />}
          title="No data available"
          description="There is no data to display."
        />
      </div>
      <div>
        <p className="mb-2 text-sm text-kumo-subtle">Base</p>
        <Empty
          size="base"
          icon={<Database size={48} className="text-kumo-inactive" />}
          title="No data available"
          description="There is no data to display."
        />
      </div>
      <div>
        <p className="mb-2 text-sm text-kumo-subtle">Large</p>
        <Empty
          size="lg"
          icon={<Database size={64} className="text-kumo-inactive" />}
          title="No data available"
          description="There is no data to display."
        />
      </div>
    </div>
```

```tsx
<Empty
      icon={<FolderOpen size={48} className="text-kumo-inactive" />}
      title="No projects found"
      description="Get started by creating your first project using the command below."
      commandLine="npm create kumo-project"
    />
```

```tsx
<Empty
      icon={<CloudSlash size={48} className="text-kumo-inactive" />}
      title="No connection"
      description="Unable to connect to the server. Please check your connection and try again."
      contents={
        <div className="flex gap-2">
          <Button variant="primary">Retry</Button>
          <Button variant="secondary">Go Back</Button>
        </div>
      }
    />
```

```tsx
<Empty title="Nothing here" />
```

```tsx
<Empty
      title="No results found"
      description="Try adjusting your search or filter to find what you're looking for."
    />
```


---

### Field

Field component

**Type:** component

**Import:** `import { Field } from "@cloudflare/kumo";`

**Category:** Input

**Props:**

- `controlFirst`: boolean
  When true, places the control (checkbox/switch) before the label visually. When false (default), places the label before the control. Used to support different layout patterns (e.g., iOS-style toggles on the right).
- `children`: ReactNode
- `label`: ReactNode
  The label content - can be a string or any React node
- `required`: boolean
  When explicitly false, shows gray "(optional)" text after the label. When true or undefined, no indicator is shown.
- `labelTooltip`: ReactNode
  Tooltip content to display next to the label via an info icon
- `error`: object
- `description`: ReactNode

**Colors (kumo tokens used):**

`text-kumo-danger`, `text-kumo-default`, `text-kumo-subtle`

---

### Grid

Grid component

**Type:** component

**Import:** `import { Grid } from "@cloudflare/kumo";`

**Category:** Layout

**Props:**

- `children`: ReactNode
  Child node(s) that can be nested inside component
- `className`: string
  CSS class names that can be appended to the component
- `id`: string
- `lang`: string
- `title`: string
- `mobileDivider`: boolean
  Show dividers between grid items on mobile (only works with 4up variant)
- `gap`: enum [default: base]
  - `"none"`: No gap between grid items
  - `"sm"`: Small gap between grid items
  - `"base"`: Default responsive gap between grid items
  - `"lg"`: Large gap between grid items
- `variant`: enum
  - `"2up"`: Grid items stack on small screens, display side-by-side on medium screens and up
  - `"side-by-side"`: Grid items always displayed side-by-side
  - `"2-1"`: Two-thirds / one-third split (66%/33%) on medium screens and up
  - `"1-2"`: One-third / two-thirds split (33%/66%) on medium screens and up
  - `"1-3up"`: Grid items stack on small screens, expand to 3 across on large screens
  - `"3up"`: Grid items stack on small screens, 2 across on medium, 3 across on large
  - `"4up"`: Grid items stack on small screens, progressively increase columns at larger breakpoints
  - `"6up"`: Grid items start at 2 across, expand to 6 across on XL
  - `"1-2-4up"`: Grid items stack on small screens, 2 across on medium, 4 across on large

**Colors (kumo tokens used):**

`border-kumo-line`

**Examples:**

```tsx
<Grid variant="2up" gap="base">
      <GridItem>
        <Surface className="rounded-lg p-4">
          <Text bold>Item 1</Text>
          <div className="mt-1">
            <Text variant="secondary">First grid item</Text>
          </div>
        </Surface>
      </GridItem>
      <GridItem>
        <Surface className="rounded-lg p-4">
          <Text bold>Item 2</Text>
          <div className="mt-1">
            <Text variant="secondary">Second grid item</Text>
          </div>
        </Surface>
      </GridItem>
    </Grid>
```

```tsx
<div className="flex flex-col gap-8">
      <div>
        <p className="mb-2 text-kumo-subtle">variant="2up"</p>
        <Grid variant="2up" gap="sm">
          <GridItem>
            <Surface className="rounded-lg p-4 text-center">
              <Text>1</Text>
            </Surface>
          </GridItem>
          <GridItem>
            <Surface className="rounded-lg p-4 text-center">
              <Text>2</Text>
            </Surface>
          </GridItem>
        </Grid>
      </div>

      <div>
        <p className="mb-2 text-kumo-subtle">variant="3up"</p>
        <Grid variant="3up" gap="sm">
          <GridItem>
            <Surface className="rounded-lg p-4 text-center">
              <Text>1</Text>
            </Surface>
          </GridItem>
          <GridItem>
            <Surface className="rounded-lg p-4 text-center">
              <Text>2</Text>
            </Surface>
          </GridItem>
          <GridItem>
            <Surface className="rounded-lg p-4 text-center">
              <Text>3</Text>
            </Surface>
          </GridItem>
        </Grid>
      </div>

      <div>
        <p className="mb-2 text-kumo-subtle">variant="4up"</p>
        <Grid variant="4up" gap="sm">
          <GridItem>
            <Surface className="rounded-lg p-4 text-center">
              <Text>1</Text>
            </Surface>
          </GridItem>
          <GridItem>
            <Surface className="rounded-lg p-4 text-center">
              <Text>2</Text>
            </Surface>
          </GridItem>
          <GridItem>
            <Surface className="rounded-lg p-4 text-center">
              <Text>3</Text>
            </Surface>
          </GridItem>
          <GridItem>
            <Surface className="rounded-lg p-4 text-center">
              <Text>4</Text>
            </Surface>
          </GridItem>
        </Grid>
      </div>
    </div>
```

```tsx
<div className="flex flex-col gap-8">
      <div>
        <p className="mb-2 text-kumo-subtle">variant="2-1" (66% / 33%)</p>
        <Grid variant="2-1" gap="sm">
          <GridItem>
            <Surface className="rounded-lg p-4">
              <Text bold>Main Content</Text>
              <div className="mt-1">
                <Text variant="secondary">Two-thirds width</Text>
              </div>
            </Surface>
          </GridItem>
          <GridItem>
            <Surface className="rounded-lg p-4">
              <Text bold>Sidebar</Text>
              <div className="mt-1">
                <Text variant="secondary">One-third width</Text>
              </div>
            </Surface>
          </GridItem>
        </Grid>
      </div>

      <div>
        <p className="mb-2 text-kumo-subtle">variant="1-2" (33% / 66%)</p>
        <Grid variant="1-2" gap="sm">
          <GridItem>
            <Surface className="rounded-lg p-4">
              <Text bold>Sidebar</Text>
              <div className="mt-1">
                <Text variant="secondary">One-third width</Text>
              </div>
            </Surface>
          </GridItem>
          <GridItem>
            <Surface className="rounded-lg p-4">
              <Text bold>Main Content</Text>
              <div className="mt-1">
                <Text variant="secondary">Two-thirds width</Text>
              </div>
            </Surface>
          </GridItem>
        </Grid>
      </div>
    </div>
```

```tsx
<div className="flex flex-col gap-8">
      <div>
        <p className="mb-2 text-kumo-subtle">gap="none"</p>
        <Grid variant="side-by-side" gap="none">
          <GridItem>
            <Surface className="rounded-lg p-4 text-center">
              <Text>1</Text>
            </Surface>
          </GridItem>
          <GridItem>
            <Surface className="rounded-lg p-4 text-center">
              <Text>2</Text>
            </Surface>
          </GridItem>
        </Grid>
      </div>

      <div>
        <p className="mb-2 text-kumo-subtle">gap="sm"</p>
        <Grid variant="side-by-side" gap="sm">
          <GridItem>
            <Surface className="rounded-lg p-4 text-center">
              <Text>1</Text>
            </Surface>
          </GridItem>
          <GridItem>
            <Surface className="rounded-lg p-4 text-center">
              <Text>2</Text>
            </Surface>
          </GridItem>
        </Grid>
      </div>

      <div>
        <p className="mb-2 text-kumo-subtle">
          gap="base" (default, responsive)
        </p>
        <Grid variant="side-by-side" gap="base">
          <GridItem>
            <Surface className="rounded-lg p-4 text-center">
              <Text>1</Text>
            </Surface>
          </GridItem>
          <GridItem>
            <Surface className="rounded-lg p-4 text-center">
              <Text>2</Text>
            </Surface>
          </GridItem>
        </Grid>
      </div>

      <div>
        <p className="mb-2 text-kumo-subtle">gap="lg"</p>
        <Grid variant="side-by-side" gap="lg">
          <GridItem>
            <Surface className="rounded-lg p-4 text-center">
              <Text>1</Text>
            </Surface>
          </GridItem>
          <GridItem>
            <Surface className="rounded-lg p-4 text-center">
              <Text>2</Text>
            </Surface>
          </GridItem>
        </Grid>
      </div>
    </div>
```

```tsx
<Grid variant="4up" gap="base" mobileDivider>
      <GridItem>
        <Surface className="rounded-lg p-4">
          <Text bold>Item 1</Text>
          <div className="mt-1">
            <Text variant="secondary">Has divider on mobile</Text>
          </div>
        </Surface>
      </GridItem>
      <GridItem>
        <Surface className="rounded-lg p-4">
          <Text bold>Item 2</Text>
          <div className="mt-1">
            <Text variant="secondary">Has divider on mobile</Text>
          </div>
        </Surface>
      </GridItem>
      <GridItem>
        <Surface className="rounded-lg p-4">
          <Text bold>Item 3</Text>
          <div className="mt-1">
            <Text variant="secondary">Has divider on mobile</Text>
          </div>
        </Surface>
      </GridItem>
      <GridItem>
        <Surface className="rounded-lg p-4">
          <Text bold>Item 4</Text>
          <div className="mt-1">
            <Text variant="secondary">Has divider on mobile</Text>
          </div>
        </Surface>
      </GridItem>
    </Grid>
```


---

### Input

Input component

**Type:** component

**Import:** `import { Input } from "@cloudflare/kumo";`

**Category:** Input

**Props:**

- `label`: ReactNode
  Label content for the input (enables Field wrapper) - can be a string or any React node
- `labelTooltip`: ReactNode
  Tooltip content to display next to the label via an info icon
- `description`: ReactNode
  Helper text displayed below the input
- `error`: string | object
  Error message or validation error object
- `size`: enum [default: base]
  - `"xs"`: Extra small input for compact UIs
  - `"sm"`: Small input for secondary fields
  - `"base"`: Default input size
  - `"lg"`: Large input for prominent fields
- `variant`: enum [default: default]
  - `"default"`: Default input appearance
  - `"error"`: Error state for validation failures

  **State Classes:**
  - `"default"`:
    - `focus`: `focus:ring-kumo-ring`
  - `"error"`:
    - `focus`: `focus:ring-kumo-danger`

**Colors (kumo tokens used):**

`bg-kumo-control`, `ring-kumo-danger`, `ring-kumo-line`, `ring-kumo-ring`, `text-kumo-default`, `text-kumo-subtle`

**Styling:**

- **Dimensions:** `[object Object]`

**Examples:**

```tsx
<Input
      label="Email"
      placeholder="you@example.com"
      description="We'll never share your email"
    />
```

```tsx
<Input
      label="Email"
      placeholder="you@example.com"
      value="invalid-email"
      variant="error"
      error="Please enter a valid email address"
    />
```

```tsx
<Input
      label="Password"
      type="password"
      value="short"
      variant="error"
      error={{
        message: "Password must be at least 8 characters",
        match: "tooShort",
      }}
      minLength={8}
    />
```

```tsx
<div className="flex flex-col gap-4">
      <Input size="xs" label="Extra Small" placeholder="Extra small input" />
      <Input size="sm" label="Small" placeholder="Small input" />
      <Input label="Base" placeholder="Base input (default)" />
      <Input size="lg" label="Large" placeholder="Large input" />
    </div>
```

```tsx
<Input label="Disabled field" placeholder="Cannot edit" disabled />
```

```tsx
<div className="flex flex-col gap-4">
      <Input type="email" label="Email" placeholder="you@example.com" />
      <Input type="password" label="Password" placeholder="••••••••" />
      <Input type="number" label="Age" placeholder="18" />
      <Input type="tel" label="Phone" placeholder="+1 (555) 000-0000" />
    </div>
```

```tsx
<Input
      label="Phone Number"
      required={false}
      placeholder="+1 (555) 000-0000"
    />
```

```tsx
<Input
      label="API Key"
      labelTooltip="Find this in your dashboard under Settings > API Keys"
      placeholder="sk_live_..."
    />
```

```tsx
<Input
      label={
        <span>
          Email for <strong>billing</strong>
        </span>
      }
      required
      placeholder="billing@company.com"
      type="email"
    />
```


---

### Label

Label component for form fields.  Provides a standardized way to display labels with optional indicators: - Optional indicator: gray "(optional)" text when `showOptional={true}` - Tooltip: info icon with hover tooltip for additional context

**Type:** component

**Import:** `import { Label } from "@cloudflare/kumo";`

**Category:** Other

**Props:**

- `children`: ReactNode
  The label content - can be a string or any React node
- `showOptional`: boolean
  When true (and required is false), shows gray "(optional)" text after the label
- `tooltip`: ReactNode
  Tooltip content to display next to the label via an info icon
- `className`: string
  Additional CSS classes
- `asContent`: boolean
  When true, only renders the inline content (indicators, tooltip) without the outer span with font styling. Useful when composed inside another label element that already provides the text styling.

**Colors (kumo tokens used):**

`text-kumo-default`, `text-kumo-strong`

**Examples:**

```tsx
<div className="flex flex-col gap-4">
      <Label>Default Label</Label>
      <Label showOptional>Optional Label</Label>
      <Label tooltip="More information about this field">
        Label with Tooltip
      </Label>
    </div>
```

```tsx
<Input label="Phone Number" required={false} placeholder="+1 555-0000" />
```

```tsx
<Input
      label="API Key"
      labelTooltip="Find this in your dashboard settings under API > Keys"
      placeholder="sk_live_..."
    />
```

```tsx
<Checkbox
      label={
        <span>
          I agree to the <strong>Terms of Service</strong>
        </span>
      }
    />
```

```tsx
<div className="flex max-w-md flex-col gap-4">
      <Input label="Full Name" placeholder="John Doe" />
      <Input
        label="Email"
        labelTooltip="We'll send your receipt here"
        placeholder="john@example.com"
        type="email"
      />
      <Input label="Company" required={false} placeholder="Acme Inc." />
      <Select label="Country" hideLabel={false} placeholder="Select a country">
        <Select.Option value="us">United States</Select.Option>
        <Select.Option value="uk">United Kingdom</Select.Option>
        <Select.Option value="ca">Canada</Select.Option>
      </Select>
    </div>
```


---

### LayerCard

LayerCard component

**Type:** component

**Import:** `import { LayerCard } from "@cloudflare/kumo";`

**Category:** Display

**Props:**

- `children`: ReactNode
- `className`: string

**Colors (kumo tokens used):**

`bg-kumo-base`, `bg-kumo-elevated`, `ring-kumo-fill`, `ring-kumo-line`, `text-kumo-strong`

**Styling:**


**Sub-Components:**

This is a compound component. Use these sub-components:

#### LayerCard.Primary

Primary sub-component

#### LayerCard.Secondary

Secondary sub-component


**Examples:**

```tsx
<LayerCard>
      <LayerCard.Secondary className="flex items-center justify-between">
        <div>Next Steps</div>
        <Button variant="ghost" size="sm" shape="square">
          <ArrowRightIcon size={16} />
        </Button>
      </LayerCard.Secondary>

      <LayerCard.Primary>Get started with Kumo</LayerCard.Primary>
    </LayerCard>
```

```tsx
<LayerCard className="w-[250px]">
      <LayerCard.Secondary>Getting Started</LayerCard.Secondary>
      <LayerCard.Primary>
        <p className="text-sm text-kumo-subtle">
          Quick start guide for new users
        </p>
      </LayerCard.Primary>
    </LayerCard>
```

```tsx
<div className="flex gap-4">
      <LayerCard className="w-[200px]">
        <LayerCard.Secondary>Components</LayerCard.Secondary>
        <LayerCard.Primary>
          <p className="text-sm">Browse all components</p>
        </LayerCard.Primary>
      </LayerCard>
      <LayerCard className="w-[200px]">
        <LayerCard.Secondary>Examples</LayerCard.Secondary>
        <LayerCard.Primary>
          <p className="text-sm">View code examples</p>
        </LayerCard.Primary>
      </LayerCard>
    </div>
```


---

### Link

Link component

**Type:** component

**Import:** `import { Link } from "@cloudflare/kumo";`

**Category:** Other

**Props:**

- `variant`: enum [default: inline]
  - `"inline"`: Inline text link that flows with content
  - `"current"`: Link that inherits color from parent text
  - `"plain"`: Link without underline decoration

  **State Classes:**
  - `"plain"`:
    - `hover`: `hover:text-primary/70`
- `to`: string
- `children`: ReactNode
- `className`: string
- `id`: string
- `lang`: string
- `title`: string
- `download`: unknown
- `href`: string
- `hrefLang`: string
- `media`: string
- `ping`: string
- `target`: React.HTMLAttributeAnchorTarget
- `type`: string
- `referrerPolicy`: enum
- `render`: ReactNode
  Allows you to replace the component’s HTML element with a different tag, or compose it with another component.

Accepts a `ReactElement` or a function that returns the element to render.

**Sub-Components:**

This is a compound component. Use these sub-components:

#### Link.ExternalIcon

ExternalIcon sub-component


**Examples:**

```tsx
<div className="grid gap-x-6 gap-y-4 text-base md:grid-cols-3">
      <Link href="#">Default inline link</Link>
      <Link href="#" variant="current">
        Current color link
      </Link>
      <Link href="#" variant="plain">
        Plain inline link
      </Link>
    </div>
```

```tsx
<p className="mx-auto max-w-md text-base leading-relaxed text-kumo-default">
      This is a paragraph with an <Link href="#">inline link</Link> that flows
      naturally with the surrounding text. Links maintain proper underline
      offset for readability.
    </p>
```

```tsx
<Link
      href="https://cloudflare.com"
      target="_blank"
      rel="noopener noreferrer"
      className="text-base"
    >
      Visit Cloudflare <Link.ExternalIcon />
    </Link>
```

```tsx
<p className="text-base text-kumo-danger">
      This error message contains a{" "}
      <Link href="#" variant="current">
        link
      </Link>{" "}
      that inherits the red color from its parent.
    </p>
```

```tsx
<div className="flex flex-col gap-x-6 gap-y-4 text-base md:flex-row">
      <Link render={<CustomRouterLink href="/dashboard" />} variant="inline">
        Dashboard (via render)
      </Link>
      <Link
        render={
          <CustomRouterLink
            href="https://developers.cloudflare.com"
            target="_blank"
            rel="noopener noreferrer"
          />
        }
        variant="inline"
      >
        Cloudflare Docs <Link.ExternalIcon />
      </Link>
    </div>
```


---

### Loader

Loader component

**Type:** component

**Import:** `import { Loader } from "@cloudflare/kumo";`

**Category:** Feedback

**Props:**

- `className`: string
- `size`: enum [default: base]
  - `"sm"`: Small loader for inline use
  - `"base"`: Default loader size
  - `"lg"`: Large loader for prominent loading states

**Examples:**

```tsx
<div className="flex items-center gap-4">
      <Loader size="sm" />
      <Loader size="base" />
      <Loader size="lg" />
    </div>
```

```tsx
<Loader size={24} />
```


---

### MenuBar

MenuBar component

**Type:** component

**Import:** `import { MenuBar } from "@cloudflare/kumo";`

**Category:** Navigation

**Props:**

- `className`: string
- `isActive`: number | boolean | string
- `options`: MenuOptionProps[] (required)
- `optionIds`: boolean

**Colors (kumo tokens used):**

`bg-kumo-base`, `bg-kumo-fill`, `border-kumo-fill`

**Styling:**


**Examples:**

```tsx
<MenuBar
      isActive="bold"
      optionIds
      options={[
        {
          icon: <TextBolderIcon />,
          id: "bold",
          tooltip: "Bold",
          onClick: () => {},
        },
        {
          icon: <TextItalicIcon />,
          id: "italic",
          tooltip: "Italic",
          onClick: () => {},
        },
      ]}
    />
```


---

### Meter

Meter component

**Type:** component

**Import:** `import { Meter } from "@cloudflare/kumo";`

**Category:** Display

**Props:**

- `customValue`: string
- `label`: string (required)
- `showValue`: boolean
- `trackClassName`: string
- `indicatorClassName`: string
- `value`: number
  Current value of the meter
- `max`: number
  Maximum value of the meter (default: 100)
- `min`: number
  Minimum value of the meter (default: 0)

**Colors (kumo tokens used):**

`bg-kumo-fill`, `text-kumo-default`, `text-kumo-strong`

**Examples:**

```tsx
<Meter label="Storage used" value={65} />
```

```tsx
<Meter label="API requests" value={75} customValue="750 / 1,000" />
```

```tsx
<Meter label="Progress" value={40} showValue={false} />
```

```tsx
<Meter
      label="Upload progress"
      value={80}
      indicatorClassName="from-green-500 via-green-500 to-green-500"
    />
```


---

### Pagination

Pagination component

**Type:** component

**Import:** `import { Pagination } from "@cloudflare/kumo";`

**Category:** Navigation

**Props:**

- `controls`: enum [default: full]
  - `"full"`: Full pagination controls with first, previous, page input, next, and last buttons
  - `"simple"`: Simple pagination controls with only previous and next buttons
- `setPage`: (page: number) => void (required)
  Callback when page changes
- `page`: number
- `perPage`: number
- `totalCount`: number

**Colors (kumo tokens used):**

`text-kumo-strong`

**Styling:**


**Examples:**

```tsx
<Pagination page={page} setPage={setPage} perPage={10} totalCount={100} />
```

```tsx
<Pagination
      page={page}
      setPage={setPage}
      perPage={10}
      totalCount={100}
      controls="simple"
    />
```


---

### Popover

Popover component for displaying accessible popup content anchored to a trigger.

**Type:** component

**Import:** `import { Popover } from "@cloudflare/kumo";`

**Category:** Overlay

**Props:**

- `side`: enum [default: bottom]
  - `"top"`: Popover appears above the trigger
  - `"bottom"`: Popover appears below the trigger
  - `"left"`: Popover appears to the left of the trigger
  - `"right"`: Popover appears to the right of the trigger

**Colors (kumo tokens used):**

`bg-kumo-base`, `fill-kumo-base`, `fill-kumo-tip-shadow`, `fill-kumo-tip-stroke`, `outline-kumo-fill`, `text-kumo-default`, `text-kumo-subtle`

**Sub-Components:**

This is a compound component. Use these sub-components:

#### Popover.Trigger

Trigger sub-component

#### Popover.Content

Content sub-component

#### Popover.Title

Title sub-component

#### Popover.Description

Description sub-component

#### Popover.Close

Close sub-component


**Examples:**

```tsx
<Popover>
      <Popover.Trigger asChild>
        <Button shape="square" icon={BellIcon} />
      </Popover.Trigger>
      <Popover.Content>
        <Popover.Title>Notifications</Popover.Title>
        <Popover.Description>
          You are all caught up. Good job!
        </Popover.Description>
      </Popover.Content>
    </Popover>
```

```tsx
<Popover>
      <Popover.Trigger asChild>
        <Button>Open Popover</Button>
      </Popover.Trigger>
      <Popover.Content>
        <Popover.Title>Popover Title</Popover.Title>
        <Popover.Description>
          This is a basic popover with a title and description.
        </Popover.Description>
      </Popover.Content>
    </Popover>
```

```tsx
<Popover>
      <Popover.Trigger asChild>
        <Button>Open Settings</Button>
      </Popover.Trigger>
      <Popover.Content>
        <Popover.Title>Settings</Popover.Title>
        <Popover.Description>
          Configure your preferences below.
        </Popover.Description>
        <div className="mt-3">
          <Popover.Close asChild>
            <Button variant="secondary" size="sm">
              Close
            </Button>
          </Popover.Close>
        </div>
      </Popover.Content>
    </Popover>
```

```tsx
<div className="flex flex-wrap gap-4">
      <Popover>
        <Popover.Trigger asChild>
          <Button variant="secondary">Bottom</Button>
        </Popover.Trigger>
        <Popover.Content side="bottom">
          <Popover.Title>Bottom</Popover.Title>
          <Popover.Description>
            Popover on bottom (default).
          </Popover.Description>
        </Popover.Content>
      </Popover>

      <Popover>
        <Popover.Trigger asChild>
          <Button variant="secondary">Top</Button>
        </Popover.Trigger>
        <Popover.Content side="top">
          <Popover.Title>Top</Popover.Title>
          <Popover.Description>Popover on top.</Popover.Description>
        </Popover.Content>
      </Popover>

      <Popover>
        <Popover.Trigger asChild>
          <Button variant="secondary">Left</Button>
        </Popover.Trigger>
        <Popover.Content side="left">
          <Popover.Title>Left</Popover.Title>
          <Popover.Description>Popover on left.</Popover.Description>
        </Popover.Content>
      </Popover>

      <Popover>
        <Popover.Trigger asChild>
          <Button variant="secondary">Right</Button>
        </Popover.Trigger>
        <Popover.Content side="right">
          <Popover.Title>Right</Popover.Title>
          <Popover.Description>Popover on right.</Popover.Description>
        </Popover.Content>
      </Popover>
    </div>
```

```tsx
<Popover>
      <Popover.Trigger asChild>
        <Button>User Profile</Button>
      </Popover.Trigger>
      <Popover.Content className="w-64">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-full bg-kumo-recessed" />
          <div>
            <Popover.Title>Jane Doe</Popover.Title>
            <p className="text-sm text-kumo-subtle">jane@example.com</p>
          </div>
        </div>
        <div className="mt-3 flex gap-2 border-t border-kumo-line pt-3">
          <Button variant="secondary" size="sm" className="flex-1">
            Profile
          </Button>
          <Popover.Close asChild>
            <Button variant="ghost" size="sm" className="flex-1">
              Sign Out
            </Button>
          </Popover.Close>
        </div>
      </Popover.Content>
    </Popover>
```

```tsx
<Popover>
      <Popover.Trigger openOnHover delay={200} asChild>
        <Button variant="secondary">Hover Me</Button>
      </Popover.Trigger>
      <Popover.Content>
        <Popover.Title>Hover Triggered</Popover.Title>
        <Popover.Description>
          This popover opens on hover with a 200ms delay. It can still contain
          interactive content like buttons and links.
        </Popover.Description>
        <div className="mt-3">
          <Popover.Close asChild>
            <Button variant="secondary" size="sm">
              Got it
            </Button>
          </Popover.Close>
        </div>
      </Popover.Content>
    </Popover>
```


---

### Radio

Radio component

**Type:** component

**Import:** `import { Radio } from "@cloudflare/kumo";`

**Category:** Input

**Props:**

- `legend`: string (required)
  Legend text for the group (required for accessibility)
- `children`: ReactNode
  Child Radio.Item components
- `orientation`: enum
  Layout direction of the radio items
- `error`: string
  Error message for the group
- `description`: ReactNode
  Helper text for the group
- `value`: string
  Value of the radio that should be selected (controlled)
- `disabled`: boolean
  Whether all radios in the group are disabled
- `controlPosition`: enum
  Position of radio control relative to label: "start" (default) puts radio before label, "end" puts label before radio
- `name`: string
  Form submission name for the radio group
- `className`: string
  Additional CSS classes

**Colors (kumo tokens used):**

`bg-kumo-base`, `bg-kumo-contrast`, `border-kumo-line`, `ring-kumo-danger`, `ring-kumo-line`, `ring-kumo-ring`, `text-kumo-danger`, `text-kumo-default`, `text-kumo-subtle`

**Examples:**

```tsx
<Radio.Group
      legend="Notification preference"
      value={value}
      onValueChange={setValue}
    >
      <Radio.Item label="Email" value="email" />
      <Radio.Item label="SMS" value="sms" />
      <Radio.Item label="Push notification" value="push" />
    </Radio.Group>
```

```tsx
<Radio.Group
      legend="Size"
      orientation="horizontal"
      value={value}
      onValueChange={setValue}
    >
      <Radio.Item label="Small" value="sm" />
      <Radio.Item label="Medium" value="md" />
      <Radio.Item label="Large" value="lg" />
    </Radio.Group>
```

```tsx
<Radio.Group
      legend="Shipping method"
      description="Choose how you'd like to receive your order"
      value={value}
      onValueChange={setValue}
    >
      <Radio.Item label="Standard (5-7 days)" value="standard" />
      <Radio.Item label="Express (2-3 days)" value="express" />
      <Radio.Item label="Overnight" value="overnight" />
    </Radio.Group>
```

```tsx
<Radio.Group
      legend="Payment method"
      error="Please select a payment method to continue"
    >
      <Radio.Item label="Credit Card" value="card" variant="error" />
      <Radio.Item label="PayPal" value="paypal" variant="error" />
      <Radio.Item label="Bank Transfer" value="bank" variant="error" />
    </Radio.Group>
```

```tsx
<div className="flex flex-col gap-6">
      <Radio.Group legend="Disabled group" disabled defaultValue="a">
        <Radio.Item label="Option A" value="a" />
        <Radio.Item label="Option B" value="b" />
      </Radio.Group>
      <Radio.Group legend="Individual disabled" defaultValue="available">
        <Radio.Item label="Available" value="available" />
        <Radio.Item label="Unavailable" value="unavailable" disabled />
      </Radio.Group>
    </div>
```

```tsx
<Radio.Group legend="Preferences" controlPosition="end" defaultValue="a">
      <Radio.Item label="Label before radio" value="a" />
      <Radio.Item label="Another option" value="b" />
    </Radio.Group>
```


---

### Select

Select component

**Type:** component

**Import:** `import { Select } from "@cloudflare/kumo";`

**Category:** Input

**Props:**

- `className`: string
  Additional CSS classes
- `label`: ReactNode
  Label content for the select (enables Field wrapper) - can be a string or any React node
- `hideLabel`: boolean
  Whether to visually hide the label (still accessible to screen readers)
- `placeholder`: string
  Placeholder text when no value is selected
- `loading`: boolean
  Whether the select is in a loading state
- `disabled`: boolean
  Whether the select is disabled
- `required`: boolean
  Whether the select is required
- `labelTooltip`: ReactNode
  Tooltip content to display next to the label via an info icon
- `value`: string
  The currently selected value
- `children`: ReactNode
  Child elements (Select.Option components)
- `description`: ReactNode
  Helper text displayed below the select
- `error`: string | object
  Error message or validation error object
- `onValueChange`: (value: string) => void
  Callback when selection changes
- `defaultValue`: string
  Initial value for uncontrolled mode

**Colors (kumo tokens used):**

`bg-kumo-control`, `bg-kumo-overlay`, `ring-kumo-line`, `ring-kumo-ring`, `text-kumo-default`

**Styling:**


**Sub-Components:**

This is a compound component. Use these sub-components:

#### Select.Option

Option sub-component


**Examples:**

```tsx
<Select
      className="w-[200px]"
      value={value}
      onValueChange={(v) => setValue(v ?? "Apple")}
      placeholder="Please select"
    >
      <Select.Option value="Apple">Apple</Select.Option>
      <Select.Option value="Banana">Banana</Select.Option>
      <Select.Option value="Cherry">Cherry</Select.Option>
    </Select>
```

```tsx
<Select
      className="w-[200px]"
      value={value}
      onValueChange={(v) => setValue(v as string)}
      items={{
        bug: "Bug",
        documentation: "Documentation",
        feature: "Feature",
      }}
    >
      <Select.Option value="bug">Bug</Select.Option>
      <Select.Option value="documentation">Documentation</Select.Option>
      <Select.Option value="feature">Feature</Select.Option>
    </Select>
```

```tsx
<Select
      className="w-[200px]"
      renderValue={(v) => (
        <span>
          {v.emoji} {v.label}
        </span>
      )}
      value={value}
      onValueChange={(v) => setValue(v as (typeof languages)[0])}
    >
      {languages.map((language) => (
        <Select.Option key={language.value} value={language}>
          {language.emoji} {language.label}
        </Select.Option>
      ))}
    </Select>
```

```tsx
<Select className="w-[200px]" loading />
```

```tsx
<Select
      className="w-[200px]"
      loading={loading}
      value={value}
      onValueChange={(v) => setValue(v as string | null)}
      placeholder="Please select"
    >
      {data?.map((item) => (
        <Select.Option key={item} value={item}>
          {item}
        </Select.Option>
      ))}
    </Select>
```

```tsx
<Select
      className="w-[250px]"
      multiple
      renderValue={(value) => {
        if (value.length > 3) {
          return (
            <span className="line-clamp-1">
              {value.slice(2).join(", ") + ` and ${value.length - 2} more`}
            </span>
          );
        }
        return <span>{value.join(", ")}</span>;
      }}
      value={value}
      onValueChange={(v) => setValue(v as string[])}
    >
      <Select.Option value="Name">Name</Select.Option>
      <Select.Option value="Location">Location</Select.Option>
      <Select.Option value="Size">Size</Select.Option>
      <Select.Option value="Read">Read</Select.Option>
      <Select.Option value="Write">Write</Select.Option>
      <Select.Option value="CreatedAt">Created At</Select.Option>
    </Select>
```

```tsx
<Select
      className="w-[200px]"
      onValueChange={(v) => setValue(v as (typeof authors)[0] | null)}
      value={value}
      isItemEqualToValue={(item, value) => item?.id === value?.id}
      renderValue={(author) => {
        return author?.name ?? "Please select author";
      }}
    >
      {authors.map((author) => (
        <Select.Option key={author.id} value={author}>
          <div className="flex w-[300px] items-center justify-between gap-2">
            <Text>{author.name}</Text>
            <Text variant="secondary">{author.title}</Text>
          </div>
        </Select.Option>
      ))}
    </Select>
```


---

### SensitiveInput

SensitiveInput component

**Type:** component

**Import:** `import { SensitiveInput } from "@cloudflare/kumo";`

**Category:** Other

**Props:**

- `alt`: string
- `autoComplete`: React.HTMLInputAutoCompleteAttribute
- `checked`: boolean
- `disabled`: boolean
- `height`: number | string
- `list`: string
- `name`: string
- `placeholder`: string
- `readOnly`: boolean
- `required`: boolean
- `width`: number | string
- `className`: string
- `id`: string
- `lang`: string
- `title`: string
- `children`: ReactNode
- `value`: string
  Controlled value
- `size`: enum [default: base]
  Size variant
- `variant`: enum [default: default]
  Style variant
- `label`: ReactNode
  Label content for the input (enables Field wrapper and sets masked state label) - can be a string or any React node
- `labelTooltip`: ReactNode
  Tooltip content to display next to the label via an info icon
- `description`: ReactNode
  Helper text displayed below the input
- `error`: string | object
  Error message or validation error object

**Colors (kumo tokens used):**

`bg-kumo-brand`, `bg-kumo-control`, `outline-kumo-ring`, `text-kumo-default`, `text-kumo-subtle`

**Examples:**

```tsx
<div className="w-80">
      <SensitiveInput label="API Key" defaultValue="sk_live_abc123xyz789" />
    </div>
```

```tsx
<div className="flex flex-col gap-4">
      {sizes.map((size) => (
        <div key={size} className="flex items-center gap-2">
          <span className="w-12 text-sm text-kumo-subtle">{size}</span>
          <SensitiveInput
            label={`${size} size`}
            size={size}
            defaultValue="secret-api-key-123"
          />
        </div>
      ))}
    </div>
```

```tsx
<div className="flex w-80 flex-col gap-4">
      <SensitiveInput
        label="Controlled Secret"
        value={value}
        onValueChange={setValue}
      />
      <div className="text-sm text-kumo-subtle">
        Current value: <code className="text-kumo-default">{value}</code>
      </div>
      <div className="flex gap-2">
        <Button
          onClick={() => setValue("new-secret-" + Date.now())}
          variant="primary"
          size="sm"
        >
          Change value
        </Button>
        <Button onClick={() => setValue("")} variant="secondary" size="sm">
          Clear
        </Button>
      </div>
    </div>
```

```tsx
<div className="flex w-80 flex-col gap-4">
      <SensitiveInput
        label="Error State"
        variant="error"
        defaultValue="invalid-key"
        error="This API key is not valid"
      />
      <SensitiveInput label="Disabled" defaultValue="cannot-edit" disabled />
      <SensitiveInput
        label="Read-only"
        defaultValue="view-only-secret-key"
        readOnly
      />
      <SensitiveInput
        label="With Description"
        defaultValue="my-secret-value"
        description="Keep this value secure and don't share it"
      />
    </div>
```


---

### Surface

Surface component

**Type:** component

**Import:** `import { Surface } from "@cloudflare/kumo";`

**Category:** Layout

**Props:**

- `as`: React.ElementType
  The element type to render as (default: "div")
- `className`: string
  Additional CSS classes
- `children`: ReactNode
  Child elements

**Colors (kumo tokens used):**

`bg-kumo-base`, `ring-kumo-line`

**Examples:**

```tsx
<Surface className="rounded-lg p-6">
      <Text size="lg" bold>
        Surface Component
      </Text>
      <div className="mt-2">
        <Text variant="secondary">
          A container with consistent elevation and border styling.
        </Text>
      </div>
    </Surface>
```

```tsx
<div className="flex flex-col gap-4">
      <Surface as="section" className="rounded-lg p-4">
        <Text bold>As section element</Text>
      </Surface>
      <Surface as="article" className="rounded-lg p-4">
        <Text bold>As article element</Text>
      </Surface>
      <Surface as="aside" className="rounded-lg p-4">
        <Text bold>As aside element</Text>
      </Surface>
    </div>
```

```tsx
<Surface className="rounded-lg p-6">
      <Text bold>Outer Surface</Text>
      <Surface className="mt-4 rounded-md bg-kumo-elevated p-4">
        <Text variant="secondary">Nested Surface</Text>
      </Surface>
    </Surface>
```


---

### Switch

Switch component

**Type:** component

**Import:** `import { Switch } from "@cloudflare/kumo";`

**Category:** Input

**Props:**

- `variant`: enum [default: default]
  - `"default"`: Default switch appearance
  - `"error"`: Error state for validation failures
- `label`: ReactNode
  Label content for the switch (Field wrapper is built-in) - can be a string or any React node. Optional when used standalone for visual-only purposes.
- `labelTooltip`: ReactNode
  Tooltip content to display next to the label via an info icon
- `required`: boolean
  Whether the switch is required. When explicitly false, shows "(optional)" text after the label.
- `controlFirst`: boolean
  When true (default), switch appears before label. When false, label appears before switch.
- `size`: enum [default: base]
  - `"sm"`: Small switch for compact UIs
  - `"base"`: Default switch size
  - `"lg"`: Large switch for prominent toggles
- `checked`: boolean
- `disabled`: boolean
- `transitioning`: boolean
- `name`: string
- `type`: enum
- `value`: string | string[] | number
- `className`: string
- `id`: string
- `lang`: string
- `title`: string
- `onClick`: (event: React.MouseEvent) => void (required)
  Callback when switch is clicked

**Colors (kumo tokens used):**

`bg-kumo-brand`, `bg-kumo-brand-hover`, `bg-kumo-danger`, `bg-kumo-interact`, `bg-kumo-recessed`, `border-kumo-line`, `ring-kumo-danger`, `text-kumo-danger`, `text-kumo-default`, `text-kumo-subtle`

**Sub-Components:**

This is a compound component. Use these sub-components:

#### Switch.Item

Item sub-component

#### Switch.Group

Group sub-component

Props:
- `legend`: string (required)
- `children`: ReactNode (required)
- `error`: string
- `description`: ReactNode
- `disabled`: boolean
- `controlFirst`: boolean
- `className`: string


**Examples:**

```tsx
<Switch label="Switch" checked={checked} onCheckedChange={setChecked} />
```

```tsx
<Switch label="Disabled" checked={false} disabled />
```


---

### Table

Table component

**Type:** component

**Import:** `import { Table } from "@cloudflare/kumo";`

**Category:** Other

**Props:**

- `layout`: enum [default: auto]
  - `"auto"`: Auto table layout - columns resize based on content
  - `"fixed"`: Fixed table layout - columns have equal width, controlled via colgroup
- `variant`: enum [default: default]
  - `"default"`: Default row variant
  - `"selected"`: Selected row variant
- `className`: string
  Additional CSS classes
- `children`: ReactNode
  Child elements

**Colors (kumo tokens used):**

`bg-kumo-base`, `bg-kumo-ring`, `bg-kumo-tint`, `border-kumo-fill`, `text-kumo-default`

**Sub-Components:**

This is a compound component. Use these sub-components:

#### Table.Header

Header sub-component

#### Table.Head

Head sub-component

#### Table.Row

Row sub-component

#### Table.Body

Body sub-component

#### Table.Cell

Cell sub-component

#### Table.CheckCell

CheckCell sub-component

#### Table.CheckHead

CheckHead sub-component

#### Table.Footer

Footer sub-component

#### Table.ResizeHandle

ResizeHandle sub-component


**Examples:**

```tsx
<LayerCard>
      <LayerCard.Primary className="p-0">
        <Table>
          <Table.Header>
            <Table.Row>
              <Table.Head>Subject</Table.Head>
              <Table.Head>From</Table.Head>
              <Table.Head>Date</Table.Head>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {emailData.slice(0, 3).map((row) => (
              <Table.Row key={row.id}>
                <Table.Cell>{row.subject}</Table.Cell>
                <Table.Cell>{row.from}</Table.Cell>
                <Table.Cell>{row.date}</Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      </LayerCard.Primary>
    </LayerCard>
```

```tsx
<LayerCard>
      <LayerCard.Primary className="p-0">
        <Table>
          <Table.Header>
            <Table.Row>
              <Table.CheckHead aria-label="Select all rows" />
              <Table.Head>Subject</Table.Head>
              <Table.Head>From</Table.Head>
              <Table.Head>Date</Table.Head>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {emailData.slice(0, 3).map((row) => (
              <Table.Row key={row.id}>
                <Table.CheckCell aria-label={`Select ${row.subject}`} />
                <Table.Cell>{row.subject}</Table.Cell>
                <Table.Cell>{row.from}</Table.Cell>
                <Table.Cell>{row.date}</Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      </LayerCard.Primary>
    </LayerCard>
```

```tsx
<LayerCard>
      <LayerCard.Primary className="p-0">
        <Table>
          <Table.Header>
            <Table.Row>
              <Table.CheckHead aria-label="Select all rows" />
              <Table.Head>Subject</Table.Head>
              <Table.Head>From</Table.Head>
              <Table.Head>Date</Table.Head>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            <Table.Row>
              <Table.CheckCell aria-label="Select row 1" />
              <Table.Cell>Kumo v1.0.0 released</Table.Cell>
              <Table.Cell>Visal In</Table.Cell>
              <Table.Cell>5 seconds ago</Table.Cell>
            </Table.Row>
            <Table.Row variant="selected">
              <Table.CheckCell checked aria-label="Select row 2" />
              <Table.Cell>New Job Offer</Table.Cell>
              <Table.Cell>Cloudflare</Table.Cell>
              <Table.Cell>10 minutes ago</Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.CheckCell aria-label="Select row 3" />
              <Table.Cell>Daily Email Digest</Table.Cell>
              <Table.Cell>Cloudflare</Table.Cell>
              <Table.Cell>1 hour ago</Table.Cell>
            </Table.Row>
          </Table.Body>
        </Table>
      </LayerCard.Primary>
    </LayerCard>
```

```tsx
<LayerCard>
      <LayerCard.Primary className="p-0">
        <Table layout="fixed">
          <colgroup>
            <col />
            <col className="w-[150px]" />
            <col className="w-[150px]" />
          </colgroup>
          <Table.Header>
            <Table.Row>
              <Table.Head>Subject</Table.Head>
              <Table.Head>From</Table.Head>
              <Table.Head>Date</Table.Head>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {emailData.map((row) => (
              <Table.Row key={row.id}>
                <Table.Cell>{row.subject}</Table.Cell>
                <Table.Cell>{row.from}</Table.Cell>
                <Table.Cell>{row.date}</Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      </LayerCard.Primary>
    </LayerCard>
```

```tsx
<LayerCard>
      <LayerCard.Primary className="w-full overflow-x-auto p-0">
        <Table layout="fixed">
          <colgroup>
            <col style={{ width: "40px" }} />
            <col />
            <col style={{ width: "150px" }} />
            <col style={{ width: "120px" }} />
            <col style={{ width: "50px" }} />
          </colgroup>
          <Table.Header>
            <Table.Row>
              <Table.CheckHead aria-label="Select all rows" />
              <Table.Head>Subject</Table.Head>
              <Table.Head>From</Table.Head>
              <Table.Head>Date</Table.Head>
              <Table.Head></Table.Head>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {emailData.map((row, index) => (
              <Table.Row
                key={row.id}
                variant={index === 1 ? "selected" : "default"}
              >
                <Table.CheckCell
                  checked={index === 1}
                  aria-label={`Select ${row.subject}`}
                />
                <Table.Cell>
                  <div className="flex items-center gap-2">
                    <EnvelopeSimple size={16} />
                    <span className="truncate">{row.subject}</span>
                    {row.tags && (
                      <div className="ml-2 inline-flex gap-1">
                        {row.tags.map((tag) => (
                          <Badge key={tag}>{tag}</Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </Table.Cell>
                <Table.Cell>
                  <span className="truncate">{row.from}</span>
                </Table.Cell>
                <Table.Cell>
                  <span className="truncate">{row.date}</span>
                </Table.Cell>
                <Table.Cell className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    shape="square"
                    aria-label="More options"
                  >
                    <DotsThree weight="bold" size={16} />
                  </Button>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      </LayerCard.Primary>
    </LayerCard>
```


---

### Tabs

Tabs component

**Type:** component

**Import:** `import { Tabs } from "@cloudflare/kumo";`

**Category:** Navigation

**Props:**

- `tabs`: TabsItem[]
  Array of tab items to render
- `value`: string
  Controlled value. When set, component becomes controlled.
- `selectedValue`: string
  Default selected value for uncontrolled mode. Ignored when `value` is set.
- `activateOnFocus`: boolean
  When true, tabs are activated immediately upon receiving focus via arrow keys. When false (default), tabs receive focus but require Enter/Space to activate. Set to true for better keyboard UX in most cases.
- `className`: string
  Additional class name for the root element
- `listClassName`: string
  Additional class name for the tab list element
- `indicatorClassName`: string
  Additional class name for the indicator element
- `variant`: enum [default: segmented]
- `onValueChange`: (value: string) => void
  Callback when active tab changes

**Colors (kumo tokens used):**

`bg-kumo-brand`, `bg-kumo-overlay`, `bg-kumo-tint`, `border-kumo-line`, `border-kumo-tint`, `ring-kumo-fill-hover`, `ring-kumo-ring`, `text-kumo-default`, `text-kumo-strong`, `text-kumo-subtle`

**Styling:**


**Examples:**

```tsx
<div className="flex flex-col gap-6">
      <div>
        <p className="mb-2 text-sm text-kumo-subtle">Segmented (default)</p>
        <Tabs
          variant="segmented"
          tabs={[
            { value: "tab1", label: "Tab 1" },
            { value: "tab2", label: "Tab 2" },
            { value: "tab3", label: "Tab 3" },
          ]}
          selectedValue="tab1"
        />
      </div>
      <div>
        <p className="mb-2 text-sm text-kumo-subtle">Underline</p>
        <Tabs
          variant="underline"
          tabs={[
            { value: "tab1", label: "Tab 1" },
            { value: "tab2", label: "Tab 2" },
            { value: "tab3", label: "Tab 3" },
          ]}
          selectedValue="tab1"
        />
      </div>
    </div>
```

```tsx
<Tabs
      variant="segmented"
      tabs={[
        { value: "tab1", label: "Tab 1" },
        { value: "tab2", label: "Tab 2" },
        { value: "tab3", label: "Tab 3" },
      ]}
      selectedValue="tab1"
    />
```

```tsx
<div className="space-y-4">
      <Tabs
        tabs={[
          { value: "tab1", label: "Tab 1" },
          { value: "tab2", label: "Tab 2" },
          { value: "tab3", label: "Tab 3" },
        ]}
        value={activeTab}
        onValueChange={setActiveTab}
      />
      <p className="text-sm text-kumo-subtle">
        Active tab: <code className="text-sm">{activeTab}</code>
      </p>
    </div>
```

```tsx
<Tabs
      tabs={[
        { value: "overview", label: "Overview" },
        { value: "analytics", label: "Analytics" },
        { value: "reports", label: "Reports" },
        { value: "notifications", label: "Notifications" },
        { value: "settings", label: "Settings" },
        { value: "billing", label: "Billing" },
      ]}
      selectedValue="overview"
    />
```

```tsx
<Tabs
      tabs={[
        {
          value: "tab1",
          label: "Regular Tab",
        },
        {
          value: "tab2",
          label: "Link Tab",
          render: (props) => <a {...props} href="#tab2" />,
        },
        {
          value: "tab3",
          label: "Another Link",
          render: (props) => <a {...props} href="#tab3" />,
        },
      ]}
      selectedValue="tab1"
    />
```


---

### Text

Text component

**Type:** component

**Import:** `import { Text } from "@cloudflare/kumo";`

**Category:** Display

**Props:**

- `variant`: enum [default: body]
  - `"heading1"`: Large heading for page titles
  - `"heading2"`: Medium heading for section titles
  - `"heading3"`: Small heading for subsections
  - `"body"`: Default body text
  - `"secondary"`: Muted text for secondary information
  - `"success"`: Success state text
  - `"error"`: Error state text
  - `"mono"`: Monospace text for code
  - `"mono-secondary"`: Muted monospace text
- `size`: enum [default: base]
  - `"xs"`: Extra small text
  - `"sm"`: Small text
  - `"base"`: Default text size
  - `"lg"`: Large text
- `bold`: boolean
  Whether to use bold font weight (only applies to body variants)
- `as`: React.ElementType
  The element type to render as
- `children`: ReactNode
  Child text content

**Colors (kumo tokens used):**

`text-kumo-danger`, `text-kumo-default`, `text-kumo-link`, `text-kumo-subtle`

**Styling:**


**Examples:**

```tsx
<div className="grid w-full grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      <div className="flex flex-col justify-end gap-1 rounded-lg border border-kumo-line bg-kumo-base p-4">
        <Text variant="heading1">Heading 1</Text>
        <p className="font-mono text-xs text-kumo-subtle">text-3xl (30px)</p>
      </div>
      <div className="flex flex-col justify-end gap-1 rounded-lg border border-kumo-line bg-kumo-base p-4">
        <Text variant="heading2">Heading 2</Text>
        <p className="font-mono text-xs text-kumo-subtle">text-2xl (24px)</p>
      </div>
      <div className="flex flex-col justify-end gap-1 rounded-lg border border-kumo-line bg-kumo-base p-4">
        <Text variant="heading3">Heading 3</Text>
        <p className="font-mono text-xs text-kumo-subtle">text-lg (16px)</p>
      </div>
      <div className="flex flex-col justify-end gap-1 rounded-lg border border-kumo-line bg-kumo-base p-4">
        <Text>Body</Text>
        <p className="font-mono text-xs text-kumo-subtle">text-base (14px)</p>
      </div>
      <div className="flex flex-col justify-end gap-1 rounded-lg border border-kumo-line bg-kumo-base p-4">
        <Text bold>Body bold</Text>
        <p className="font-mono text-xs text-kumo-subtle">text-base (14px)</p>
      </div>
      <div className="flex flex-col justify-end gap-1 rounded-lg border border-kumo-line bg-kumo-base p-4">
        <Text size="lg">Body lg</Text>
        <p className="font-mono text-xs text-kumo-subtle">text-lg (16px)</p>
      </div>
      <div className="flex flex-col justify-end gap-1 rounded-lg border border-kumo-line bg-kumo-base p-4">
        <Text size="sm">Body sm</Text>
        <p className="font-mono text-xs text-kumo-subtle">text-sm (13px)</p>
      </div>
      <div className="flex flex-col justify-end gap-1 rounded-lg border border-kumo-line bg-kumo-base p-4">
        <Text size="xs">Body xs</Text>
        <p className="font-mono text-xs text-kumo-subtle">text-xs (12px)</p>
      </div>
      <div className="flex flex-col justify-end gap-1 rounded-lg border border-kumo-line bg-kumo-base p-4">
        <Text variant="secondary">Body secondary</Text>
        <p className="font-mono text-xs text-kumo-subtle">text-base (14px)</p>
      </div>
      <div className="flex flex-col justify-end gap-1 rounded-lg border border-kumo-line bg-kumo-base p-4">
        <Text variant="mono">Monospace</Text>
        <p className="font-mono text-xs text-kumo-subtle">text-sm (13px)</p>
      </div>
      <div className="flex flex-col justify-end gap-1 rounded-lg border border-kumo-line bg-kumo-base p-4">
        <Text variant="mono" size="lg">
          Monospace lg
        </Text>
        <p className="font-mono text-xs text-kumo-subtle">text-base (14px)</p>
      </div>
      <div className="flex flex-col justify-end gap-1 rounded-lg border border-kumo-line bg-kumo-base p-4">
        <Text variant="mono-secondary">Monospace secondary</Text>
        <p className="font-mono text-xs text-kumo-subtle">text-sm (13px)</p>
      </div>
      <div className="flex flex-col justify-end gap-1 rounded-lg border border-kumo-line bg-kumo-base p-4">
        <Text variant="success">Success</Text>
        <p className="font-mono text-xs text-kumo-subtle">text-base (14px)</p>
      </div>
      <div className="flex flex-col justify-end gap-1 rounded-lg border border-kumo-line bg-kumo-base p-4">
        <Text variant="error">Error</Text>
        <p className="font-mono text-xs text-kumo-subtle">text-base (14px)</p>
      </div>
    </div>
```


---

### Toasty

Toasty component

**Type:** component

**Import:** `import { Toasty } from "@cloudflare/kumo";`

**Category:** Feedback

**Props:**

- `variant`: enum [default: default]
  - `"default"`: Default toast style
  - `"error"`: Error toast for critical issues
  - `"warning"`: Warning toast for cautionary messages
- `className`: string
  Additional CSS classes
- `children`: ReactNode
  Child elements

**Colors (kumo tokens used):**

`bg-kumo-contrast`, `bg-kumo-control`, `bg-kumo-fill-hover`, `border-kumo-fill`, `text-kumo-default`, `text-kumo-strong`, `text-kumo-subtle`

**Styling:**


---

### Tooltip

Tooltip component

**Type:** component

**Import:** `import { Tooltip } from "@cloudflare/kumo";`

**Category:** Overlay

**Props:**

- `align`: enum
- `asChild`: boolean
- `className`: string
- `side`: enum [default: top]
  - `"top"`: Tooltip appears above the trigger
  - `"bottom"`: Tooltip appears below the trigger
  - `"left"`: Tooltip appears to the left of the trigger
  - `"right"`: Tooltip appears to the right of the trigger
- `content`: ReactNode (required)
  Content to display in the tooltip

**Colors (kumo tokens used):**

`bg-kumo-base`, `fill-kumo-base`, `fill-kumo-tip-shadow`, `fill-kumo-tip-stroke`, `outline-kumo-fill`, `text-kumo-default`

**Examples:**

```tsx
<TooltipProvider>
      <Tooltip content="Add new item" asChild>
        <Button shape="square" icon={PlusIcon} />
      </Tooltip>
    </TooltipProvider>
```

```tsx
<TooltipProvider>
      <div className="flex gap-2">
        <Tooltip content="Add" asChild>
          <Button shape="square" icon={PlusIcon} />
        </Tooltip>
        <Tooltip content="Change language" asChild>
          <Button shape="square" icon={TranslateIcon} />
        </Tooltip>
      </div>
    </TooltipProvider>
```


---

### InputArea

Multi-line textarea input with Input variants and InputArea-specific dimensions

**Type:** component

**Import:** `import { InputArea } from "@cloudflare/kumo (synthetic - uses Input component)";`

**Category:** Input

**Props:**


**Styling:**

- **Size Variants:**
  - `xs`:
  - `sm`:
  - `base`:
  - `lg`:

## Quick Reference

**Components by Category:**
- **Display:** Badge, Breadcrumbs, Code, Collapsible, Empty, LayerCard, Meter, Text
- **Feedback:** Banner, Loader, Toasty
- **Action:** Button, ClipboardText
- **Input:** Checkbox, Combobox, DateRangePicker, Field, Input, Radio, Select, Switch
- **Navigation:** CommandPalette, MenuBar, Pagination, Tabs
- **Overlay:** Dialog, DropdownMenu, Popover, Tooltip
- **Layout:** Grid, Surface, PageHeader, ResourceListPage
- **Other:** Label, Link, SensitiveInput, Table
