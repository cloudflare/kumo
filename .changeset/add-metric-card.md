---
"@cloudflare/kumo": minor
---

Add `MetricCard` and `MetricCardGroup` components for displaying dashboard-style metric summaries. `MetricCard` supports labels, values, units, trend indicators, loading/error states, tooltips, clickable cards, and lightweight SVG sparklines. `MetricCardGroup` wraps cards in a `LayerCard` with optional title and supports horizontal wrapping or vertical stacked layouts.

```tsx
<MetricCardGroup title="Workers Analytics">
  <MetricCard
    label="Requests"
    value="1.2"
    unit="M"
    trend={{ direction: "up", label: "12%", isPositive: true }}
  />
  <MetricCard
    label="CPU Time (P90)"
    value="3.2"
    unit="ms"
    trend={{ direction: "down", label: "8%", isPositive: true }}
    sparkline={{
      data: [
        4.1, 3.9, 4.2, 3.8, 3.5, 3.9, 3.6, 3.4, 3.7, 3.3, 3.5, 3.1, 3.4,
        3.0, 3.3, 3.2,
      ],
    }}
  />
</MetricCardGroup>
```
