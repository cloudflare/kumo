import { HouseIcon, FolderIcon, FileTextIcon } from "@phosphor-icons/react";
import { DocLayout } from "~/components/docs/doc-layout";
import { ComponentExample } from "~/components/docs/component-example";
import { ComponentSection } from "~/components/docs/component-section";
import { CodeBlock } from "~/components/code/code-lazy";
import { Breadcrumbs } from "~/blocks/breadcrumbs";

export default function BreadcrumbsDoc() {
  return (
    <DocLayout
      title="Breadcrumbs"
      description="A navigation component that shows the current page's location within a navigational hierarchy."
    >
      {/* Demo */}
      <ComponentSection>
        <ComponentExample
          code={`<Breadcrumbs items={[
  { label: "Home", to: "/" },
  { label: "Projects", to: "/projects" },
  { label: "Current Project" }
]} />`}
        >
          <Breadcrumbs items={[
            { label: "Home", to: "/" },
            { label: "Projects", to: "/projects" },
            { label: "Current Project" }
          ]} />
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
          code={`import { Breadcrumbs } from "~/blocks/breadcrumbs";`}
        />
      </ComponentSection>

      {/* Usage */}
      <ComponentSection>
        <h2 className="text-2xl font-bold mb-4">Usage</h2>
        <CodeBlock
          lang="tsx"
          code={`import { Breadcrumbs } from "~/blocks/breadcrumbs";

export default function Example() {
  return (
    <Breadcrumbs items={[
      { label: "Home", to: "/" },
      { label: "Projects", to: "/projects" },
      { label: "Current Project" }
    ]} />
  );
}`}
        />
      </ComponentSection>

      {/* Examples */}
      <ComponentSection>
        <h2 className="text-2xl font-bold mb-6">Examples</h2>

        {/* Basic */}
        <div className="mb-12">
          <h3 className="text-xl font-semibold mb-4">Basic</h3>
          <ComponentExample
            code={`<Breadcrumbs items={[
  { label: "Home", to: "/" },
  { label: "Docs", to: "/docs" },
  { label: "Breadcrumbs" }
]} />`}
          >
            <Breadcrumbs items={[
              { label: "Home", to: "/" },
              { label: "Docs", to: "/docs" },
              { label: "Breadcrumbs" }
            ]} />
          </ComponentExample>
        </div>

        {/* With Icons */}
        <div className="mb-12">
          <h3 className="text-xl font-semibold mb-4">With Icons</h3>
          <ComponentExample
            code={`<Breadcrumbs items={[
  { label: "Home", to: "/", icon: <HouseIcon size={16} /> },
  { label: "Projects", to: "/projects", icon: <FolderIcon size={16} /> },
  { label: "file.tsx", icon: <FileTextIcon size={16} /> }
]} />`}
          >
            <Breadcrumbs items={[
              { label: "Home", to: "/", icon: <HouseIcon size={16} /> },
              { label: "Projects", to: "/projects", icon: <FolderIcon size={16} /> },
              { label: "file.tsx", icon: <FileTextIcon size={16} /> }
            ]} />
          </ComponentExample>
        </div>

        {/* Long Path */}
        <div className="mb-12">
          <h3 className="text-xl font-semibold mb-4">Long Path</h3>
          <ComponentExample
            code={`<Breadcrumbs items={[
  { label: "Home", to: "/" },
  { label: "Projects", to: "/projects" },
  { label: "My Project", to: "/projects/my-project" },
  { label: "Source", to: "/projects/my-project/src" },
  { label: "Components", to: "/projects/my-project/src/components" },
  { label: "Button.tsx" }
]} />`}
          >
            <Breadcrumbs items={[
              { label: "Home", to: "/" },
              { label: "Projects", to: "/projects" },
              { label: "My Project", to: "/projects/my-project" },
              { label: "Source", to: "/projects/my-project/src" },
              { label: "Components", to: "/projects/my-project/src/components" },
              { label: "Button.tsx" }
            ]} />
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
                <td className="py-3 px-4 font-mono text-xs">items</td>
                <td className="py-3 px-4 font-mono text-xs">BreadcrumbItem[]</td>
                <td className="py-3 px-4 font-mono text-xs">required</td>
              </tr>
              <tr className="border-b border-neutral-200 dark:border-neutral-800">
                <td className="py-3 px-4 font-mono text-xs">className</td>
                <td className="py-3 px-4 font-mono text-xs">string</td>
                <td className="py-3 px-4 font-mono text-xs">undefined</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-3">BreadcrumbItem</h3>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-200 dark:border-neutral-800">
                <th className="text-left py-3 px-4 font-semibold">Property</th>
                <th className="text-left py-3 px-4 font-semibold">Type</th>
                <th className="text-left py-3 px-4 font-semibold">Description</th>
              </tr>
            </thead>
            <tbody className="text-neutral-600 dark:text-neutral-400">
              <tr className="border-b border-neutral-200 dark:border-neutral-800">
                <td className="py-3 px-4 font-mono text-xs">label</td>
                <td className="py-3 px-4 font-mono text-xs">ReactNode</td>
                <td className="py-3 px-4">The text or content to display</td>
              </tr>
              <tr className="border-b border-neutral-200 dark:border-neutral-800">
                <td className="py-3 px-4 font-mono text-xs">to</td>
                <td className="py-3 px-4 font-mono text-xs">string</td>
                <td className="py-3 px-4">Optional link destination</td>
              </tr>
              <tr className="border-b border-neutral-200 dark:border-neutral-800">
                <td className="py-3 px-4 font-mono text-xs">icon</td>
                <td className="py-3 px-4 font-mono text-xs">ReactNode</td>
                <td className="py-3 px-4">Optional icon to display</td>
              </tr>
            </tbody>
          </table>
        </div>
      </ComponentSection>
    </DocLayout>
  );
}
