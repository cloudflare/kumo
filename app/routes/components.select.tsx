import { Select } from "~/components/select/select";
import { DocLayout } from "~/components/docs/doc-layout";
import { ComponentExample } from "~/components/docs/component-example";
import { ComponentSection } from "~/components/docs/component-section";
import { CodeBlock } from "~/components/code/code-lazy";

export default function SelectDoc() {
  return (
    <DocLayout
      title="Select"
      description="Displays a list of options for the user to pick from—triggered by a button."
    >
      {/* Demo */}
      <ComponentSection>
        <ComponentExample
          code={`<Select className="w-[200px]">
  <Select.Option value="option1">Option 1</Select.Option>
  <Select.Option value="option2">Option 2</Select.Option>
  <Select.Option value="option3">Option 3</Select.Option>
</Select>`}
        >
          <Select className="w-[200px]">
            <Select.Option value="option1">Option 1</Select.Option>
            <Select.Option value="option2">Option 2</Select.Option>
            <Select.Option value="option3">Option 3</Select.Option>
          </Select>
        </ComponentExample>
      </ComponentSection>

      {/* Installation */}
      <ComponentSection>
        <h2 className="text-2xl font-bold mb-4">Installation</h2>
        <CodeBlock
          lang="tsx"
          code={`import { Select } from "~/components/select/select";`}
        />
      </ComponentSection>

      {/* Usage */}
      <ComponentSection>
        <h2 className="text-2xl font-bold mb-4">Usage</h2>
        <CodeBlock
          lang="tsx"
          code={`import { Select } from "~/components/select/select";

export default function Example() {
  return (
    <Select>
      <Select.Option value="option1">Option 1</Select.Option>
      <Select.Option value="option2">Option 2</Select.Option>
    </Select>
  );
}`}
        />
      </ComponentSection>

      {/* Examples */}
      <ComponentSection>
        <h2 className="text-2xl font-bold mb-6">Examples</h2>

        <div className="space-y-8">
          <div>
            <h3 className="text-xl font-semibold mb-4">Default</h3>
            <ComponentExample
              code={`<Select className="w-[200px]">
  <Select.Option value="all">All versions</Select.Option>
  <Select.Option value="active">Active versions</Select.Option>
  <Select.Option value="specific">Specific versions</Select.Option>
</Select>`}
            >
              <Select className="w-[200px]">
                <Select.Option value="all">All versions</Select.Option>
                <Select.Option value="active">Active versions</Select.Option>
                <Select.Option value="specific">Specific versions</Select.Option>
              </Select>
            </ComponentExample>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-4">With Custom Render</h3>
            <ComponentExample
              code={`<Select
  className="w-[200px]"
  renderValue={(v) => {
    const labels: Record<string, string> = {
      all: "All deployed versions",
      active: "Active versions",
      specific: "Specific versions",
    };
    return v ? labels[v] : "Select...";
  }}
>
  <Select.Option value="all">All deployed versions</Select.Option>
  <Select.Option value="active">Active versions</Select.Option>
  <Select.Option value="specific">Specific versions</Select.Option>
</Select>`}
            >
              <Select
                className="w-[200px]"
                renderValue={(v) => {
                  const labels: Record<string, string> = {
                    all: "All deployed versions",
                    active: "Active versions",
                    specific: "Specific versions",
                  };
                  return v ? labels[v] : "Select...";
                }}
              >
                <Select.Option value="all">All deployed versions</Select.Option>
                <Select.Option value="active">Active versions</Select.Option>
                <Select.Option value="specific">Specific versions</Select.Option>
              </Select>
            </ComponentExample>
          </div>
        </div>
      </ComponentSection>
    </DocLayout>
  );
}
