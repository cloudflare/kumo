import { LayerCard } from "~/components/layer-card/layer-card";
import { DocLayout } from "~/components/docs/doc-layout";
import { ComponentExample } from "~/components/docs/component-example";
import { ComponentSection } from "~/components/docs/component-section";
import { CodeBlock } from "~/components/code/code-lazy";

export default function LayerCardDoc() {
  return (
    <DocLayout
      title="Layer Card"
      description="A card component with a layered visual effect, perfect for navigation or feature highlights."
    >
      {/* Demo */}
      <ComponentSection>
        <ComponentExample
          code={`<LayerCard className="w-[200px]" title="Next Steps" href="/">
  <div className="p-4">Get started with Kumo</div>
</LayerCard>`}
        >
          <LayerCard className="w-[200px]" title="Next Steps" href="/">
            <div className="p-4">Get started with Kumo</div>
          </LayerCard>
        </ComponentExample>
      </ComponentSection>

      {/* Installation */}
      <ComponentSection>
        <h2 className="text-2xl font-bold mb-4">Installation</h2>
        <CodeBlock
          lang="tsx"
          code={`import { LayerCard } from "~/components/layer-card/layer-card";`}
        />
      </ComponentSection>

      {/* Usage */}
      <ComponentSection>
        <h2 className="text-2xl font-bold mb-4">Usage</h2>
        <CodeBlock
          lang="tsx"
          code={`import { LayerCard } from "~/components/layer-card/layer-card";

export default function Example() {
  return (
    <LayerCard title="Documentation" href="/docs">
      <div className="p-4">
        Learn how to use Kumo components
      </div>
    </LayerCard>
  );
}`}
        />
      </ComponentSection>

      {/* Examples */}
      <ComponentSection>
        <h2 className="text-2xl font-bold mb-6">Examples</h2>

        <div className="space-y-8">
          <div>
            <h3 className="text-xl font-semibold mb-4">Basic Card</h3>
            <ComponentExample
              code={`<LayerCard className="w-[250px]" title="Getting Started" href="/start">
  <div className="p-4 text-sm text-neutral-600 dark:text-neutral-400">
    Quick start guide for new users
  </div>
</LayerCard>`}
            >
              <LayerCard className="w-[250px]" title="Getting Started" href="/start">
                <div className="p-4 text-sm text-neutral-600 dark:text-neutral-400">
                  Quick start guide for new users
                </div>
              </LayerCard>
            </ComponentExample>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-4">Multiple Cards</h3>
            <ComponentExample
              code={`<div className="flex gap-4">
  <LayerCard className="w-[200px]" title="Components" href="/components">
    <div className="p-4 text-sm">Browse all components</div>
  </LayerCard>
  <LayerCard className="w-[200px]" title="Examples" href="/examples">
    <div className="p-4 text-sm">View code examples</div>
  </LayerCard>
</div>`}
            >
              <div className="flex gap-4">
                <LayerCard className="w-[200px]" title="Components" href="/components">
                  <div className="p-4 text-sm">Browse all components</div>
                </LayerCard>
                <LayerCard className="w-[200px]" title="Examples" href="/examples">
                  <div className="p-4 text-sm">View code examples</div>
                </LayerCard>
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
                <td className="py-3 px-4 font-mono text-xs">href</td>
                <td className="py-3 px-4 font-mono text-xs">string</td>
                <td className="py-3 px-4 font-mono text-xs">undefined</td>
              </tr>
              <tr className="border-b border-neutral-200 dark:border-neutral-800">
                <td className="py-3 px-4 font-mono text-xs">className</td>
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
