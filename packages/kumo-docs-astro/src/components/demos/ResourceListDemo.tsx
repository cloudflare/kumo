import { Surface, Code } from "@cloudflare/kumo";
import { DatabaseIcon } from "@phosphor-icons/react";

// Note: In a real project, ResourceListPage would be installed via CLI
// npx @cloudflare/kumo add ResourceListPage
// For this demo, we're using a simplified inline version

interface ResourceListPageProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  usage?: React.ReactNode;
  additionalContent?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

function ResourceListPage({
  title,
  description,
  icon,
  usage,
  additionalContent,
  children,
  className,
}: ResourceListPageProps) {
  return (
    <div
      className={`min-h-[400px] w-full bg-kumo-overlay ${className || ""}`}
    >
      <div className="mx-auto flex max-w-[1400px] flex-col p-6 md:gap-4 md:p-8">
        <div className="flex flex-col">
          <div className="mb-1.5 flex items-center gap-1.5">
            {icon}
            <h1 className="font-heading m-0 p-0 text-3xl font-semibold">
              {title}
            </h1>
          </div>
          <p className="hidden p-0 text-lg leading-normal text-pretty text-kumo-strong md:block">
            {description}
          </p>
        </div>

        <div className="flex flex-col-reverse gap-6 xl:flex-row xl:gap-8">
          <div className="min-w-0 grow">{children}</div>

          {(usage || additionalContent) && (
            <div className="top-22 flex h-fit w-full shrink-0 flex-col gap-4 xl:sticky xl:w-[380px]">
              {usage}
              {additionalContent && (
                <div className={usage ? "mt-6" : ""}>{additionalContent}</div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function ResourceListBasicDemo() {
  return (
    <ResourceListPage
      title="Databases"
      description="Manage your database instances and configurations"
      icon={<DatabaseIcon size={32} className="text-kumo-strong" />}
    >
      <Surface className="p-6">
        <p>Main content area - your resource list would go here</p>
      </Surface>
    </ResourceListPage>
  );
}

export function ResourceListWithUsageDemo() {
  return (
    <ResourceListPage
      title="API Keys"
      description="Create and manage API keys for your applications"
      usage={
        <Surface className="p-4">
          <h3 className="mb-2 font-semibold">Quick Start</h3>
          <p className="mb-3 text-sm text-kumo-strong">
            Generate an API key to authenticate your requests
          </p>
          <Code
            lang="bash"
            code='curl -H "Authorization: Bearer YOUR_API_KEY" https://api.example.com'
          />
        </Surface>
      }
    >
      <Surface className="p-6">
        <p>API keys list would appear here</p>
      </Surface>
    </ResourceListPage>
  );
}

export function ResourceListCompleteDemo() {
  return (
    <ResourceListPage
      title="KV Namespaces"
      description="Store key-value data globally with low-latency access"
      icon={<DatabaseIcon size={32} className="text-kumo-strong" />}
      usage={
        <Surface className="p-4">
          <h3 className="mb-2 font-semibold">Usage Example</h3>
          <Code
            lang="ts"
            code={`// Read from KV
const value = await KV.get('key');

// Write to KV
await KV.put('key', 'value');`}
          />
        </Surface>
      }
      additionalContent={
        <Surface className="p-4">
          <h3 className="mb-2 font-semibold">Learn More</h3>
          <p className="text-sm text-kumo-strong">
            Check out our documentation to learn more about KV storage.
          </p>
        </Surface>
      }
    >
      <div className="space-y-4">
        <Surface className="p-6">
          <h4 className="mb-2 font-semibold">production-kv</h4>
          <p className="text-sm text-kumo-strong">Created 2 days ago</p>
        </Surface>
        <Surface className="p-6">
          <h4 className="mb-2 font-semibold">staging-kv</h4>
          <p className="text-sm text-kumo-strong">Created 1 week ago</p>
        </Surface>
      </div>
    </ResourceListPage>
  );
}
