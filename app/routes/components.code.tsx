import { Code, CodeBlock } from "~/components/code/code-lazy";
import { DocLayout } from "~/components/docs/doc-layout";
import { ComponentExample } from "~/components/docs/component-example";
import { ComponentSection } from "~/components/docs/component-section";

export default function CodeDoc() {
  return (
    <DocLayout
      title="Code"
      description="Syntax-highlighted code blocks with support for multiple languages."
    >
      {/* Demo */}
      <ComponentSection>
        <ComponentExample>
          <CodeBlock lang="tsx" code={`const greeting = "Hello, World!";
console.log(greeting);`} />
        </ComponentExample>
      </ComponentSection>

      {/* Installation */}
      <ComponentSection>
        <h2 className="text-2xl font-bold mb-4">Installation</h2>
        <CodeBlock
          lang="tsx"
          code={`import { Code, CodeBlock } from "~/components/code/code-lazy";`}
        />
      </ComponentSection>

      {/* Usage */}
      <ComponentSection>
        <h2 className="text-2xl font-bold mb-4">Usage</h2>
        <CodeBlock
          lang="tsx"
          code={`import { CodeBlock } from "~/components/code/code-lazy";

export default function Example() {
  return (
    <CodeBlock 
      lang="tsx" 
      code={\`const hello = "world";\`} 
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
            <h3 className="text-xl font-semibold mb-4">TypeScript</h3>
            <ComponentExample>
              <CodeBlock
                lang="tsx"
                code={`interface User {
  id: string;
  name: string;
  email: string;
}

const user: User = {
  id: "1",
  name: "John Doe",
  email: "john@example.com"
};`}
              />
            </ComponentExample>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-4">Bash</h3>
            <ComponentExample>
              <CodeBlock
                lang="bash"
                code={`npm install @cloudflare/kumo
pnpm add @cloudflare/kumo`}
              />
            </ComponentExample>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-4">JSON</h3>
            <ComponentExample>
              <CodeBlock
                lang="jsonc"
                code={`{
  "name": "kumo",
  "version": "1.0.0",
  "dependencies": {
    "react": "^19.0.0"
  }
}`}
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
                <td className="py-3 px-4 font-mono text-xs">lang</td>
                <td className="py-3 px-4 font-mono text-xs">BundledLanguage</td>
                <td className="py-3 px-4 font-mono text-xs">undefined</td>
              </tr>
              <tr className="border-b border-neutral-200 dark:border-neutral-800">
                <td className="py-3 px-4 font-mono text-xs">code</td>
                <td className="py-3 px-4 font-mono text-xs">string</td>
                <td className="py-3 px-4 font-mono text-xs">undefined</td>
              </tr>
              <tr className="border-b border-neutral-200 dark:border-neutral-800">
                <td className="py-3 px-4 font-mono text-xs">values</td>
                <td className="py-3 px-4 font-mono text-xs">{`Record<string, { value: string; highlight?: boolean }>`}</td>
                <td className="py-3 px-4 font-mono text-xs">undefined</td>
              </tr>
            </tbody>
          </table>
        </div>
      </ComponentSection>
    </DocLayout>
  );
}
