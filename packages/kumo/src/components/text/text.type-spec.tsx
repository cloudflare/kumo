/**
 * Type-level specification for the Text component.
 *
 * This file is NOT a vitest test file (no `.test.tsx` suffix) — it lives in
 * the regular tsconfig `include` glob so `tsc --noEmit` (i.e.
 * `pnpm typecheck`) evaluates every `@ts-expect-error` directive. If one of
 * the "should be a compile error" cases below stops being an error, tsc
 * will fail with "Unused '@ts-expect-error' directive" and CI goes red.
 *
 * This mirrors the DefinitelyTyped / type-fest convention of keeping
 * type-only assertions alongside the implementation, checked at the type
 * layer rather than at runtime.
 */

import { Text } from "./text";

// ---------------------------------------------------------------------------
// Positive cases — these MUST compile cleanly.
// ---------------------------------------------------------------------------

// Heading has no implied semantic element and supports an optional large size.
const _headingDefault = <Text variant="heading">Decorative heading</Text>;
const _headingH1 = (
  <Text variant="heading" size="lg" as="h1">
    Page title
  </Text>
);
const _headingH2 = (
  <Text variant="heading" as="h2">
    Section title
  </Text>
);

// Deprecated heading variants remain available for backwards compatibility.
const _deprecatedHeadingH1 = (
  <Text variant="heading1" as="h1">
    Legacy page title
  </Text>
);
const _deprecatedHeadingH2 = (
  <Text variant="heading2" as="h2">
    Legacy section title
  </Text>
);
const _deprecatedHeadingH3 = (
  <Text variant="heading3" as="h3">
    Legacy subsection
  </Text>
);

// Body variant — `as` is optional.
const _bodyDefault = <Text>Body copy</Text>;
const _bodyExplicit = <Text variant="body">Body copy</Text>;
const _bodyInline = (
  <Text variant="body" as="span">
    Inline body
  </Text>
);

// Secondary / success / error (Copy family) — `as` optional.
const _secondary = <Text variant="secondary">Muted</Text>;
const _success = <Text variant="success">OK</Text>;
const _error = <Text variant="error">Broken</Text>;

// Monospace — `as` optional (defaults to span).
const _mono = <Text variant="mono">console.log()</Text>;
const _monoSecondary = <Text variant="mono-secondary">comment</Text>;

// Non-standard text elements — `as` accepts definition list, label, pre, code, etc.
const _dt = <Text as="dt">Term</Text>;
const _dd = <Text as="dd">Definition</Text>;
const _label = <Text as="label">Field label</Text>;
const _code = (
  <Text variant="mono" as="code">
    const x = 1
  </Text>
);
const _pre = (
  <Text variant="mono" as="pre">
    preformatted
  </Text>
);
const _li = <Text as="li">List item</Text>;
const _figcaption = (
  <Text variant="secondary" as="figcaption">
    Caption
  </Text>
);
const _legend = <Text as="legend">Fieldset legend</Text>;
const _em = <Text as="em">Emphasized</Text>;
const _strong = <Text as="strong">Important</Text>;
const _small = (
  <Text variant="secondary" as="small">
    Fine print
  </Text>
);
const _time = <Text as="time">2026-04-27</Text>;
const _headingAsLabel = (
  <Text variant="heading" as="label">
    Form heading
  </Text>
);

// ---------------------------------------------------------------------------
// Negative cases — these MUST NOT compile. The `@ts-expect-error` directive
// asserts that tsc produces an error on the following line; if it doesn't,
// tsc itself fails the typecheck with "Unused '@ts-expect-error' directive".
// ---------------------------------------------------------------------------

// Heading only supports its default size and `lg`.
const _invalidHeadingSize = (
  // @ts-expect-error — heading does not support body text sizes
  <Text variant="heading" size="base">
    Invalid
  </Text>
);

// Deprecated heading variants continue to require `as`.
// @ts-expect-error — deprecated heading variants require `as`
const _missingAsH1 = <Text variant="heading1">Missing as</Text>;

// @ts-expect-error — deprecated heading variants require `as`
const _missingAsH2 = <Text variant="heading2">Missing as</Text>;

// @ts-expect-error — deprecated heading variants require `as`
const _missingAsH3 = <Text variant="heading3">Missing as</Text>;

// Silence unused-variable warnings for all the sentinels above.
// This file is never executed; it exists purely for type checking.
export const __typeSpec = {
  _headingDefault,
  _headingH1,
  _headingH2,
  _deprecatedHeadingH1,
  _deprecatedHeadingH2,
  _deprecatedHeadingH3,
  _bodyDefault,
  _bodyExplicit,
  _bodyInline,
  _secondary,
  _success,
  _error,
  _mono,
  _monoSecondary,
  _dt,
  _dd,
  _label,
  _code,
  _pre,
  _li,
  _figcaption,
  _legend,
  _em,
  _strong,
  _small,
  _time,
  _headingAsLabel,
  _invalidHeadingSize,
  _missingAsH1,
  _missingAsH2,
  _missingAsH3,
};
