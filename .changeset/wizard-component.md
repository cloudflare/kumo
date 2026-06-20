---
"@cloudflare/kumo": minor
---

Add `Wizard` — a fullscreen, multi-step flow built as a single composable compound component.

- compound API — `Wizard.Fullscreen`/`Wizard.Grid`/`Wizard`/`Wizard.Sidebar`/`Wizard.Steps`/`Wizard.Step`/`Wizard.Page`/`Wizard.CloseButton`, plus `useWizard` and `useWizardGrid` hooks
- non-linear step navigation via `goToStep` and a declarative `when` prop for conditional branching
- fullscreen overlay with scroll lock, esc to dismiss, and a close button
- optional left-side title (via `Wizard.Grid` `title`) and composable right-side step indicator via `Wizard.Sidebar`
- optional decorative wireframe grid
- `width` prop on `Wizard.Fullscreen` — controls the card max-width (`"narrow"` / `"wide"`)
- optional `header` on `Wizard.Fullscreen` for custom top chrome
- `Wizard.CloseButton` for placing the close button inside a custom header
- `useWizard()` for step state and navigation (`next`, `back`, `goToStep`, `close`, `complete`)
- `previousStepNavigation` prop to disable implicit go-back affordances
- controlled (`step` + `onStepChange`) and uncontrolled (`defaultStep`) modes
- i18n-ready — aria-labels overridable via `labels` props

```tsx
import { Wizard, useWizard, useWizardGrid } from "@cloudflare/kumo";

function CreateWorker({ open, onClose }) {
  const { gridProps, onActiveStepElementChange } = useWizardGrid();

  return (
    <Wizard.Fullscreen open={open} onClose={onClose}>
      <Wizard.Grid title="Create a Worker" {...gridProps}>
        <Wizard onActiveStepElementChange={onActiveStepElementChange}>
          <Wizard.Sidebar />
          <Wizard.Steps>
            <Wizard.Step stepKey="method" label="Select a method">
              <Wizard.Page title="Ship something new" footer={<Footer />}>
                {/* ... */}
              </Wizard.Page>
            </Wizard.Step>
            {/* ...more steps */}
          </Wizard.Steps>
        </Wizard>
      </Wizard.Grid>
    </Wizard.Fullscreen>
  );
}
```
