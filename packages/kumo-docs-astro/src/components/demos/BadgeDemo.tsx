import { Badge } from "@cloudflare/kumo";

export function BadgeSemanticVariantsDemo() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Badge variant="primary">Primary</Badge>
      <Badge variant="secondary">Secondary</Badge>
      <Badge variant="error">Error</Badge>
      <Badge variant="success">Success</Badge>
      <Badge variant="warning">Warning</Badge>
      <Badge variant="info">Info</Badge>
      <Badge variant="outline">Outline</Badge>
      <Badge variant="beta">Beta</Badge>
    </div>
  );
}

export function BadgeColorVariantsDemo() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Badge variant="neutral">Neutral</Badge>
      <Badge variant="red">Red</Badge>
      <Badge variant="orange">Orange</Badge>
      <Badge variant="teal">Teal</Badge>
      <Badge variant="blue">Blue</Badge>
      <Badge variant="purple">Purple</Badge>
    </div>
  );
}

export function BadgeInSentenceDemo() {
  return (
    <p className="flex items-center gap-2">
      Workers
      <Badge variant="secondary">New</Badge>
    </p>
  );
}

export function BadgeDotDemo() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Badge variant="success" appearance="dot">Healthy</Badge>
      <Badge variant="warning" appearance="dot">Warning</Badge>
      <Badge variant="error" appearance="dot">Error</Badge>
      <Badge variant="neutral" appearance="dot">Neutral</Badge>
    </div>
  );
}
