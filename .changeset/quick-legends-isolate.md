---
"@cloudflare/kumo": minor
---

feat(chart): add `enableLegendSelection` prop to `TimeseriesChart`

Opt-in (default `false`) hidden ECharts legend that lets consumers drive series
visibility imperatively via the `legendSelect` / `legendUnSelect` /
`legendToggleSelect` actions — useful for building a custom interactive legend
with `ChartLegend`. Series toggled off via the legend are also excluded from the
tooltip. Requires registering ECharts' `LegendComponent`
(`echarts.use([LegendComponent])`). When disabled, behaviour is unchanged.
