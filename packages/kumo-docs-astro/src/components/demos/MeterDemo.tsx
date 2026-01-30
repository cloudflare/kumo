import { Meter } from "@cloudflare/kumo";

export function MeterBasicDemo() {
  return <Meter label="Storage used" value={65} />;
}

export function MeterCustomValueDemo() {
  return <Meter label="API requests" value={75} customValue="750 / 1,000" />;
}

export function MeterHiddenValueDemo() {
  return <Meter label="Progress" value={40} showValue={false} />;
}

export function MeterFullDemo() {
  return <Meter label="Quota reached" value={100} />;
}

export function MeterLowDemo() {
  return <Meter label="Memory usage" value={15} />;
}

export function MeterCustomStyleDemo() {
  return (
    <Meter
      label="Upload progress"
      value={80}
      indicatorClassName="from-green-500 via-green-500 to-green-500"
    />
  );
}
