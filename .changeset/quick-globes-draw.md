---
"@cloudflare/kumo": minor
---

Render GlobeMap land from simplified Natural Earth geometry for smoother coastlines and faster rotation, improve marker hover targets and tooltips, preserve touch scrolling when dragging is disabled, and only pause auto-rotation and show a focus ring on the globe edge for keyboard focus. The land hatching now moves with the globe and auto-rotation runs at an even cadence, removing line flicker while spinning. The default land colour now uses the `--text-color-kumo-subtle` token, so it follows the page's light/dark mode (`data-mode`) rather than the `isDarkMode` prop; pass `landColor` to override it.

GlobeMap now supports BubbleMap-style bubbles: give markers a `value` to size them by area between `minRadius` and `maxRadius` (or via `bubbleSize`), format tooltip values with `valueFormat`, and style them with `markerOpacity`, `markerBorderColor` and `markerBorderWidth`. Markers are now borderless by default (`markerBorderWidth` defaults to `0`), matching BubbleMap. Larger bubbles are drawn first, and hovering the globe with a mouse pauses auto-rotation when there is something to inspect.

GlobeMap can also shade countries like ChoroplethMap: pass `regionGeoJson` and `regions` (joined by `regionNameProperty`, with an optional display `label`) to hatch matched regions along `regionColorRange`, with a compact hover tooltip. Standard RFC 7946 winding is handled automatically. Adds the `GlobeMapRegion` type export.

Maps can now be driven from outside, for example from a list: GlobeMap `activeMarker` / `activeRegion` rotate the globe to the item, pause auto-rotation, highlight it and show its tooltip; BubbleMap `activeIndex` and ChoroplethMap `activeRegion` highlight the item and show its tooltip. All three wait for the value to settle (`activeDelay`, default 300ms, then at most 100ms when moving between items; clearing is immediate) before reacting, so sweeping the pointer across a list doesn't make the map chase every item. BubbleMap and ChoroplethMap also no longer re-apply their options when a parent re-renders with inline `value` / `valueFormat` / `tooltipFormatter` functions or an inline `colorRange`.

GlobeMap is now tree-shakeable, so apps that only use BubbleMap or ChoroplethMap no longer bundle the globe and its land data.

Rotating a globe with many regions and markers is cheaper: regions fully on the visible side skip horizon clipping, hatch patterns are only kept for visible regions, and markers move with a single transform.

Inline `onUserRotationChange` callbacks no longer restart the globe's focus animation. Unknown choropleth region names clear the previous focus and tooltip. Open flat-map tooltips refresh when formatter output changes without rebuilding chart options.
