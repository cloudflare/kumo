import type { ComponentProps } from "react";
import {
  ColorArea as AriaColorArea,
  ColorField as AriaColorField,
  ColorPicker as AriaColorPicker,
  ColorSlider as AriaColorSlider,
  ColorSwatch as AriaColorSwatch,
  ColorThumb as AriaColorThumb,
  SliderTrack as AriaSliderTrack,
  composeRenderProps,
} from "react-aria-components";
import { cn } from "../../utils/cn";

const ColorSlider = AriaColorSlider;

const ColorField = AriaColorField;

const ColorPicker = AriaColorPicker;

const COLOR_THUMB_BASE_CLASS =
  "z-20 box-border size-5 overflow-hidden rounded-[50%] shadow-md";

const COLOR_THUMB_OUTER_RING_CLASS =
  "before:pointer-events-none before:absolute before:inset-0 before:rounded-[50%] before:bg-white before:content-['']";

const COLOR_THUMB_CENTER_DOT_CLASS =
  "after:pointer-events-none after:absolute after:top-1/2 after:left-1/2 after:size-2 after:-translate-x-1/2 after:-translate-y-1/2 after:rounded-[50%] after:bg-[inherit] after:content-['']";

const COLOR_THUMB_FOCUS_CLASS =
  "data-[focus-visible]:size-6 data-[focus-visible]:outline-none data-[focus-visible]:ring-2 data-[focus-visible]:ring-kumo-ring";

function ColorArea({ className, ...props }: ComponentProps<typeof AriaColorArea>) {
  return (
    <AriaColorArea
      className={composeRenderProps(className, (nextClassName: string | undefined) =>
        cn(
          "size-[192px] shrink-0 rounded-lg ring-1 ring-kumo-line shadow-sm",
          nextClassName,
        ),
      )}
      {...props}
    />
  );
}

function SliderTrack({
  className,
  ...props
}: ComponentProps<typeof AriaSliderTrack>) {
  return (
    <AriaSliderTrack
      className={composeRenderProps(className, (nextClassName: string | undefined) =>
        cn("h-7 w-[192px] rounded-lg ring-1 ring-kumo-line", nextClassName),
      )}
      {...props}
    />
  );
}

function ColorThumb({
  className,
  ...props
}: ComponentProps<typeof AriaColorThumb>) {
  return (
    <AriaColorThumb
      className={composeRenderProps(className, (nextClassName: string | undefined) =>
        cn(
          COLOR_THUMB_BASE_CLASS,
          COLOR_THUMB_OUTER_RING_CLASS,
          COLOR_THUMB_CENTER_DOT_CLASS,
          COLOR_THUMB_FOCUS_CLASS,
          nextClassName,
        ),
      )}
      {...props}
    />
  );
}

function ColorSwatch({
  className,
  ...props
}: ComponentProps<typeof AriaColorSwatch>) {
  return (
    <AriaColorSwatch
      className={composeRenderProps(className, (nextClassName: string | undefined) =>
        cn("size-8", nextClassName),
      )}
      {...props}
    />
  );
}

export {
  ColorSlider,
  ColorField,
  ColorPicker,
  ColorArea,
  SliderTrack,
  ColorThumb,
  ColorSwatch,
};
