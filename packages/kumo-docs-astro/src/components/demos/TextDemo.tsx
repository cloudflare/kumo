import { Text } from "@cloudflare/kumo";

export function TextVariantsDemo() {
  return (
    <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      <div className="flex flex-col justify-end gap-1 rounded-lg border border-kumo-line bg-kumo-base p-4">
        <Text variant="heading1">Heading 1</Text>
        <Text variant="mono-secondary">text-3xl (30px)</Text>
      </div>
      <div className="flex flex-col justify-end gap-1 rounded-lg border border-kumo-line bg-kumo-base p-4">
        <Text variant="heading2">Heading 2</Text>
        <Text variant="mono-secondary">text-2xl (24px)</Text>
      </div>
      <div className="flex flex-col justify-end gap-1 rounded-lg border border-kumo-line bg-kumo-base p-4">
        <Text variant="heading3">Heading 3</Text>
        <Text variant="mono-secondary">text-lg (16px)</Text>
      </div>
      <div className="flex flex-col justify-end gap-1 rounded-lg border border-kumo-line bg-kumo-base p-4">
        <Text>Body</Text>
        <Text variant="mono-secondary">text-base (14px)</Text>
      </div>
      <div className="flex flex-col justify-end gap-1 rounded-lg border border-kumo-line bg-kumo-base p-4">
        <Text bold>Body bold</Text>
        <Text variant="mono-secondary">text-base (14px)</Text>
      </div>
      <div className="flex flex-col justify-end gap-1 rounded-lg border border-kumo-line bg-kumo-base p-4">
        <Text size="lg">Body lg</Text>
        <Text variant="mono-secondary">text-lg (16px)</Text>
      </div>
      <div className="flex flex-col justify-end gap-1 rounded-lg border border-kumo-line bg-kumo-base p-4">
        <Text size="sm">Body sm</Text>
        <Text variant="mono-secondary">text-sm (13px)</Text>
      </div>
      <div className="flex flex-col justify-end gap-1 rounded-lg border border-kumo-line bg-kumo-base p-4">
        <Text size="xs">Body xs</Text>
        <Text variant="mono-secondary">text-xs (12px)</Text>
      </div>
      <div className="flex flex-col justify-end gap-1 rounded-lg border border-kumo-line bg-kumo-base p-4">
        <Text variant="secondary">Body secondary</Text>
        <Text variant="mono-secondary">text-base (14px)</Text>
      </div>
      <div className="flex flex-col justify-end gap-1 rounded-lg border border-kumo-line bg-kumo-base p-4">
        <Text variant="mono">Monospace</Text>
        <Text variant="mono-secondary">text-sm (13px)</Text>
      </div>
      <div className="flex flex-col justify-end gap-1 rounded-lg border border-kumo-line bg-kumo-base p-4">
        <Text variant="mono" size="lg">
          Monospace lg
        </Text>
        <Text variant="mono-secondary">text-base (14px)</Text>
      </div>
      <div className="flex flex-col justify-end gap-1 rounded-lg border border-kumo-line bg-kumo-base p-4">
        <Text variant="mono-secondary">Monospace secondary</Text>
        <Text variant="mono-secondary">text-sm (13px)</Text>
      </div>
      <div className="flex flex-col justify-end gap-1 rounded-lg border border-kumo-line bg-kumo-base p-4">
        <Text variant="success">Success</Text>
        <Text variant="mono-secondary">text-base (14px)</Text>
      </div>
      <div className="flex flex-col justify-end gap-1 rounded-lg border border-kumo-line bg-kumo-base p-4">
        <Text variant="error">Error</Text>
        <Text variant="mono-secondary">text-base (14px)</Text>
      </div>
    </div>
  );
}

export function TextTruncateDemo() {
  return (
    <div className="w-64 rounded-lg border border-kumo-line bg-kumo-base p-4">
      <Text truncate>
        This is a long piece of text that will be truncated with an ellipsis
        when it overflows its container.
      </Text>
    </div>
  );
}
