import { PageHeader } from "../kumo/page-header/page-header";
import { Breadcrumbs, Button } from "@cloudflare/kumo";
import {
  HouseIcon,
  GearIcon,
  CodeIcon,
  GlobeIcon,
  PlusIcon,
} from "@phosphor-icons/react";

// Full-featured hero demo matching original
export function PageHeaderHeroDemo() {
  return (
    <PageHeader
      className="w-full"
      breadcrumbs={
        <Breadcrumbs>
          <Breadcrumbs.Link icon={<HouseIcon size={16} />} href="#">
            Workers & Pages
          </Breadcrumbs.Link>
          <Breadcrumbs.Separator />
          <Breadcrumbs.Current>cloudflare-dev-platform</Breadcrumbs.Current>
        </Breadcrumbs>
      }
      tabs={[
        { label: "Overview", value: "overview" },
        { label: "Metrics", value: "metrics" },
        { label: "Deployments", value: "deployments" },
        { label: "Bindings", value: "bindings" },
        { label: "Observability", value: "observability" },
        { label: "Settings", value: "settings" },
      ]}
      defaultTab="overview"
      onValueChange={(v) => console.log(v)}
    >
      <Button icon={<CodeIcon />} className="h-8">
        Edit code
      </Button>
      <Button icon={<GlobeIcon />} variant="primary" className="h-8">
        Visit
      </Button>
    </PageHeader>
  );
}

// Basic breadcrumbs-only demo
export function PageHeaderBasicDemo() {
  return (
    <PageHeader
      breadcrumbs={
        <Breadcrumbs>
          <Breadcrumbs.Link href="#">Home</Breadcrumbs.Link>
          <Breadcrumbs.Separator />
          <Breadcrumbs.Current>Dashboard</Breadcrumbs.Current>
        </Breadcrumbs>
      }
    />
  );
}

// With icons in breadcrumbs
export function PageHeaderWithIconsDemo() {
  return (
    <PageHeader
      breadcrumbs={
        <Breadcrumbs>
          <Breadcrumbs.Link icon={<HouseIcon size={16} />} href="#">
            Home
          </Breadcrumbs.Link>
          <Breadcrumbs.Separator />
          <Breadcrumbs.Current icon={<GearIcon size={16} />}>
            Settings
          </Breadcrumbs.Current>
        </Breadcrumbs>
      }
    />
  );
}

// With tabs
export function PageHeaderWithTabsDemo() {
  return (
    <PageHeader
      breadcrumbs={
        <Breadcrumbs>
          <Breadcrumbs.Link href="#">Home</Breadcrumbs.Link>
          <Breadcrumbs.Separator />
          <Breadcrumbs.Current>Settings</Breadcrumbs.Current>
        </Breadcrumbs>
      }
      tabs={[
        { label: "General", value: "general" },
        { label: "Security", value: "security" },
        { label: "Notifications", value: "notifications" },
      ]}
      defaultTab="general"
    />
  );
}

// With actions
export function PageHeaderWithActionsDemo() {
  return (
    <PageHeader
      breadcrumbs={
        <Breadcrumbs>
          <Breadcrumbs.Link href="#">Home</Breadcrumbs.Link>
          <Breadcrumbs.Separator />
          <Breadcrumbs.Link href="#">Projects</Breadcrumbs.Link>
          <Breadcrumbs.Separator />
          <Breadcrumbs.Current>My Project</Breadcrumbs.Current>
        </Breadcrumbs>
      }
      tabs={[
        { label: "Overview", value: "overview" },
        { label: "Settings", value: "settings" },
      ]}
      defaultTab="overview"
    >
      <Button variant="primary" size="base">
        Deploy
      </Button>
    </PageHeader>
  );
}

// With title only
export function PageHeaderWithTitleDemo() {
  return (
    <PageHeader
      breadcrumbs={
        <Breadcrumbs>
          <Breadcrumbs.Link href="#">Home</Breadcrumbs.Link>
          <Breadcrumbs.Separator />
          <Breadcrumbs.Link href="#">Products</Breadcrumbs.Link>
          <Breadcrumbs.Separator />
          <Breadcrumbs.Current>Page title</Breadcrumbs.Current>
        </Breadcrumbs>
      }
      title="Page title"
    />
  );
}

// With title and description
export function PageHeaderWithTitleDescriptionDemo() {
  return (
    <PageHeader
      breadcrumbs={
        <Breadcrumbs>
          <Breadcrumbs.Link href="#">Home</Breadcrumbs.Link>
          <Breadcrumbs.Separator />
          <Breadcrumbs.Link href="#">Products</Breadcrumbs.Link>
          <Breadcrumbs.Separator />
          <Breadcrumbs.Current>Page title</Breadcrumbs.Current>
        </Breadcrumbs>
      }
      title="Page title"
      description="Action-led, value-oriented description of what this page does. Optional second sentence with use cases or prerequisites."
    />
  );
}

// Complete example with all features
export function PageHeaderCompleteDemo() {
  return (
    <PageHeader
      breadcrumbs={
        <Breadcrumbs>
          <Breadcrumbs.Link href="#">Home</Breadcrumbs.Link>
          <Breadcrumbs.Separator />
          <Breadcrumbs.Link href="#">Products</Breadcrumbs.Link>
          <Breadcrumbs.Separator />
          <Breadcrumbs.Current>Page title</Breadcrumbs.Current>
        </Breadcrumbs>
      }
      title="Page title"
      description="Action-led, value-oriented description of what this page does."
      tabs={[
        { label: "Overview", value: "overview" },
        { label: "Analytics", value: "analytics" },
        { label: "Settings", value: "settings" },
      ]}
      defaultTab="overview"
    >
      <Button variant="outline" size="sm">
        Export
      </Button>
      <Button variant="primary" size="sm" icon={<PlusIcon size={16} />}>
        New Item
      </Button>
    </PageHeader>
  );
}
