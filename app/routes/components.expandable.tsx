import { Expandable } from "~/components/expandable/expandable";
import { DocLayout } from "~/components/docs/doc-layout";
import { ComponentExample } from "~/components/docs/component-example";
import { ComponentSection } from "~/components/docs/component-section";
import { CodeBlock } from "~/components/code/code-lazy";
import { useState } from "react";

export default function ExpandableDoc() {
    const [isOpen, setIsOpen] = useState(true)
  return (
    <DocLayout
      title="Expandable"
      description="A vertically stacked set of interactive headings that each reveal a section of content."
    >
      {/* Demo */}
      <ComponentSection>
        <ComponentExample
          code={`<Expandable title="What is Kumo?">
  Kumo is Cloudflare's new design system.
</Expandable>`}
        >
          <Expandable title="What is Kumo?" open={isOpen} onOpenChange={(open) => {
            setIsOpen(open)
          }}>
            Kumo is Cloudflare's new design system.
          </Expandable>
        </ComponentExample>
      </ComponentSection>

      {/* Installation */}
      <ComponentSection>
        <h2 className="text-2xl font-bold mb-4">Installation</h2>
        <CodeBlock
          lang="tsx"
          code={`import { Expandable } from "~/components/expandable/expandable";`}
        />
      </ComponentSection>

      {/* Usage */}
      <ComponentSection>
        <h2 className="text-2xl font-bold mb-4">Usage</h2>
        <CodeBlock
          lang="tsx"
          code={`import { Expandable } from "~/components/expandable/expandable";

export default function Example() {
  return (
    <Expandable title="Question">
      Answer content goes here.
    </Expandable>
  );
}`}
        />
      </ComponentSection>

      {/* Examples */}
      <ComponentSection>
        <h2 className="text-2xl font-bold mb-6">Examples</h2>

        <div className="space-y-8">
          <div>
            <h3 className="text-xl font-semibold mb-4">Single Item</h3>
            <ComponentExample
              code={`<Expandable title="What is Kumo?">
  Kumo is Cloudflare's new design system.
</Expandable>`}
            >
              <Expandable title="What is Kumo?">
                Kumo is Cloudflare's new design system.
              </Expandable>
            </ComponentExample>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-4">Multiple Items</h3>
            <ComponentExample
              code={`<div className="space-y-2">
  <Expandable title="What is Kumo?">
    Kumo is Cloudflare's new design system.
  </Expandable>
  <Expandable title="How do I use it?">
    Install the components and import them into your project.
  </Expandable>
  <Expandable title="Is it open source?">
    Check the repository for license information.
  </Expandable>
</div>`}
            >
              <div className="space-y-2 w-full">
                <Expandable title="What is Kumo?">
                  Kumo is Cloudflare's new design system.
                </Expandable>
                <Expandable title="How do I use it?">
                  Install the components and import them into your project.
                </Expandable>
                <Expandable title="Is it open source?">
                  Check the repository for license information.
                </Expandable>
              </div>
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
                <td className="py-3 px-4 font-mono text-xs">title</td>
                <td className="py-3 px-4 font-mono text-xs">string</td>
                <td className="py-3 px-4 font-mono text-xs">undefined</td>
              </tr>
              <tr className="border-b border-neutral-200 dark:border-neutral-800">
                <td className="py-3 px-4 font-mono text-xs">children</td>
                <td className="py-3 px-4 font-mono text-xs">React.ReactNode</td>
                <td className="py-3 px-4 font-mono text-xs">undefined</td>
              </tr>
            </tbody>
          </table>
        </div>
      </ComponentSection>
    </DocLayout>
  );
}
