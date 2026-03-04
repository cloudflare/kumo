import { useEffect, useMemo, useState, type Dispatch, type SetStateAction } from "react";
import { parseColor } from "react-aria-components";

export type ColorPickerInternalColor = ReturnType<typeof parseColor>;

type ColorPickerStateBridge = {
  internalColor: ColorPickerInternalColor;
  setInternalColor: Dispatch<SetStateAction<ColorPickerInternalColor>>;
};

function safeParseColor(value: string | undefined): ColorPickerInternalColor {
  try {
    return parseColor(value ?? "#000000");
  } catch {
    return parseColor("#000000");
  }
}

/**
 * Bridge external controlled hex value with internal Color object semantics.
 * Keeps drag interactions stable while preserving one-way sync from external value.
 */
export function useColorPickerStateBridge(value?: string): ColorPickerStateBridge {
  const externalColor = useMemo(() => safeParseColor(value), [value]);
  const externalHex = useMemo(() => externalColor.toString("hex"), [externalColor]);
  const [internalColor, setInternalColor] = useState<ColorPickerInternalColor>(
    externalColor,
  );

  useEffect(() => {
    setInternalColor((previous: ColorPickerInternalColor) =>
      previous.toString("hex") === externalHex ? previous : externalColor,
    );
  }, [externalColor, externalHex]);

  return {
    internalColor,
    setInternalColor,
  };
}
