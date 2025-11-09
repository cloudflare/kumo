import { ListIcon, CodeIcon, GlobeIcon, SquaresFourIcon } from "@phosphor-icons/react";
import { DocLayout } from "~/components/docs/doc-layout";
import { ComponentExample } from "~/components/docs/component-example";
import { ComponentSection } from "~/components/docs/component-section";
import { CodeBlock } from "~/components/code/code-lazy";
import { ResourceListPage } from "~/layouts/resource-list";
import { Button } from "~/components/button/button";
import { Pagination } from "~/components/pagination/pagination";
import { Empty } from "~/blocks/empty";

export default function ResourceListDoc() {
  return (
    <DocLayout
      title="Resource List"
      description="A layout component for displaying resource lists with a title, description, and optional sidebar content."
    >
      {/* Demo */}
      <ComponentSection>
        <ComponentExample
          code={`<ResourceListPage
  title="Components"
  description="Reusable UI components for building modern applications."
  icon={<ListIcon size={32} />}
>
  <div className="space-y-4">
    <div className="p-4 bg-white dark:bg-neutral-900 rounded-lg border">
      Component 1
    </div>
    <div className="p-4 bg-white dark:bg-neutral-900 rounded-lg border">
      Component 2
    </div>
  </div>
</ResourceListPage>`}
        >
          <div className="border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden">
            {/* <ResourceListPage
              title="Components"
              description="Reusable UI components for building modern applications."
              icon={<ListIcon size={32} />}
            >
              <div className="space-y-4">
                <div className="p-4 bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800">
                  Component 1
                </div>
                <div className="p-4 bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800">
                  Component 2
                </div>
              </div>
            </ResourceListPage> */}
            <ResourceListPage
              title="Resource List Page"
              description="This is a resource list page."
              icon={<SquaresFourIcon size={28} />}
              usage={<>Usage Section</>}
              additionalContent={<>Additional Content Section</>}
            >
              <Empty
                icon={<SquaresFourIcon size={48} />}
                title="Create a Queue" 
                description="Build event-driven systems by creating a Queue above, or use Wrangler CLI to create a Queue." 
                commandLine="npx wrangler queues create BINDING_NAME" 
                contents={<div className="flex items-center gap-2">
                  <Button icon={<CodeIcon />}>See examples</Button>
                  <Button icon={<GlobeIcon />} variant="primary">View documentation</Button>
                </div>}
              />

              <div className="mt-4">
                <Pagination page={1} perPage={10} totalCount={100} setPage={function (page: number): void {
                    throw new Error("Function not implemented.");
                  }}
                />
              </div>
            </ResourceListPage>
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
          code={`import { ResourceListPage } from "~/layouts/resource-list";`}
        />
      </ComponentSection>

      {/* Usage */}
      <ComponentSection>
        <h2 className="text-2xl font-bold mb-4">Usage</h2>
        <CodeBlock
          lang="tsx"
          code={`import { ResourceListPage } from "~/layouts/resource-list";
import { ListIcon } from "@phosphor-icons/react";

export default function Example() {
  return (
    <ResourceListPage
      title="My Resources"
      description="A list of all your resources."
      icon={<ListIcon size={32} />}
    >
      {/* Your content here */}
    </ResourceListPage>
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
            code={`<ResourceListPage
  title="Projects"
  description="All your projects in one place."
>
  <div className="p-4 bg-white dark:bg-neutral-900 rounded-lg border">
    Project content
  </div>
</ResourceListPage>`}
          >
            <div className="border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden">
              <ResourceListPage
                title="Projects"
                description="All your projects in one place."
              >
                <div className="p-4 bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800">
                  Project content
                </div>
              </ResourceListPage>
            </div>
          </ComponentExample>
        </div>

        {/* With Icon */}
        <div className="mb-12">
          <h3 className="text-xl font-semibold mb-4">With Icon</h3>
          <ComponentExample
            code={`<ResourceListPage
  title="Code Snippets"
  description="Your saved code snippets."
  icon={<CodeIcon size={32} />}
>
  <div className="p-4 bg-white dark:bg-neutral-900 rounded-lg border">
    Snippet content
  </div>
</ResourceListPage>`}
          >
            <div className="border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden">
              <ResourceListPage
                title="Code Snippets"
                description="Your saved code snippets."
                icon={<CodeIcon size={32} />}
              >
                <div className="p-4 bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800">
                  Snippet content
                </div>
              </ResourceListPage>
            </div>
          </ComponentExample>
        </div>

        {/* With Usage Sidebar */}
        <div className="mb-12">
          <h3 className="text-xl font-semibold mb-4">With Usage Sidebar</h3>
          <ComponentExample
            code={`<ResourceListPage
  title="API Keys"
  description="Manage your API keys and access tokens."
  icon={<ListIcon size={32} />}
  usage={
    <div className="p-4 bg-white dark:bg-neutral-900 rounded-lg border">
      <h3 className="font-semibold mb-2">Usage</h3>
      <p className="text-sm text-neutral-600 dark:text-neutral-400">
        Use API keys to authenticate your requests.
      </p>
    </div>
  }
>
  <div className="p-4 bg-white dark:bg-neutral-900 rounded-lg border">
    API key content
  </div>
</ResourceListPage>`}
          >
            <div className="border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden">
              <ResourceListPage
                title="API Keys"
                description="Manage your API keys and access tokens."
                icon={<ListIcon size={32} />}
                usage={
                  <div className="p-4 bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800">
                    <h3 className="font-semibold mb-2">Usage</h3>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                      Use API keys to authenticate your requests.
                    </p>
                  </div>
                }
              >
                <div className="p-4 bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800">
                  API key content
                </div>
              </ResourceListPage>
            </div>
          </ComponentExample>
        </div>

        {/* With Additional Content */}
        <div className="mb-12">
          <h3 className="text-xl font-semibold mb-4">With Additional Content</h3>
          <ComponentExample
            code={`<ResourceListPage
  title="Deployments"
  description="View and manage your deployments."
  icon={<ListIcon size={32} />}
  additionalContent={
    <div className="p-4 bg-white dark:bg-neutral-900 rounded-lg border">
      <h3 className="font-semibold mb-2">Quick Actions</h3>
      <Button variant="primary" className="w-full">
        New Deployment
      </Button>
    </div>
  }
>
  <div className="p-4 bg-white dark:bg-neutral-900 rounded-lg border">
    Deployment content
  </div>
</ResourceListPage>`}
          >
            <div className="border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden">
              <ResourceListPage
                title="Deployments"
                description="View and manage your deployments."
                icon={<ListIcon size={32} />}
                additionalContent={
                  <div className="p-4 bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800">
                    <h3 className="font-semibold mb-2">Quick Actions</h3>
                    <Button variant="primary" className="w-full">
                      New Deployment
                    </Button>
                  </div>
                }
              >
                <div className="p-4 bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800">
                  Deployment content
                </div>
              </ResourceListPage>
            </div>
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
                <td className="py-3 px-4 font-mono text-xs">title</td>
                <td className="py-3 px-4 font-mono text-xs">string</td>
                <td className="py-3 px-4 font-mono text-xs">undefined</td>
              </tr>
              <tr className="border-b border-neutral-200 dark:border-neutral-800">
                <td className="py-3 px-4 font-mono text-xs">description</td>
                <td className="py-3 px-4 font-mono text-xs">string</td>
                <td className="py-3 px-4 font-mono text-xs">undefined</td>
              </tr>
              <tr className="border-b border-neutral-200 dark:border-neutral-800">
                <td className="py-3 px-4 font-mono text-xs">icon</td>
                <td className="py-3 px-4 font-mono text-xs">React.ReactNode</td>
                <td className="py-3 px-4 font-mono text-xs">undefined</td>
              </tr>
              <tr className="border-b border-neutral-200 dark:border-neutral-800">
                <td className="py-3 px-4 font-mono text-xs">usage</td>
                <td className="py-3 px-4 font-mono text-xs">React.ReactNode</td>
                <td className="py-3 px-4 font-mono text-xs">undefined</td>
              </tr>
              <tr className="border-b border-neutral-200 dark:border-neutral-800">
                <td className="py-3 px-4 font-mono text-xs">additionalContent</td>
                <td className="py-3 px-4 font-mono text-xs">React.ReactNode</td>
                <td className="py-3 px-4 font-mono text-xs">undefined</td>
              </tr>
              <tr className="border-b border-neutral-200 dark:border-neutral-800">
                <td className="py-3 px-4 font-mono text-xs">children</td>
                <td className="py-3 px-4 font-mono text-xs">React.ReactNode</td>
                <td className="py-3 px-4 font-mono text-xs">required</td>
              </tr>
            </tbody>
          </table>
        </div>
      </ComponentSection>
    </DocLayout>
  );
}
