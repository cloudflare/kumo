import { Empty, Button } from "@cloudflare/kumo";
import {
  Database,
  FolderOpen,
  CloudSlash,
  PackageIcon,
  CodeIcon,
  GlobeIcon,
} from "@phosphor-icons/react";

export function EmptyDemo() {
  return (
    <Empty
      icon={<PackageIcon size={48} />}
      title="No packages found"
      description="Get started by installing your first package."
      commandLine="npm install @cloudflare/kumo"
      contents={
        <div className="flex items-center gap-2">
          <Button icon={<CodeIcon />}>See examples</Button>
          <Button icon={<GlobeIcon />} variant="primary">
            View documentation
          </Button>
        </div>
      }
    />
  );
}

export function EmptySizesDemo() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <p className="mb-2 text-sm text-kumo-subtle">Small</p>
        <Empty
          size="sm"
          icon={<Database size={32} className="text-kumo-inactive" />}
          title="No data available"
          description="There is no data to display."
        />
      </div>
      <div>
        <p className="mb-2 text-sm text-kumo-subtle">Base</p>
        <Empty
          size="base"
          icon={<Database size={48} className="text-kumo-inactive" />}
          title="No data available"
          description="There is no data to display."
        />
      </div>
      <div>
        <p className="mb-2 text-sm text-kumo-subtle">Large</p>
        <Empty
          size="lg"
          icon={<Database size={64} className="text-kumo-inactive" />}
          title="No data available"
          description="There is no data to display."
        />
      </div>
    </div>
  );
}

export function EmptyWithCommandDemo() {
  return (
    <Empty
      icon={<FolderOpen size={48} className="text-kumo-inactive" />}
      title="No projects found"
      description="Get started by creating your first project using the command below."
      commandLine="npm create kumo-project"
    />
  );
}

export function EmptyWithActionsDemo() {
  return (
    <Empty
      icon={<CloudSlash size={48} className="text-kumo-inactive" />}
      title="No connection"
      description="Unable to connect to the server. Please check your connection and try again."
      contents={
        <div className="flex gap-2">
          <Button variant="primary">Retry</Button>
          <Button variant="secondary">Go Back</Button>
        </div>
      }
    />
  );
}

export function EmptyMinimalDemo() {
  return <Empty title="Nothing here" />;
}

export function EmptyBasicDemo() {
  return (
    <Empty
      title="No results found"
      description="Try adjusting your search or filter to find what you're looking for."
    />
  );
}
