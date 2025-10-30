import { Combobox } from "~/components/combobox/combobox";
import { DocLayout } from "~/components/docs/doc-layout";
import { ComponentExample } from "~/components/docs/component-example";
import { ComponentSection } from "~/components/docs/component-section";
import { CodeBlock } from "~/components/code/code-lazy";

export default function ComboboxDoc() {
  return (
    <DocLayout
      title="Combobox"
      description="A searchable select component that allows users to filter and select from a list of options."
    >
      {/* Demo */}
      <ComponentSection>
        <ComponentExample
          code={`<Combobox
  initialItems={[
    { id: "bug", value: "bug" },
    { id: "docs", value: "documentation" },
    { id: "enhancement", value: "enhancement" },
  ]}
  placeholder="Select an issue..."
/>`}
        >
          <Combobox
            initialItems={[
              { id: "bug", value: "bug" },
              { id: "docs", value: "documentation" },
              { id: "enhancement", value: "enhancement" },
            ]}
            placeholder="Select an issue..."
          />
        </ComponentExample>
      </ComponentSection>

      {/* Installation */}
      <ComponentSection>
        <h2 className="text-2xl font-bold mb-4">Installation</h2>
        <CodeBlock
          lang="tsx"
          code={`import { Combobox } from "~/components/combobox/combobox";`}
        />
      </ComponentSection>

      {/* Usage */}
      <ComponentSection>
        <h2 className="text-2xl font-bold mb-4">Usage</h2>
        <CodeBlock
          lang="tsx"
          code={`import { Combobox } from "~/components/combobox/combobox";

export default function Example() {
  return (
    <Combobox
      initialItems={[
        { id: "1", value: "Option 1" },
        { id: "2", value: "Option 2" },
      ]}
      placeholder="Select..."
    />
  );
}`}
        />
      </ComponentSection>

      {/* Examples */}
      <ComponentSection>
        <h2 className="text-2xl font-bold mb-6">Examples</h2>

        <div className="space-y-8">
          <div>
            <h3 className="text-xl font-semibold mb-4">Basic Combobox</h3>
            <ComponentExample
              code={`<Combobox
  initialItems={[
    { id: "bug", value: "bug" },
    { id: "docs", value: "documentation" },
    { id: "enhancement", value: "enhancement" },
    { id: "help-wanted", value: "help wanted" },
    { id: "good-first-issue", value: "good first issue" },
  ]}
  placeholder="Select an issue..."
/>`}
            >
              <Combobox
                initialItems={[
                  { id: "bug", value: "bug" },
                  { id: "docs", value: "documentation" },
                  { id: "enhancement", value: "enhancement" },
                  { id: "help-wanted", value: "help wanted" },
                  { id: "good-first-issue", value: "good first issue" },
                ]}
                placeholder="Select an issue..."
              />
            </ComponentExample>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-4">With Create Option</h3>
            <ComponentExample
              code={`<Combobox
  initialItems={[
    { id: "bug", value: "bug" },
    { id: "docs", value: "documentation" },
  ]}
  onCreate={(v) => console.log(\`Created \${v}\`)}
  placeholder="Select or create..."
/>`}
            >
              <Combobox
                initialItems={[
                  { id: "bug", value: "bug" },
                  { id: "docs", value: "documentation" },
                ]}
                onCreate={(v) => console.log(`Created ${v}`)}
                placeholder="Select or create..."
              />
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
                <td className="py-3 px-4 font-mono text-xs">initialItems</td>
                <td className="py-3 px-4 font-mono text-xs">{`Array<{ id: string; value: string }>`}</td>
                <td className="py-3 px-4 font-mono text-xs">[]</td>
              </tr>
              <tr className="border-b border-neutral-200 dark:border-neutral-800">
                <td className="py-3 px-4 font-mono text-xs">placeholder</td>
                <td className="py-3 px-4 font-mono text-xs">string</td>
                <td className="py-3 px-4 font-mono text-xs">undefined</td>
              </tr>
              <tr className="border-b border-neutral-200 dark:border-neutral-800">
                <td className="py-3 px-4 font-mono text-xs">onCreate</td>
                <td className="py-3 px-4 font-mono text-xs">{'(value: string) => void'}</td>
                <td className="py-3 px-4 font-mono text-xs">undefined</td>
              </tr>
            </tbody>
          </table>
        </div>
      </ComponentSection>
    </DocLayout>
  );
}
