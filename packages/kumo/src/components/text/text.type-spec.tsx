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

// Role-based heading variants with required `as`.
const _display = (
  <Text variant="display" as="h1">
    Welcome
  </Text>
);
const _pageTitle = (
  <Text variant="page-title" as="h1">
    Account settings
  </Text>
);
const _sectionTitle = (
  <Text variant="section-title" as="h2">
    General
  </Text>
);
const _heading = (
  <Text variant="heading" as="h3">
    API tokens
  </Text>
);

// Deprecated numeric aliases still compile (soft deprecation).
const _headingH1 = (
  <Text variant="heading1" as="h1">
    Page Title
  </Text>
);
const _headingH2 = (
  <Text variant="heading2" as="h2">
    Section Title
  </Text>
);
const _headingH3 = (
  <Text variant="heading3" as="h3">
    Subsection
  </Text>
);

// Heading variant using `as="span"` for decorative (non-section) usage.
const _decorativeHeading = (
  <Text variant="display" as="span">
    Big bold label
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
  <Text variant="page-title" as="label">
    Form heading
  </Text>
);

// ---------------------------------------------------------------------------
// Negative cases — these MUST NOT compile. The `@ts-expect-error` directive
// asserts that tsc produces an error on the following line; if it doesn't,
// tsc itself fails the typecheck with "Unused '@ts-expect-error' directive".
// ---------------------------------------------------------------------------

// Missing `as` on new role-based heading variants → type error.
// @ts-expect-error — heading variants require `as`
const _missingAsDisplay = <Text variant="display">Missing as</Text>;
// @ts-expect-error — heading variants require `as`
const _missingAsPageTitle = <Text variant="page-title">Missing as</Text>;
// @ts-expect-error — heading variants require `as`
const _missingAsSectionTitle = <Text variant="section-title">Missing as</Text>;
// @ts-expect-error — heading variants require `as`
const _missingAsHeading = <Text variant="heading">Missing as</Text>;

// Missing `as` on deprecated aliases still errors.
// @ts-expect-error — heading variants require `as`
const _missingAsH1 = <Text variant="heading1">Missing as</Text>;
// @ts-expect-error — heading variants require `as`
const _missingAsH2 = <Text variant="heading2">Missing as</Text>;
// @ts-expect-error — heading variants require `as`
const _missingAsH3 = <Text variant="heading3">Missing as</Text>;

// `bold` prop is allowed on copy variants (body, secondary, success, error)
// where it bumps weight to font-medium. Reject on headings (already carry
// their role's weight) and mono (design decision — mono stays regular).
const _boldBody = <Text bold>Bold body</Text>;
const _boldSecondary = (
  <Text variant="secondary" bold>
    Bold secondary
  </Text>
);
const _boldSuccess = (
  <Text variant="success" bold>
    Bold success
  </Text>
);
const _boldError = (
  <Text variant="error" bold>
    Bold error
  </Text>
);
const _boldHeading = (
  <Text
    variant="heading"
    as="h3"
    // @ts-expect-error — bold is disallowed on heading variants; already medium/semibold
    bold
  >
    Bold heading
  </Text>
);
const _boldSectionTitle = (
  <Text
    variant="section-title"
    as="h2"
    // @ts-expect-error — bold is disallowed on section-title
    bold
  >
    Bold section title
  </Text>
);
const _boldMono = (
  <Text
    variant="mono"
    // @ts-expect-error — bold is disallowed on mono
    bold
  >
    Bold mono
  </Text>
);

// Silence unused-variable warnings for all the sentinels above.
// This file is never executed; it exists purely for type checking.
export const __typeSpec = {
  _display,
  _pageTitle,
  _sectionTitle,
  _heading,
  _headingH1,
  _headingH2,
  _headingH3,
  _decorativeHeading,
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
  _missingAsDisplay,
  _missingAsPageTitle,
  _missingAsSectionTitle,
  _missingAsHeading,
  _missingAsH1,
  _missingAsH2,
  _missingAsH3,
  _boldBody,
  _boldSecondary,
  _boldSuccess,
  _boldError,
  _boldHeading,
  _boldSectionTitle,
  _boldMono,
};
