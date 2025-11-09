import { Switch } from "~/components/switch/switch";
import { DocLayout } from "~/components/docs/doc-layout";
import { ComponentExample } from "~/components/docs/component-example";
import { ComponentSection } from "~/components/docs/component-section";
import { CodeBlock } from "~/components/code/code-lazy";

export default function SwitchDoc() {
  return (
    <DocLayout
      title="Switch"
      description="A two-state button that can be either on or off."
    >
      {/* Demo */}
      <ComponentSection>
        <ComponentExample
          code={`<Switch toggled={false} onClick={() => {}} />`}
        >
          <Switch toggled={false} onClick={() => {}} />
        </ComponentExample>
      </ComponentSection>

      {/* Installation */}
      <ComponentSection>
        <h2 className="text-2xl font-bold mb-4">Installation</h2>
        <CodeBlock
          lang="tsx"
          code={`import { Switch } from "~/components/switch/switch";`}
        />
      </ComponentSection>

      {/* Usage */}
      <ComponentSection>
        <h2 className="text-2xl font-bold mb-4">Usage</h2>
        <CodeBlock
          lang="tsx"
          code={`import { Switch } from "~/components/switch/switch";
import { useState } from "react";

export default function Example() {
  const [toggled, setToggled] = useState(false);
  
  return (
    <Switch 
      toggled={toggled} 
      onClick={() => setToggled(!toggled)} 
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
            <h3 className="text-xl font-semibold mb-4">Off State</h3>
            <ComponentExample
              code={`<Switch toggled={false} onClick={() => {}} />`}
            >
              <Switch toggled={false} onClick={() => {}} />
            </ComponentExample>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-4">On State</h3>
            <ComponentExample
              code={`<Switch toggled={true} onClick={() => {}} />`}
            >
              <Switch toggled={true} onClick={() => {}} />
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
                <td className="py-3 px-4 font-mono text-xs">toggled</td>
                <td className="py-3 px-4 font-mono text-xs">boolean</td>
                <td className="py-3 px-4 font-mono text-xs">false</td>
              </tr>
              <tr className="border-b border-neutral-200 dark:border-neutral-800">
                <td className="py-3 px-4 font-mono text-xs">onClick</td>
                <td className="py-3 px-4 font-mono text-xs">{'() => void'}</td>
                <td className="py-3 px-4 font-mono text-xs">undefined</td>
              </tr>
            </tbody>
          </table>
        </div>
      </ComponentSection>
    </DocLayout>
  );
}
