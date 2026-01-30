import { Button } from "@cloudflare/kumo";
import { PlusIcon } from "@phosphor-icons/react";

export function ButtonBasicDemo() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button variant="secondary">Button</Button>
      <Button variant="secondary" shape="square" icon={PlusIcon} />
    </div>
  );
}

export function ButtonPrimaryDemo() {
  return <Button variant="primary">Primary</Button>;
}

export function ButtonSecondaryDemo() {
  return <Button variant="secondary">Secondary</Button>;
}

export function ButtonGhostDemo() {
  return <Button variant="ghost">Ghost</Button>;
}

export function ButtonDestructiveDemo() {
  return <Button variant="destructive">Destructive</Button>;
}

export function ButtonOutlineDemo() {
  return <Button variant="outline">Outline</Button>;
}

export function ButtonSecondaryDestructiveDemo() {
  return <Button variant="secondary-destructive">Secondary Destructive</Button>;
}

export function ButtonSizesDemo() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button size="xs" variant="secondary">
        Extra Small
      </Button>
      <Button size="sm" variant="secondary">
        Small
      </Button>
      <Button size="base" variant="secondary">
        Base
      </Button>
      <Button size="lg" variant="secondary">
        Large
      </Button>
    </div>
  );
}

export function ButtonWithIconDemo() {
  return (
    <Button variant="secondary" icon={PlusIcon}>
      Create Worker
    </Button>
  );
}

export function ButtonIconOnlyDemo() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button variant="secondary" shape="square" icon={PlusIcon} />
      <Button variant="secondary" shape="circle" icon={PlusIcon} />
    </div>
  );
}

export function ButtonLoadingDemo() {
  return (
    <Button variant="primary" loading>
      Loading...
    </Button>
  );
}

export function ButtonDisabledDemo() {
  return (
    <Button variant="secondary" disabled>
      Disabled
    </Button>
  );
}
