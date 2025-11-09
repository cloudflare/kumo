import { HouseIcon, GearIcon, CodeIcon, GlobeIcon } from "@phosphor-icons/react";
import { DocLayout } from "~/components/docs/doc-layout";
import { ComponentExample } from "~/components/docs/component-example";
import { ComponentSection } from "~/components/docs/component-section";
import { CodeBlock } from "~/components/code/code-lazy";
import { PageHeader } from "~/blocks/page-header";
import { Button } from "~/components/button/button";

export default function PageHeaderDoc() {
  return (
    <DocLayout
      title="Page Header"
      description="A composite component that combines breadcrumbs and tabs for page navigation."
    >
      {/* Demo */}
      <ComponentSection>
        <ComponentExample
          code={`<PageHeader
    className="w-full"
    breadcrumbs={[
    {
        icon: <HouseIcon />,
        label: "Workers & Pages",
        to: "/",
    },
    {
        label: "cloudflare-dev-platform",
        to: "/about",
    }
    ]}
    tabs={[
        { label: "Overview", value: "overview" },
        { label: "Metrics", value: "metrics" },
        { label: "Deployments", value: "deployments" },
        { label: "Bindings", value: "bindings" },
        { label: "Observability", value: "observability" },
        { label: "Settings", value: "settings" },
    ]}
    defaultTab={'overview'}
    onValueChange={(v) => console.log(v)}
>
    <Button icon={<CodeIcon />} className="h-8">Edit code</Button>
    <Button icon={<GlobeIcon />} variant="primary" className="h-8">Visit</Button>
</PageHeader>`}
        >
          <PageHeader
              className="w-full"
              breadcrumbs={[
                {
                  icon: <HouseIcon />,
                  label: "Workers & Pages",
                  to: "/",
                },
                {
                  label: "cloudflare-dev-platform",
                  to: "/about",
                }
              ]}
              tabs={[
                { label: "Overview", value: "overview" },
                { label: "Metrics", value: "metrics" },
                { label: "Deployments", value: "deployments" },
                { label: "Bindings", value: "bindings" },
                { label: "Observability", value: "observability" },
                { label: "Settings", value: "settings" },
              ]}
              defaultTab={'overview'}
              onValueChange={(v) => console.log(v)}
            >
              <Button icon={<CodeIcon />} className="h-8">Edit code</Button>
              <Button icon={<GlobeIcon />} variant="primary" className="h-8">Visit</Button>
            </PageHeader>
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
          code={`import { PageHeader } from "~/blocks/page-header";`}
        />
      </ComponentSection>

      {/* Usage */}
      <ComponentSection>
        <h2 className="text-2xl font-bold mb-4">Usage</h2>
        <CodeBlock
          lang="tsx"
          code={`import { PageHeader } from "~/blocks/page-header";

export default function Example() {
  return (
    <PageHeader
      breadcrumbs={[
        { label: "Home", to: "/" },
        { label: "Projects", to: "/projects" },
        { label: "My Project" }
      ]}
      tabs={[
        { label: "Overview", href: "/projects/my-project" },
        { label: "Settings", href: "/projects/my-project/settings" }
      ]}
    />
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
            code={`<PageHeader
  breadcrumbs={[
    { label: "Home", to: "/" },
    { label: "Dashboard" }
  ]}
/>`}
          >
            <PageHeader
              breadcrumbs={[
                { label: "Home", to: "/" },
                { label: "Dashboard" }
              ]}
            />
          </ComponentExample>
        </div>

        {/* With Tabs */}
        <div className="mb-12">
          <h3 className="text-xl font-semibold mb-4">With Tabs</h3>
          <ComponentExample
            code={`<PageHeader
  breadcrumbs={[
    { label: "Home", to: "/" },
    { label: "Settings" }
  ]}
  tabs={[
    { label: "General", href: "/settings" },
    { label: "Security", href: "/settings/security" },
    { label: "Notifications", href: "/settings/notifications" }
  ]}
/>`}
          >
            <PageHeader
              breadcrumbs={[
                { label: "Home", to: "/" },
                { label: "Settings" }
              ]}
            //   tabs={[
            //     { label: "General", href: "/settings" },
            //     { label: "Security", href: "/settings/security" },
            //     { label: "Notifications", href: "/settings/notifications" }
            //   ]}
            />
          </ComponentExample>
        </div>

        {/* With Icons */}
        <div className="mb-12">
          <h3 className="text-xl font-semibold mb-4">With Icons</h3>
          <ComponentExample
            code={`<PageHeader
  breadcrumbs={[
    { label: "Home", to: "/", icon: <HouseIcon size={16} /> },
    { label: "Settings", icon: <GearIcon size={16} /> }
  ]}
  tabs={[
    { label: "General", href: "/settings" },
    { label: "Advanced", href: "/settings/advanced" }
  ]}
/>`}
          >
            <PageHeader
              breadcrumbs={[
                { label: "Home", to: "/", icon: <HouseIcon size={16} /> },
                { label: "Settings", icon: <GearIcon size={16} /> }
              ]}
            //   tabs={[
            //     { label: "General", href: "/settings" },
            //     { label: "Advanced", href: "/settings/advanced" }
            //   ]}
            />
          </ComponentExample>
        </div>

        {/* With Actions */}
        <div className="mb-12">
          <h3 className="text-xl font-semibold mb-4">With Actions</h3>
          <ComponentExample
            code={`<PageHeader
  breadcrumbs={[
    { label: "Home", to: "/" },
    { label: "Projects", to: "/projects" },
    { label: "My Project" }
  ]}
  tabs={[
    { label: "Overview", href: "/projects/my-project" },
    { label: "Settings", href: "/projects/my-project/settings" }
  ]}
>
  <Button variant="primary" size="base">
    Deploy
  </Button>
</PageHeader>`}
          >
            <PageHeader
              breadcrumbs={[
                { label: "Home", to: "/" },
                { label: "Projects", to: "/projects" },
                { label: "My Project" }
              ]}
            //   tabs={[
            //     { label: "Overview", href: "/projects/my-project" },
            //     { label: "Settings", href: "/projects/my-project/settings" }
            //   ]}
            >
              <Button variant="primary" size="base">
                Deploy
              </Button>
            </PageHeader>
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
                <td className="py-3 px-4 font-mono text-xs">breadcrumbs</td>
                <td className="py-3 px-4 font-mono text-xs">BreadcrumbItem[]</td>
                <td className="py-3 px-4 font-mono text-xs">required</td>
              </tr>
              <tr className="border-b border-neutral-200 dark:border-neutral-800">
                <td className="py-3 px-4 font-mono text-xs">tabs</td>
                <td className="py-3 px-4 font-mono text-xs">{'{ label: string; href: string }[]'}</td>
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
