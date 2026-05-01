---
"@cloudflare/kumo": patch
---

Forward all Base UI Panel props (including `keepMounted` and `hiddenUntilFound`) through `Collapsible.DefaultPanel`. Previously these were silently dropped because `DefaultPanel` used a standalone props interface instead of extending `BasePanelProps`.
