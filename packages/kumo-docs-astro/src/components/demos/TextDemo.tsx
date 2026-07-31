import { Text } from "@cloudflare/kumo";

export function TextVariantsDemo() {
  return (
    <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      <div className="flex flex-col justify-end gap-1 rounded-lg border border-kumo-hairline bg-kumo-base p-4">
        <Text variant="display" as="h1">
          Display
        </Text>
        <Text variant="mono-secondary">text-2xl (24px)</Text>
      </div>
      <div className="flex flex-col justify-end gap-1 rounded-lg border border-kumo-hairline bg-kumo-base p-4">
        <Text variant="page-title" as="h2">
          Page title
        </Text>
        <Text variant="mono-secondary">text-xl (17px)</Text>
      </div>
      <div className="flex flex-col justify-end gap-1 rounded-lg border border-kumo-hairline bg-kumo-base p-4">
        <Text variant="section-title" as="h3">
          Section title
        </Text>
        <Text variant="mono-secondary">text-lg (15px)</Text>
      </div>
      <div className="flex flex-col justify-end gap-1 rounded-lg border border-kumo-hairline bg-kumo-base p-4">
        <Text variant="heading" as="h4">
          Heading
        </Text>
        <Text variant="mono-secondary">text-base (13px)</Text>
      </div>
      <div className="flex flex-col justify-end gap-1 rounded-lg border border-kumo-hairline bg-kumo-base p-4">
        <Text>Body</Text>
        <Text variant="mono-secondary">text-base (13px)</Text>
      </div>
      <div className="flex flex-col justify-end gap-1 rounded-lg border border-kumo-hairline bg-kumo-base p-4">
        <Text size="sm">Body sm</Text>
        <Text variant="mono-secondary">text-sm (12px)</Text>
      </div>
      <div className="flex flex-col justify-end gap-1 rounded-lg border border-kumo-hairline bg-kumo-base p-4">
        <Text variant="secondary">Body secondary</Text>
        <Text variant="mono-secondary">text-base (13px)</Text>
      </div>
      <div className="flex flex-col justify-end gap-1 rounded-lg border border-kumo-hairline bg-kumo-base p-4">
        <Text variant="mono">Monospace</Text>
        <Text variant="mono-secondary">text-sm (12px)</Text>
      </div>
      <div className="flex flex-col justify-end gap-1 rounded-lg border border-kumo-hairline bg-kumo-base p-4">
        <Text variant="mono-secondary">Monospace secondary</Text>
        <Text variant="mono-secondary">text-sm (12px)</Text>
      </div>
      <div className="flex flex-col justify-end gap-1 rounded-lg border border-kumo-hairline bg-kumo-base p-4">
        <Text variant="success">Success</Text>
        <Text variant="mono-secondary">text-base (13px)</Text>
      </div>
      <div className="flex flex-col justify-end gap-1 rounded-lg border border-kumo-hairline bg-kumo-base p-4">
        <Text variant="error">Error</Text>
        <Text variant="mono-secondary">text-base (13px)</Text>
      </div>
    </div>
  );
}

export function TextTruncateDemo() {
  return (
    <div className="w-64 rounded-lg border border-kumo-hairline bg-kumo-base p-4">
      <Text truncate>
        This is a long piece of text that will be truncated with an ellipsis
        when it overflows its container.
      </Text>
    </div>
  );
}
