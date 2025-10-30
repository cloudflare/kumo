import { Field } from "~/components/field/field";
import { Input } from "~/components/input/input";
import { DocLayout } from "~/components/docs/doc-layout";
import { ComponentExample } from "~/components/docs/component-example";
import { ComponentSection } from "~/components/docs/component-section";
import { CodeBlock } from "~/components/code/code-lazy";

export default function FieldDoc() {
  return (
    <DocLayout
      title="Field"
      description="A wrapper component that provides labels, descriptions, and error messages for form inputs."
    >
      {/* Demo */}
      <ComponentSection>
        <ComponentExample
          code={`<Field
  label="Email"
  description="The email to send notifications to."
>
  <Input placeholder="name@example.com" type="email" />
</Field>`}
        >
          <Field
            label="Email"
            description="The email to send notifications to."
          >
            <Input placeholder="name@example.com" type="email" />
          </Field>
        </ComponentExample>
      </ComponentSection>

      {/* Installation */}
      <ComponentSection>
        <h2 className="text-2xl font-bold mb-4">Installation</h2>
        <CodeBlock
          lang="tsx"
          code={`import { Field } from "~/components/field/field";`}
        />
      </ComponentSection>

      {/* Usage */}
      <ComponentSection>
        <h2 className="text-2xl font-bold mb-4">Usage</h2>
        <CodeBlock
          lang="tsx"
          code={`import { Field } from "~/components/field/field";
import { Input } from "~/components/input/input";

export default function Example() {
  return (
    <Field label="Username">
      <Input placeholder="Enter username" />
    </Field>
  );
}`}
        />
      </ComponentSection>

      {/* Examples */}
      <ComponentSection>
        <h2 className="text-2xl font-bold mb-6">Examples</h2>

        <div className="space-y-8">
          <div>
            <h3 className="text-xl font-semibold mb-4">With Label</h3>
            <ComponentExample
              code={`<Field label="Username">
  <Input placeholder="Enter username" />
</Field>`}
            >
              <Field label="Username">
                <Input placeholder="Enter username" />
              </Field>
            </ComponentExample>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-4">With Description</h3>
            <ComponentExample
              code={`<Field
  label="API Key"
  description="Your secret API key for authentication."
>
  <Input type="password" placeholder="sk_..." />
</Field>`}
            >
              <Field
                label="API Key"
                description="Your secret API key for authentication."
              >
                <Input type="password" placeholder="sk_..." />
              </Field>
            </ComponentExample>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-4">With Error</h3>
            <ComponentExample
              code={`<Field
  label="Email"
  error={{
    message: "Please enter a valid email.",
    match: "typeMismatch",
  }}
>
  <Input 
    placeholder="name@example.com" 
    type="email" 
    variant="error"
  />
</Field>`}
            >
              <Field
                label="Email"
                error={{
                  message: "Please enter a valid email.",
                  match: "typeMismatch",
                }}
              >
                <Input 
                  placeholder="name@example.com" 
                  type="email" 
                  variant="error"
                />
              </Field>
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
                <td className="py-3 px-4 font-mono text-xs">description</td>
                <td className="py-3 px-4 font-mono text-xs">string</td>
                <td className="py-3 px-4 font-mono text-xs">undefined</td>
              </tr>
              <tr className="border-b border-neutral-200 dark:border-neutral-800">
                <td className="py-3 px-4 font-mono text-xs">error</td>
                <td className="py-3 px-4 font-mono text-xs">{`{ message: string; match: string }`}</td>
                <td className="py-3 px-4 font-mono text-xs">undefined</td>
              </tr>
            </tbody>
          </table>
        </div>
      </ComponentSection>
    </DocLayout>
  );
}
