---
"@cloudflare/kumo": minor
---

Add a `disabled` prop to `LinkButton`. When disabled, it renders a real disabled `<button>` (dropping anchor-only attributes and event handlers) and supports `title` tooltips explaining why the action is unavailable.

Also removes stale Storybook references from the README and drops `.stories.tsx` generation from the component scaffolder, since Storybook is no longer set up in this repo.
