import { Checkbox } from "~/components/checkbox/checkbox";
import { DocLayout } from "~/components/docs/doc-layout";
import { ComponentExample } from "~/components/docs/component-example";
import { ComponentSection } from "~/components/docs/component-section";
import { CodeBlock } from "~/components/code/code-lazy";

export default function CheckboxDoc() {
  return (
    <DocLayout
      title="Checkbox"
      description="A control that allows the user to toggle between checked and not checked."
    >
      {/* Demo */}
      <ComponentSection>
        <ComponentExample
          code={`<Checkbox label="Accept terms and conditions" />`}
        >
          <Checkbox label="Accept terms and conditions" />
        </ComponentExample>
      </ComponentSection>

      {/* Installation */}
      <ComponentSection>
        <h2 className="text-2xl font-bold mb-4">Installation</h2>
        <CodeBlock
          lang="tsx"
          code={`import { Checkbox } from "~/components/checkbox/checkbox";`}
        />
      </ComponentSection>

      {/* Usage */}
      <ComponentSection>
        <h2 className="text-2xl font-bold mb-4">Usage</h2>
        <CodeBlock
          lang="tsx"
          code={`import { Checkbox } from "~/components/checkbox/checkbox";

export default function Example() {
  return <Checkbox label="Accept terms" />;
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
              code={`<Checkbox label="Enable notifications" />`}
            >
              <Checkbox label="Enable notifications" />
            </ComponentExample>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-4">Checked</h3>
            <ComponentExample
              code={`<Checkbox label="I agree" defaultChecked />`}
            >
              <Checkbox label="I agree" defaultChecked />
            </ComponentExample>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-4">Disabled</h3>
            <ComponentExample
              code={`<Checkbox label="Disabled option" disabled />`}
            >
              <Checkbox label="Disabled option" disabled />
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
                <td className="py-3 px-4 font-mono text-xs">label</td>
                <td className="py-3 px-4 font-mono text-xs">string</td>
                <td className="py-3 px-4 font-mono text-xs">undefined</td>
              </tr>
              <tr className="border-b border-neutral-200 dark:border-neutral-800">
                <td className="py-3 px-4 font-mono text-xs">defaultChecked</td>
                <td className="py-3 px-4 font-mono text-xs">boolean</td>
                <td className="py-3 px-4 font-mono text-xs">false</td>
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
