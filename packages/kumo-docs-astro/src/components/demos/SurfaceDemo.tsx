import { Surface, Text } from "@cloudflare/kumo";

export function SurfaceDemo() {
  return (
    <Surface className="rounded-lg p-6">
      <Text size="lg" bold>
        Surface Component
      </Text>
      <div className="mt-2">
        <Text variant="secondary">
          A container with consistent elevation and border styling.
        </Text>
      </div>
    </Surface>
  );
}

export function SurfaceAsDemo() {
  return (
    <div className="flex flex-col gap-4">
      <Surface as="section" className="rounded-lg p-4">
        <Text bold>As section element</Text>
      </Surface>
      <Surface as="article" className="rounded-lg p-4">
        <Text bold>As article element</Text>
      </Surface>
      <Surface as="aside" className="rounded-lg p-4">
        <Text bold>As aside element</Text>
      </Surface>
    </div>
  );
}

export function SurfaceNestedDemo() {
  return (
    <Surface className="rounded-lg p-6">
      <Text bold>Outer Surface</Text>
      <Surface className="mt-4 rounded-md bg-kumo-elevated p-4">
        <Text variant="secondary">Nested Surface</Text>
      </Surface>
    </Surface>
  );
}
