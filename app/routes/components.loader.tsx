import { Loader } from "~/components/loader/loader";
import { DocLayout } from "~/components/docs/doc-layout";
import { ComponentExample } from "~/components/docs/component-example";
import { ComponentSection } from "~/components/docs/component-section";
import { CodeBlock } from "~/components/code/code-lazy";

export default function LoaderDoc() {
  return (
    <DocLayout
      title="Loader"
      description="A loading spinner to indicate loading state."
    >
      {/* Demo */}
      <ComponentSection>
        <ComponentExample code={`<Loader />`}>
          <Loader />
        </ComponentExample>
      </ComponentSection>

      {/* Installation */}
      <ComponentSection>
        <h2 className="text-2xl font-bold mb-4">Installation</h2>
        <CodeBlock
          lang="tsx"
          code={`import { Loader } from "~/components/loader/loader";`}
        />
      </ComponentSection>

      {/* Usage */}
      <ComponentSection>
        <h2 className="text-2xl font-bold mb-4">Usage</h2>
        <CodeBlock
          lang="tsx"
          code={`import { Loader } from "~/components/loader/loader";

export default function Example() {
  return <Loader />;
}`}
        />
      </ComponentSection>

      {/* Examples */}
      <ComponentSection>
        <h2 className="text-2xl font-bold mb-6">Examples</h2>

        <div className="space-y-8">
          <div>
            <h3 className="text-xl font-semibold mb-4">Default Size</h3>
            <ComponentExample code={`<Loader />`}>
              <Loader />
            </ComponentExample>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-4">Custom Size</h3>
            <ComponentExample code={`<Loader size={24} />`}>
              <Loader size={24} />
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
                <td className="py-3 px-4 font-mono text-xs">size</td>
                <td className="py-3 px-4 font-mono text-xs">number</td>
                <td className="py-3 px-4 font-mono text-xs">16</td>
              </tr>
            </tbody>
          </table>
        </div>
      </ComponentSection>
    </DocLayout>
  );
}
