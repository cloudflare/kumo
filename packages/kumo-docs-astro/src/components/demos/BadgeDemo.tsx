import { Badge } from "@cloudflare/kumo";

export function BadgeVariantsDemo() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Badge variant="primary">Primary</Badge>
      <Badge variant="secondary">Secondary</Badge>
      <Badge variant="destructive">Destructive</Badge>
      <Badge variant="success">Success</Badge>
      <Badge variant="outline">Outline</Badge>
      <Badge variant="beta">Beta</Badge>
    </div>
  );
}

export function BadgePrimaryDemo() {
  return <Badge variant="primary">Primary</Badge>;
}

export function BadgeSecondaryDemo() {
  return <Badge variant="secondary">Secondary</Badge>;
}

export function BadgeDestructiveDemo() {
  return <Badge variant="destructive">Destructive</Badge>;
}

export function BadgeSuccessDemo() {
  return <Badge variant="success">Success</Badge>;
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
      <Badge variant="beta">Beta</Badge>
    </p>
  );
}
