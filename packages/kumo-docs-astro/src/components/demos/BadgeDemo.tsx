import { Badge } from "@cloudflare/kumo";

export function BadgeVariantsDemo() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Badge variant="red">Red</Badge>
      <Badge variant="orange">Orange</Badge>
      <Badge variant="yellow">Yellow</Badge>
      <Badge variant="green">Green</Badge>
      <Badge variant="teal">Teal</Badge>
      <Badge variant="blue">Blue</Badge>
      <Badge variant="neutral">Neutral</Badge>
      <Badge variant="inverted">Inverted</Badge>
      <Badge variant="outline">Outline</Badge>
      <Badge variant="beta">Beta</Badge>
      <Badge variant="red-subtle">Red subtle</Badge>
      <Badge variant="orange-subtle">Orange subtle</Badge>
      <Badge variant="yellow-subtle">Yellow subtle</Badge>
      <Badge variant="green-subtle">Green subtle</Badge>
      <Badge variant="teal-subtle">Teal subtle</Badge>
      <Badge variant="blue-subtle">Blue subtle</Badge>
      <Badge variant="neutral-subtle">Neutral subtle</Badge>
    </div>
  );
}

export function BadgeRedDemo() {
  return <Badge variant="red">Red</Badge>;
}

export function BadgeRedSubtleDemo() {
  return <Badge variant="red-subtle">Red subtle</Badge>;
}

export function BadgeOrangeDemo() {
  return <Badge variant="orange">Orange</Badge>;
}

export function BadgeOrangeSubtleDemo() {
  return <Badge variant="orange-subtle">Orange subtle</Badge>;
}

export function BadgeYellowDemo() {
  return <Badge variant="yellow">Yellow</Badge>;
}

export function BadgeYellowSubtleDemo() {
  return <Badge variant="yellow-subtle">Yellow subtle</Badge>;
}

export function BadgeGreenDemo() {
  return <Badge variant="green">Green</Badge>;
}

export function BadgeGreenSubtleDemo() {
  return <Badge variant="green-subtle">Green subtle</Badge>;
}

export function BadgeTealDemo() {
  return <Badge variant="teal">Teal</Badge>;
}

export function BadgeTealSubtleDemo() {
  return <Badge variant="teal-subtle">Teal subtle</Badge>;
}

export function BadgeBlueDemo() {
  return <Badge variant="blue">Blue</Badge>;
}

export function BadgeBlueSubtleDemo() {
  return <Badge variant="blue-subtle">Blue subtle</Badge>;
}

export function BadgeNeutralDemo() {
  return <Badge variant="neutral">Neutral</Badge>;
}

export function BadgeNeutralSubtleDemo() {
  return <Badge variant="neutral-subtle">Neutral subtle</Badge>;
}

export function BadgeInvertedDemo() {
  return <Badge variant="inverted">Inverted</Badge>;
}

export function BadgeOutlineDemo() {
  return <Badge variant="outline">Outline</Badge>;
}

export function BadgeBetaDemo() {
  return <Badge variant="beta">Beta</Badge>;
}

export function BadgeInSentenceDemo() {
  return (
    <p className="flex items-center gap-2">
      Workers
      <Badge variant="blue">New</Badge>
    </p>
  );
}
