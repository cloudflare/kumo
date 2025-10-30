import { Surface } from "~/components/surface/surface";
import { DocLayout } from "~/components/docs/doc-layout";
import { ComponentExample } from "~/components/docs/component-example";
import { ComponentSection } from "~/components/docs/component-section";
import { CodeBlock } from "~/components/code/code-lazy";

export default function SurfaceDoc() {
  return (
    <DocLayout
      title="Surface"
      description="A container component that provides a surface for content with proper styling."
    >
      {/* Demo */}
      <ComponentSection>
        <ComponentExample
          code={`<Surface className="w-40 h-24 rounded-lg bg-surface flex items-center justify-center">
  <p className="text-sm text-neutral-500">Content</p>
</Surface>`}
        >
          <Surface className="w-40 h-24 rounded-lg bg-surface flex items-center justify-center">
            <p className="text-sm text-neutral-500">Content</p>
          </Surface>
        </ComponentExample>
      </ComponentSection>

      {/* Installation */}
      <ComponentSection>
        <h2 className="text-2xl font-bold mb-4">Installation</h2>
        <CodeBlock
          lang="tsx"
          code={`import { Surface } from "~/components/surface/surface";`}
        />
      </ComponentSection>

      {/* Usage */}
      <ComponentSection>
        <h2 className="text-2xl font-bold mb-4">Usage</h2>
        <CodeBlock
          lang="tsx"
          code={`import { Surface } from "~/components/surface/surface";

export default function Example() {
  return (
    <Surface className="p-4">
      <p>Your content here</p>
    </Surface>
  );
}`}
        />
      </ComponentSection>

      {/* Examples */}
      <ComponentSection>
        <h2 className="text-2xl font-bold mb-6">Examples</h2>

        <div className="space-y-8">
          <div>
            <h3 className="text-xl font-semibold mb-4">Basic Surface</h3>
            <ComponentExample
              code={`<Surface className="w-64 h-32 rounded-lg bg-surface flex items-center justify-center">
  <p className="text-sm text-neutral-500">A surface container</p>
</Surface>`}
            >
              <Surface className="w-64 h-32 rounded-lg bg-surface flex items-center justify-center">
                <p className="text-sm text-neutral-500">A surface container</p>
              </Surface>
            </ComponentExample>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-4">Card Layout</h3>
            <ComponentExample
              code={`<Surface className="w-80 rounded-lg bg-surface p-6 border border-neutral-200 dark:border-neutral-800">
  <h3 className="text-lg font-semibold mb-2">Card Title</h3>
  <p className="text-sm text-neutral-600 dark:text-neutral-400">
    This is a card built with the Surface component.
  </p>
</Surface>`}
            >
              <Surface className="w-80 rounded-lg bg-surface p-6 border border-neutral-200 dark:border-neutral-800">
                <h3 className="text-lg font-semibold mb-2">Card Title</h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  This is a card built with the Surface component.
                </p>
              </Surface>
            </ComponentExample>
          </div>
        </div>
      </ComponentSection>
    </DocLayout>
  );
}
