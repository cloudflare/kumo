---
"@cloudflare/kumo": minor
---

feat(tooltip, popover): deprecate `asChild` in favor of `render` prop

Unifies composition patterns across the library by adopting Base UI's `render` prop pattern. The `asChild` prop is now deprecated on:

- `Tooltip`
- `Popover.Trigger`
- `Popover.Close`

**Migration:**

```diff
- <Tooltip content="Save" asChild>
-   <Button>Save</Button>
- </Tooltip>
+ <Tooltip content="Save" render={<Button>Save</Button>} />

- <Popover.Trigger asChild>
-   <Button>Open</Button>
- </Popover.Trigger>
+ <Popover.Trigger render={<Button>Open</Button>} />

- <Popover.Close asChild>
-   <Button>Close</Button>
- </Popover.Close>
+ <Popover.Close render={<Button>Close</Button>} />
```

The `asChild` prop remains functional for backward compatibility but will be removed in a future major version.
