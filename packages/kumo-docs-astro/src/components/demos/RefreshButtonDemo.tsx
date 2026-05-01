import { useState } from "react";
import { RefreshButton } from "@cloudflare/kumo";

/** Idle and loading states side by side. */
export function RefreshButtonBasicDemo() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <RefreshButton />
      <RefreshButton loading />
    </div>
  );
}

/** Click to toggle the loading state for ~1s. */
export function RefreshButtonInteractiveDemo() {
  const [loading, setLoading] = useState(false);
  return (
    <RefreshButton
      loading={loading}
      onClick={() => {
        setLoading(true);
        setTimeout(() => setLoading(false), 1000);
      }}
    />
  );
}

/** Sizes track Button's size prop. */
export function RefreshButtonSizesDemo() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <RefreshButton size="xs" />
      <RefreshButton size="sm" />
      <RefreshButton size="base" />
      <RefreshButton size="lg" />
    </div>
  );
}

/** Override `aria-label` for localised contexts. */
export function RefreshButtonAriaLabelDemo() {
  return <RefreshButton aria-label="Reload analytics" />;
}
