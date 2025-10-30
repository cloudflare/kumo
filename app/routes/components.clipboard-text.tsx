import { ClipboardText } from "~/components/clipboard-text/clipboard-text";
import { DocLayout } from "~/components/docs/doc-layout";
import { ComponentExample } from "~/components/docs/component-example";
import { ComponentSection } from "~/components/docs/component-section";
import { CodeBlock } from "~/components/code/code-lazy";

export default function ClipboardTextDoc() {
  return (
    <DocLayout
      title="Clipboard Text"
      description="A text component with a copy-to-clipboard button."
    >
      {/* Demo */}
      <ComponentSection>
        <ComponentExample code={`<ClipboardText text="0c239dd2" />`}>
          <ClipboardText text="0c239dd2" />
        </ComponentExample>
      </ComponentSection>

      {/* Installation */}
      <ComponentSection>
        <h2 className="text-2xl font-bold mb-4">Installation</h2>
        <CodeBlock
          lang="tsx"
          code={`import { ClipboardText } from "~/components/clipboard-text/clipboard-text";`}
        />
      </ComponentSection>

      {/* Usage */}
      <ComponentSection>
        <h2 className="text-2xl font-bold mb-4">Usage</h2>
        <CodeBlock
          lang="tsx"
          code={`import { ClipboardText } from "~/components/clipboard-text/clipboard-text";

export default function Example() {
  return <ClipboardText text="Copy this text" />;
}`}
        />
      </ComponentSection>

      {/* Examples */}
      <ComponentSection>
        <h2 className="text-2xl font-bold mb-6">Examples</h2>

        <div className="space-y-8">
          <div>
            <h3 className="text-xl font-semibold mb-4">Short Text</h3>
            <ComponentExample code={`<ClipboardText text="abc123" />`}>
              <ClipboardText text="abc123" />
            </ComponentExample>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-4">API Key</h3>
            <ComponentExample code={`<ClipboardText text="sk_live_51H8..." />`}>
              <ClipboardText text="sk_live_51H8..." />
            </ComponentExample>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-4">Long Text</h3>
            <ComponentExample
              code={`<ClipboardText text="https://example.com/very/long/url/path" />`}
            >
              <ClipboardText text="https://example.com/very/long/url/path" />
            </ComponentExample>
          </div>
        </div>
      </ComponentSection>

      {/* API Reference */}
      <ComponentSection>
        <h2 className="text-2xl font-bold mb-4">API Reference</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-200 dark:border-neutral-800">
                <th className="text-left py-3 px-4 font-semibold">Prop</th>
                <th className="text-left py-3 px-4 font-semibold">Type</th>
                <th className="text-left py-3 px-4 font-semibold">Default</th>
              </tr>
            </thead>
            <tbody className="text-neutral-600 dark:text-neutral-400">
              <tr className="border-b border-neutral-200 dark:border-neutral-800">
                <td className="py-3 px-4 font-mono text-xs">text</td>
                <td className="py-3 px-4 font-mono text-xs">string</td>
                <td className="py-3 px-4 font-mono text-xs">undefined</td>
              </tr>
            </tbody>
          </table>
        </div>
      </ComponentSection>
    </DocLayout>
  );
}
