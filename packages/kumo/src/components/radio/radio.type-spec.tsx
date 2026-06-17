/**
 * Type-level specification for the Radio component.
 *
 * This file is NOT a vitest test file (no `.test.tsx` suffix) — it lives in
 * the regular tsconfig `include` glob so `tsc --noEmit` (i.e.
 * `pnpm typecheck`) evaluates every `@ts-expect-error` directive. If one of
 * the "should be a compile error" cases below stops being an error, tsc
 * will fail with "Unused '@ts-expect-error' directive" and CI goes red.
 */

import {
  Radio,
  type RadioGroupChangeEventDetails,
  type RadioGroupProps,
  type RadioItemProps,
} from "./radio";

// ---------------------------------------------------------------------------
// Positive cases — these MUST compile cleanly.
// ---------------------------------------------------------------------------

enum ThemeType {
  light = "light",
  dark = "dark",
  system = "system",
}

const numericGroup = (
  <Radio.Group<number>
    legend="Items per page"
    value={25}
    defaultValue={10}
    onValueChange={(value, eventDetails) => {
      value.toFixed();
      eventDetails.allowPropagation();
    }}
  >
    <Radio.Item<number> label="10" value={10} />
    <Radio.Item<number> label="25" value={25} />
  </Radio.Group>
);

const enumGroup = (
  <Radio.Group<ThemeType>
    legend="Theme"
    value={ThemeType.system}
    onValueChange={(value) => {
      const theme: ThemeType = value;
      void theme;
    }}
  >
    <Radio.Item<ThemeType> label="Light" value={ThemeType.light} />
    <Radio.Item<ThemeType> label="System" value={ThemeType.system} />
  </Radio.Group>
);

const stringGroup = (
  <Radio.Group legend="Theme" value="system">
    <Radio.Item label="Light" value="light" />
    <Radio.Item label="System" value="system" />
  </Radio.Group>
);

const numericGroupProps: RadioGroupProps<number> = {
  children: numericGroup,
  value: 50,
  onValueChange: (value, eventDetails) => {
    value.toFixed();
    const details: RadioGroupChangeEventDetails = eventDetails;
    details.cancel();
  },
};

const numericItemProps: RadioItemProps<number> = {
  label: "50",
  value: 50,
};

// ---------------------------------------------------------------------------
// Negative cases — these MUST NOT compile. The `@ts-expect-error` directive
// asserts that tsc produces an error on the following line; if it doesn't,
// tsc itself fails the typecheck with "Unused '@ts-expect-error' directive".
// ---------------------------------------------------------------------------

// @ts-expect-error - default radio values are strings when no generic is provided.
const defaultStringValue: RadioGroupProps = { children: stringGroup, value: 1 };

const mismatchedGroupValue: RadioGroupProps<number> = {
  children: numericGroup,
  // @ts-expect-error - generic group values must match the declared value type.
  value: "25",
};

const mismatchedItemValue: RadioItemProps<number> = {
  label: "25",
  // @ts-expect-error - generic item values must match the declared value type.
  value: "25",
};

// Silence unused-variable warnings for all the sentinels above.
// This file is never executed; it exists purely for type checking.
export const __typeSpec = {
  numericGroup,
  enumGroup,
  stringGroup,
  numericGroupProps,
  numericItemProps,
  defaultStringValue,
  mismatchedGroupValue,
  mismatchedItemValue,
};
