import { useState } from "react";
import { Slider } from "@cloudflare/kumo";

export function SliderBasicDemo() {
  return <Slider label="Volume" defaultValue={40} className="w-72" />;
}

export function SliderRangeDemo() {
  return (
    <Slider
      label="Price range"
      defaultValue={[25, 75]}
      getAriaLabel={(index) =>
        index === 0 ? "Minimum price" : "Maximum price"
      }
      className="w-72"
    />
  );
}

export function SliderStepDemo() {
  return (
    <Slider label="Match count" defaultValue={2} max={5} className="w-72" />
  );
}

export function SliderFormatDemo() {
  return (
    <Slider
      label="Sampling rate"
      defaultValue={0.25}
      min={0}
      max={1}
      step={0.05}
      format={{ style: "percent" }}
      className="w-72"
    />
  );
}

export function SliderSizesDemo() {
  return (
    <div className="flex w-72 flex-col gap-6">
      <Slider label="Small" size="sm" defaultValue={30} />
      <Slider label="Base" defaultValue={30} />
    </div>
  );
}

export function SliderControlledDemo() {
  const [value, setValue] = useState(50);

  return (
    <div className="flex w-72 flex-col gap-3">
      <Slider
        label="Brightness"
        value={value}
        onValueChange={(next) => setValue(next)}
      />
      <p className="text-sm text-kumo-subtle">Brightness: {value}%</p>
    </div>
  );
}

export function SliderDisabledDemo() {
  return <Slider label="Locked" defaultValue={70} disabled className="w-72" />;
}
