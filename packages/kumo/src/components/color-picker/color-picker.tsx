import { Eyedropper } from "@phosphor-icons/react";
import { useContext, useEffect, useState } from "react";
import {
  ColorPickerStateContext,
  Input as AriaInput,
  parseColor,
} from "react-aria-components";
import { cn } from "../../utils/cn";
import { Button } from "../button";
import { Input } from "../input";
import { Popover } from "../popover";
import { Select } from "../select";
import {
  ColorArea,
  ColorField,
  ColorPicker as AriaColorPicker,
  ColorSlider,
  ColorSwatch,
  ColorThumb,
  SliderTrack,
} from "./color-primitives";
import {
  type ColorPickerInternalColor,
  useColorPickerStateBridge,
} from "./use-color-picker-state-bridge";

export const KUMO_COLOR_PICKER_VARIANTS = {} as const;

export const KUMO_COLOR_PICKER_DEFAULT_VARIANTS = {} as const;

const COLOR_CHANNEL_INPUT_CLASS =
  "flex h-9 w-full rounded-lg bg-kumo-control px-2 py-1 text-center text-xs font-mono text-kumo-default ring ring-kumo-line placeholder:text-kumo-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-kumo-ring disabled:cursor-not-allowed disabled:opacity-50";

const COLOR_SPACE_CHANNELS = {
  rgb: ["red", "green", "blue"],
  hsl: ["hue", "saturation", "lightness"],
  hsb: ["hue", "saturation", "brightness"],
} as const;

type ChannelSpace = keyof typeof COLOR_SPACE_CHANNELS;
type ColorSpace = ChannelSpace | "hex";
type ColorChannel =
  | "red"
  | "green"
  | "blue"
  | "hue"
  | "saturation"
  | "lightness"
  | "brightness";

/**
 * ColorPicker component props.
 *
 * Keeps external value protocol as hex while preserving internal Color object semantics.
 */
export interface ColorPickerProps {
  /** Controlled color value in hex format, e.g. `#f48120`. */
  value?: string;
  /** Fires whenever a new color is committed; emits normalized hex output. */
  onChange?: (hex: string) => void;
  /** Disable trigger and picker interactions. */
  disabled?: boolean;
  /** When false, hide trigger text and only show color swatch. */
  showValue?: boolean;
  /** Additional CSS classes merged via `cn()`. */
  className?: string;
}

type EyeDropperResult = {
  sRGBHex: string;
};

type EyeDropperInstance = {
  open: () => Promise<EyeDropperResult>;
};

type EyeDropperWindow = Window & {
  EyeDropper?: new () => EyeDropperInstance;
};

function supportsEyeDropper(win: Window): win is EyeDropperWindow {
  return typeof (win as EyeDropperWindow).EyeDropper === "function";
}

function isAbortError(error: unknown): boolean {
  return error instanceof DOMException && error.name === "AbortError";
}

/* ========================================================================
   EyeDropper Button
   ======================================================================== */
function EyeDropperButton() {
  const state = useContext(ColorPickerStateContext);

  if (typeof window === "undefined" || !supportsEyeDropper(window)) {
    return null;
  }

  const handlePick = () => {
    const currentWindow = window as EyeDropperWindow;
    if (!currentWindow.EyeDropper) {
      return;
    }

    const picker = new currentWindow.EyeDropper();
    picker
      .open()
      .then((result: EyeDropperResult) => {
        const colorState = state as
          | {
              setColor?: (color: ColorPickerInternalColor) => void;
            }
          | null;
        colorState?.setColor?.(parseColor(result.sRGBHex));
      })
      .catch((error: unknown) => {
        // 用户取消吸管属于正常交互，不输出告警；其余异常在开发环境可观测。
        if (!isAbortError(error) && process.env.NODE_ENV !== "production") {
          console.warn("[Kumo ColorPicker]: EyeDropper failed.", error);
        }
      });
  };

  return (
    <Button
      variant="outline"
      size="sm"
      shape="square"
      className="h-9 w-9 shrink-0"
      onClick={handlePick}
      title="Pick a color from screen"
      aria-label="Pick color from screen"
    >
      <Eyedropper className="h-4 w-4" weight="bold" />
    </Button>
  );
}

/* ========================================================================
   ColorPicker Component
   ======================================================================== */
export function ColorPicker({
  value,
  onChange,
  className,
  disabled,
  showValue = true,
}: ColorPickerProps) {
  const { internalColor, setInternalColor } = useColorPickerStateBridge(value);
  const [colorSpace, setColorSpace] = useState<ColorSpace>("hex");
  const [hexInputValue, setHexInputValue] = useState(
    () => internalColor.toString("hex"),
  );
  const channels =
    colorSpace === "hex" ? null : COLOR_SPACE_CHANNELS[colorSpace];
  const triggerSwatchClassName = showValue
    ? "size-6 shrink-0 rounded-md ring ring-kumo-line"
    : "h-5 w-full rounded-md ring ring-kumo-line";

  const handleColorChange = (newColor: ColorPickerInternalColor) => {
    setInternalColor(newColor);
    onChange?.(newColor.toString("hex"));
  };

  useEffect(() => {
    setHexInputValue(internalColor.toString("hex"));
  }, [internalColor]);

  const commitHexInput = (hexValue: string) => {
    try {
      handleColorChange(parseColor(hexValue));
    } catch (error) {
      if (process.env.NODE_ENV !== "production") {
        console.warn("[Kumo ColorPicker]: Invalid hex input.", error);
      }
    }
  };

  const renderChannelInputs = (
    space: ChannelSpace,
    channelList: readonly ColorChannel[],
  ) => (
    <>
      {channelList.map((channel) => (
        <ColorField key={channel} colorSpace={space} channel={channel} className="flex-1">
          <AriaInput
            className={COLOR_CHANNEL_INPUT_CLASS}
            placeholder={channel[0]?.toUpperCase() ?? ""}
          />
        </ColorField>
      ))}
    </>
  );

  return (
    <AriaColorPicker value={internalColor} onChange={handleColorChange}>
      <Popover>
        <Popover.Trigger asChild>
          <Button
            variant="outline"
            disabled={disabled}
            className={cn(
              "w-full justify-start rounded-lg px-2 text-left font-normal",
              className,
            )}
          >
            <div className="flex w-full items-center gap-2">
              <ColorSwatch color={internalColor} className={triggerSwatchClassName} />
              {showValue && (
                <span className="truncate font-mono text-sm uppercase text-kumo-subtle">
                  {internalColor.toString("hex")}
                </span>
              )}
            </div>
          </Button>
        </Popover.Trigger>
        <Popover.Content className="w-64 p-3" sideOffset={8}>
          <div className="flex flex-col gap-3">
            <ColorArea
              colorSpace="hsb"
              xChannel="saturation"
              yChannel="brightness"
              className="aspect-square w-full shrink-0"
            >
              <ColorThumb />
            </ColorArea>

            <ColorSlider channel="hue" colorSpace="hsb" className="mt-1 w-full">
              <SliderTrack className="h-3 w-full rounded-full">
                <ColorThumb className="top-1/2" />
              </SliderTrack>
            </ColorSlider>

            <div className="flex min-w-0 items-center gap-2">
              <EyeDropperButton />
              <Select
                value={colorSpace}
                onValueChange={(nextValue) => setColorSpace(nextValue as ColorSpace)}
                className="h-9 w-[72px] shrink-0 rounded-lg text-sm font-medium uppercase"
              >
                <Select.Option value="hex">HEX</Select.Option>
                <Select.Option value="rgb">RGB</Select.Option>
                <Select.Option value="hsl">HSL</Select.Option>
                <Select.Option value="hsb">HSB</Select.Option>
              </Select>
              <Input
                value={hexInputValue}
                onChange={(event) => setHexInputValue(event.target.value)}
                onBlur={() => commitHexInput(hexInputValue)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    commitHexInput(hexInputValue);
                  }
                }}
                maxLength={7}
                className="h-9 min-w-0 w-0 flex-1 rounded-lg text-center font-mono text-sm uppercase"
                placeholder="HEX"
                aria-label="Hex color value"
              />
            </div>

            {channels && colorSpace !== "hex" && (
              <div className="flex gap-2">{renderChannelInputs(colorSpace, channels)}</div>
            )}
          </div>
        </Popover.Content>
      </Popover>
    </AriaColorPicker>
  );
}

ColorPicker.displayName = "ColorPicker";
