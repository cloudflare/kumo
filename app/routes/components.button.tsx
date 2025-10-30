import { PlusIcon, ArrowRightIcon } from "@phosphor-icons/react";
import { Button } from "~/components/button/button";
import { DocLayout } from "~/components/docs/doc-layout";
import { ComponentExample } from "~/components/docs/component-example";
import { ComponentSection } from "~/components/docs/component-section";
import { Callout } from "~/components/docs/callout";
import { CodeBlock } from "~/components/code/code-lazy";

export default function ButtonDoc() {
  return (
    <DocLayout
      title="Button"
      description="Displays a button or a component that looks like a button."
    >
      {/* Demo */}
      <ComponentSection>
        <ComponentExample
          code={`<Button variant="secondary">Button</Button>
<Button variant="secondary" shape="square" icon={PlusIcon} />`}
        >
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="secondary">Button</Button>
            <Button variant="secondary" shape="square" icon={PlusIcon} />
          </div>
        </ComponentExample>
      </ComponentSection>

      {/* Installation */}
      <ComponentSection>
        <h2 className="text-2xl font-bold mb-4">Installation</h2>
        <p className="text-neutral-600 dark:text-neutral-400 mb-4">
          Copy and paste the following code into your project.
        </p>
        <CodeBlock
          lang="tsx"
          code={`import { Button } from "~/components/button/button";`}
        />
      </ComponentSection>

      {/* Usage */}
      <ComponentSection>
        <h2 className="text-2xl font-bold mb-4">Usage</h2>
        <CodeBlock
          lang="tsx"
          code={`import { Button } from "~/components/button/button";

export default function Example() {
  return <Button variant="secondary">Click me</Button>;
}`}
        />
      </ComponentSection>

      {/* Examples */}
      <ComponentSection>
        <h2 className="text-2xl font-bold mb-6">Examples</h2>

        {/* Variants */}
        <div className="mb-12">
          <h3 className="text-xl font-semibold mb-4">Variants</h3>
          
          <div className="space-y-8">
            <div>
              <h4 className="text-base font-medium mb-3">Primary</h4>
              <ComponentExample
                code={`<Button variant="primary">Primary</Button>`}
              >
                <Button variant="primary">Primary</Button>
              </ComponentExample>
            </div>

            <div>
              <h4 className="text-base font-medium mb-3">Secondary</h4>
              <ComponentExample
                code={`<Button variant="secondary">Secondary</Button>`}
              >
                <Button variant="secondary">Secondary</Button>
              </ComponentExample>
            </div>

            <div>
              <h4 className="text-base font-medium mb-3">Ghost</h4>
              <ComponentExample
                code={`<Button variant="ghost">Ghost</Button>`}
              >
                <Button variant="ghost">Ghost</Button>
              </ComponentExample>
            </div>

            <div>
              <h4 className="text-base font-medium mb-3">Destructive</h4>
              <ComponentExample
                code={`<Button variant="destructive">Destructive</Button>`}
              >
                <Button variant="destructive">Destructive</Button>
              </ComponentExample>
            </div>

            <div>
              <h4 className="text-base font-medium mb-3">Outline</h4>
              <ComponentExample
                code={`<Button variant="outline">Outline</Button>`}
              >
                <Button variant="outline">Outline</Button>
              </ComponentExample>
            </div>
          </div>
        </div>

        {/* Sizes */}
        <div className="mb-12">
          <h3 className="text-xl font-semibold mb-4">Sizes</h3>
          <ComponentExample
            code={`<Button size="xs" variant="secondary">Extra Small</Button>
<Button size="sm" variant="secondary">Small</Button>
<Button size="base" variant="secondary">Base</Button>
<Button size="lg" variant="secondary">Large</Button>`}
          >
            <div className="flex flex-wrap items-center gap-3">
              <Button size="xs" variant="secondary">Extra Small</Button>
              <Button size="sm" variant="secondary">Small</Button>
              <Button size="base" variant="secondary">Base</Button>
              <Button size="lg" variant="secondary">Large</Button>
            </div>
          </ComponentExample>
        </div>

        {/* With Icon */}
        <div className="mb-12">
          <h3 className="text-xl font-semibold mb-4">With Icon</h3>
          <ComponentExample
            code={`<Button variant="secondary" icon={PlusIcon}>
  Create Worker
</Button>`}
          >
            <Button variant="secondary" icon={PlusIcon}>
              Create Worker
            </Button>
          </ComponentExample>
        </div>

        {/* Icon Only */}
        <div className="mb-12">
          <h3 className="text-xl font-semibold mb-4">Icon Only</h3>
          <ComponentExample
            code={`<Button variant="secondary" shape="square" icon={PlusIcon} />
<Button variant="secondary" shape="circle" icon={PlusIcon} />`}
          >
            <div className="flex flex-wrap items-center gap-3">
              <Button variant="secondary" shape="square" icon={PlusIcon} />
              <Button variant="secondary" shape="circle" icon={PlusIcon} />
            </div>
          </ComponentExample>
        </div>

        {/* Loading State */}
        <div className="mb-12">
          <h3 className="text-xl font-semibold mb-4">Loading State</h3>
          <ComponentExample
            code={`<Button variant="primary" loading>
  Loading...
</Button>`}
          >
            <Button variant="primary" loading>
              Loading...
            </Button>
          </ComponentExample>
        </div>

        {/* Disabled State */}
        <div className="mb-12">
          <h3 className="text-xl font-semibold mb-4">Disabled State</h3>
          <ComponentExample
            code={`<Button variant="secondary" disabled>
  Disabled
</Button>`}
          >
            <Button variant="secondary" disabled>
              Disabled
            </Button>
          </ComponentExample>
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
                <td className="py-3 px-4 font-mono text-xs">"primary" | "secondary" | "ghost" | "destructive" | "outline"</td>
                <td className="py-3 px-4 font-mono text-xs">"secondary"</td>
              </tr>
              <tr className="border-b border-neutral-200 dark:border-neutral-800">
                <td className="py-3 px-4 font-mono text-xs">size</td>
                <td className="py-3 px-4 font-mono text-xs">"xs" | "sm" | "base" | "lg"</td>
                <td className="py-3 px-4 font-mono text-xs">"base"</td>
              </tr>
              <tr className="border-b border-neutral-200 dark:border-neutral-800">
                <td className="py-3 px-4 font-mono text-xs">shape</td>
                <td className="py-3 px-4 font-mono text-xs">"base" | "square" | "circle"</td>
                <td className="py-3 px-4 font-mono text-xs">"base"</td>
              </tr>
              <tr className="border-b border-neutral-200 dark:border-neutral-800">
                <td className="py-3 px-4 font-mono text-xs">icon</td>
                <td className="py-3 px-4 font-mono text-xs">Icon | React.ReactNode</td>
                <td className="py-3 px-4 font-mono text-xs">undefined</td>
              </tr>
              <tr className="border-b border-neutral-200 dark:border-neutral-800">
                <td className="py-3 px-4 font-mono text-xs">loading</td>
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
