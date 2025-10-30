import { SkeletonLine } from "~/components/loader/skeleton-line";
import { DocLayout } from "~/components/docs/doc-layout";
import { ComponentExample } from "~/components/docs/component-example";
import { ComponentSection } from "~/components/docs/component-section";
import { CodeBlock } from "~/components/code/code-lazy";

export default function SkeletonLineDoc() {
  return (
    <DocLayout
      title="Skeleton Line"
      description="A skeleton loading placeholder for text content."
    >
      {/* Demo */}
      <ComponentSection>
        <ComponentExample
          code={`<div className="flex flex-col gap-2 w-[200px]">
  <SkeletonLine minWidth={50} maxWidth={100} />
  <SkeletonLine minWidth={100} />
  <SkeletonLine minWidth={50} maxWidth={150} />
</div>`}
        >
          <div className="flex flex-col gap-2 w-[200px]">
            <SkeletonLine minWidth={50} maxWidth={100} />
            <SkeletonLine minWidth={100} />
            <SkeletonLine minWidth={50} maxWidth={150} />
          </div>
        </ComponentExample>
      </ComponentSection>

      {/* Installation */}
      <ComponentSection>
        <h2 className="text-2xl font-bold mb-4">Installation</h2>
        <CodeBlock
          lang="tsx"
          code={`import { SkeletonLine } from "~/components/loader/skeleton-line";`}
        />
      </ComponentSection>

      {/* Usage */}
      <ComponentSection>
        <h2 className="text-2xl font-bold mb-4">Usage</h2>
        <CodeBlock
          lang="tsx"
          code={`import { SkeletonLine } from "~/components/loader/skeleton-line";

export default function Example() {
  return (
    <div className="space-y-2">
      <SkeletonLine />
      <SkeletonLine />
      <SkeletonLine />
    </div>
  );
}`}
        />
      </ComponentSection>

      {/* Examples */}
      <ComponentSection>
        <h2 className="text-2xl font-bold mb-6">Examples</h2>

        <div className="space-y-8">
          <div>
            <h3 className="text-xl font-semibold mb-4">Variable Width</h3>
            <ComponentExample
              code={`<div className="flex flex-col gap-2 w-[300px]">
  <SkeletonLine minWidth={50} maxWidth={100} />
  <SkeletonLine minWidth={100} maxWidth={200} />
  <SkeletonLine minWidth={150} maxWidth={250} />
</div>`}
            >
              <div className="flex flex-col gap-2 w-[300px]">
                <SkeletonLine minWidth={50} maxWidth={100} />
                <SkeletonLine minWidth={100} maxWidth={200} />
                <SkeletonLine minWidth={150} maxWidth={250} />
              </div>
            </ComponentExample>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-4">Text Block</h3>
            <ComponentExample
              code={`<div className="flex flex-col gap-2 w-[400px]">
  <SkeletonLine minWidth={300} maxWidth={400} />
  <SkeletonLine minWidth={350} maxWidth={400} />
  <SkeletonLine minWidth={200} maxWidth={300} />
  <SkeletonLine minWidth={300} maxWidth={400} />
</div>`}
            >
              <div className="flex flex-col gap-2 w-[400px]">
                <SkeletonLine minWidth={300} maxWidth={400} />
                <SkeletonLine minWidth={350} maxWidth={400} />
                <SkeletonLine minWidth={200} maxWidth={300} />
                <SkeletonLine minWidth={300} maxWidth={400} />
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
                <td className="py-3 px-4 font-mono text-xs">minWidth</td>
                <td className="py-3 px-4 font-mono text-xs">number</td>
                <td className="py-3 px-4 font-mono text-xs">undefined</td>
              </tr>
              <tr className="border-b border-neutral-200 dark:border-neutral-800">
                <td className="py-3 px-4 font-mono text-xs">maxWidth</td>
                <td className="py-3 px-4 font-mono text-xs">number</td>
                <td className="py-3 px-4 font-mono text-xs">undefined</td>
              </tr>
            </tbody>
          </table>
        </div>
      </ComponentSection>
    </DocLayout>
  );
}
