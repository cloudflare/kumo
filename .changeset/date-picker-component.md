---
"@cloudflare/kumo": minor
---

Add DatePicker component built on react-day-picker v9

**New Component: DatePicker**
- Three selection modes: `single`, `multiple`, and `range`
- Forwards all react-day-picker props for maximum flexibility
- Styled with Kumo tokens (no external CSS import needed)
- Supports localization via date-fns locales
- Supports timezone via `timeZone` prop
- Custom modifiers for highlighting specific dates
- Footer prop for messages/usage limits
- Accessible keyboard navigation with Kumo-styled focus rings

**Usage:**
```tsx
// Single date
<DatePicker mode="single" selected={date} onSelect={setDate} />

// Multiple dates
<DatePicker mode="multiple" selected={dates} onSelect={setDates} max={5} />

// Date range
<DatePicker mode="range" selected={range} onSelect={setRange} numberOfMonths={2} />
```

**Composing with Popover:**
```tsx
<Popover>
  <Popover.Trigger asChild>
    <Button variant="outline" icon={CalendarDotsIcon}>Pick a date</Button>
  </Popover.Trigger>
  <Popover.Content className="p-3">
    <DatePicker mode="single" selected={date} onSelect={setDate} />
  </Popover.Content>
</Popover>
```

**Note:** Consider using `DatePicker` with `mode="range"` instead of `DateRangePicker` for new projects - it offers more flexibility and a smaller bundle size.

**Internal changes:**
- Added `react-day-picker` v9 as a dependency
- Updated lint rule to allow components without KUMO_*_VARIANTS exports
- Updated component registry codegen to handle variant-less components
- Disabled `jsx-a11y/no-autofocus` rule (intentional prop forwarding)
