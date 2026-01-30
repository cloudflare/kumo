import { Text } from "@cloudflare/kumo";

export function TextVariantsDemo() {
  return (
    <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      <div className="flex flex-col justify-end gap-1 rounded-lg border border-kumo-line bg-kumo-base p-4">
        <Text variant="heading1">Heading 1</Text>
        <p className="font-mono text-xs text-kumo-subtle">text-3xl (30px)</p>
      </div>
      <div className="flex flex-col justify-end gap-1 rounded-lg border border-kumo-line bg-kumo-base p-4">
        <Text variant="heading2">Heading 2</Text>
        <p className="font-mono text-xs text-kumo-subtle">text-2xl (24px)</p>
      </div>
      <div className="flex flex-col justify-end gap-1 rounded-lg border border-kumo-line bg-kumo-base p-4">
        <Text variant="heading3">Heading 3</Text>
        <p className="font-mono text-xs text-kumo-subtle">text-lg (16px)</p>
      </div>
      <div className="flex flex-col justify-end gap-1 rounded-lg border border-kumo-line bg-kumo-base p-4">
        <Text>Body</Text>
        <p className="font-mono text-xs text-kumo-subtle">text-base (14px)</p>
      </div>
      <div className="flex flex-col justify-end gap-1 rounded-lg border border-kumo-line bg-kumo-base p-4">
        <Text bold>Body bold</Text>
        <p className="font-mono text-xs text-kumo-subtle">text-base (14px)</p>
      </div>
      <div className="flex flex-col justify-end gap-1 rounded-lg border border-kumo-line bg-kumo-base p-4">
        <Text size="lg">Body lg</Text>
        <p className="font-mono text-xs text-kumo-subtle">text-lg (16px)</p>
      </div>
      <div className="flex flex-col justify-end gap-1 rounded-lg border border-kumo-line bg-kumo-base p-4">
        <Text size="sm">Body sm</Text>
        <p className="font-mono text-xs text-kumo-subtle">text-sm (13px)</p>
      </div>
      <div className="flex flex-col justify-end gap-1 rounded-lg border border-kumo-line bg-kumo-base p-4">
        <Text size="xs">Body xs</Text>
        <p className="font-mono text-xs text-kumo-subtle">text-xs (12px)</p>
      </div>
      <div className="flex flex-col justify-end gap-1 rounded-lg border border-kumo-line bg-kumo-base p-4">
        <Text variant="secondary">Body secondary</Text>
        <p className="font-mono text-xs text-kumo-subtle">text-base (14px)</p>
      </div>
      <div className="flex flex-col justify-end gap-1 rounded-lg border border-kumo-line bg-kumo-base p-4">
        <Text variant="mono">Monospace</Text>
        <p className="font-mono text-xs text-kumo-subtle">text-sm (13px)</p>
      </div>
      <div className="flex flex-col justify-end gap-1 rounded-lg border border-kumo-line bg-kumo-base p-4">
        <Text variant="mono" size="lg">
          Monospace lg
        </Text>
        <p className="font-mono text-xs text-kumo-subtle">text-base (14px)</p>
      </div>
      <div className="flex flex-col justify-end gap-1 rounded-lg border border-kumo-line bg-kumo-base p-4">
        <Text variant="mono-secondary">Monospace secondary</Text>
        <p className="font-mono text-xs text-kumo-subtle">text-sm (13px)</p>
      </div>
      <div className="flex flex-col justify-end gap-1 rounded-lg border border-kumo-line bg-kumo-base p-4">
        <Text variant="success">Success</Text>
        <p className="font-mono text-xs text-kumo-subtle">text-base (14px)</p>
      </div>
      <div className="flex flex-col justify-end gap-1 rounded-lg border border-kumo-line bg-kumo-base p-4">
        <Text variant="error">Error</Text>
        <p className="font-mono text-xs text-kumo-subtle">text-base (14px)</p>
      </div>
    </div>
  );
}
