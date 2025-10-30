import { Input } from "~/components/input/input";
import { DocLayout } from "~/components/docs/doc-layout";
import { ComponentExample } from "~/components/docs/component-example";
import { ComponentSection } from "~/components/docs/component-section";
import { CodeBlock } from "~/components/code/code-lazy";

export default function InputDoc() {
  return (
    <DocLayout
      title="Input"
      description="A text input field for user input."
    >
      {/* Demo */}
      <ComponentSection>
        <ComponentExample
          code={`<Input placeholder="Enter text..." />`}
        >
          <Input placeholder="Enter text..." />
        </ComponentExample>
      </ComponentSection>

      {/* Installation */}
      <ComponentSection>
        <h2 className="text-2xl font-bold mb-4">Installation</h2>
        <CodeBlock
          lang="tsx"
          code={`import { Input } from "~/components/input/input";`}
        />
      </ComponentSection>

      {/* Usage */}
      <ComponentSection>
        <h2 className="text-2xl font-bold mb-4">Usage</h2>
        <CodeBlock
          lang="tsx"
          code={`import { Input } from "~/components/input/input";

export default function Example() {
  return <Input placeholder="Enter text..." />;
}`}
        />
      </ComponentSection>

      {/* Examples */}
      <ComponentSection>
        <h2 className="text-2xl font-bold mb-6">Examples</h2>

        <div className="space-y-8">
          <div>
            <h3 className="text-xl font-semibold mb-4">Default</h3>
            <ComponentExample
              code={`<Input placeholder="Type something..." />`}
            >
              <Input placeholder="Type something..." />
            </ComponentExample>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-4">With Value</h3>
            <ComponentExample
              code={`<Input value="Hello World" />`}
            >
              <Input value="Hello World" />
            </ComponentExample>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-4">Error State</h3>
            <ComponentExample
              code={`<Input variant="error" value="Invalid input" />`}
            >
              <Input variant="error" value="Invalid input" />
            </ComponentExample>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-4">Disabled</h3>
            <ComponentExample
              code={`<Input placeholder="Disabled..." disabled />`}
            >
              <Input placeholder="Disabled..." disabled />
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
                <td className="py-3 px-4 font-mono text-xs">variant</td>
                <td className="py-3 px-4 font-mono text-xs">"default" | "error"</td>
                <td className="py-3 px-4 font-mono text-xs">"default"</td>
              </tr>
              <tr className="border-b border-neutral-200 dark:border-neutral-800">
                <td className="py-3 px-4 font-mono text-xs">placeholder</td>
                <td className="py-3 px-4 font-mono text-xs">string</td>
                <td className="py-3 px-4 font-mono text-xs">undefined</td>
              </tr>
              <tr className="border-b border-neutral-200 dark:border-neutral-800">
                <td className="py-3 px-4 font-mono text-xs">disabled</td>
                <td className="py-3 px-4 font-mono text-xs">boolean</td>
                <td className="py-3 px-4 font-mono text-xs">false</td>
              </tr>
            </tbody>
          </table>
        </div>
      </ComponentSection>
    </DocLayout>
  );
}
