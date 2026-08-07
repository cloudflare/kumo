import { useState } from "react";
import { Tabs } from "@cloudflare/kumo";

const productionLikeTabs = [
  { value: "overview", label: "Overview" },
  { value: "metrics", label: "Metrics" },
  { value: "deployments", label: "Deployments" },
  { value: "observability", label: "Observability" },
  { value: "domains", label: "Domains" },
  { value: "access", label: "Access" },
  { value: "settings", label: "Settings" },
];

const productionLikeExtraTabs = [
  { value: "analytics", label: "Analytics" },
  { value: "logs", label: "Logs" },
  { value: "security", label: "Security" },
];

export function TabsDefaultDemo() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="mb-2 text-sm text-kumo-subtle">Segmented (default)</p>
        <Tabs
          variant="segmented"
          tabs={[
            { value: "tab1", label: "Tab 1" },
            { value: "tab2", label: "Tab 2" },
            { value: "tab3", label: "Tab 3" },
          ]}
          selectedValue="tab1"
        />
      </div>
      <div>
        <p className="mb-2 text-sm text-kumo-subtle">Underline</p>
        <Tabs
          variant="underline"
          tabs={[
            { value: "tab1", label: "Tab 1" },
            { value: "tab2", label: "Tab 2" },
            { value: "tab3", label: "Tab 3" },
          ]}
          selectedValue="tab1"
        />
      </div>
    </div>
  );
}

export function TabsSegmentedDemo() {
  return (
    <Tabs
      variant="segmented"
      tabs={[
        { value: "tab1", label: "Tab 1" },
        { value: "tab2", label: "Tab 2" },
        { value: "tab3", label: "Tab 3" },
      ]}
      selectedValue="tab1"
    />
  );
}

export function TabsUnderlineDemo() {
  return (
    <Tabs
      variant="underline"
      tabs={[
        { value: "tab1", label: "Tab 1" },
        { value: "tab2", label: "Tab 2" },
        { value: "tab3", label: "Tab 3" },
      ]}
      selectedValue="tab1"
    />
  );
}

export function TabsControlledDemo() {
  const [activeTab, setActiveTab] = useState("tab1");

  return (
    <div className="space-y-4">
      <Tabs
        tabs={[
          { value: "tab1", label: "Tab 1" },
          { value: "tab2", label: "Tab 2" },
          { value: "tab3", label: "Tab 3" },
        ]}
        value={activeTab}
        onValueChange={setActiveTab}
      />
      <p className="text-sm text-kumo-subtle">
        Active tab: <code className="text-sm">{activeTab}</code>
      </p>
    </div>
  );
}

export function TabsManyDemo() {
  return (
    <div className="w-full max-w-md">
      <Tabs
        tabs={[
          { value: "overview", label: "Overview" },
          { value: "analytics", label: "Analytics" },
          { value: "reports", label: "Reports" },
          { value: "notifications", label: "Notifications" },
          { value: "settings", label: "Settings" },
          { value: "billing", label: "Billing" },
          { value: "security", label: "Security" },
          { value: "integrations", label: "Integrations" },
        ]}
        selectedValue="overview"
      />
    </div>
  );
}

export function TabsOverflowDemo() {
  return (
    <div className="w-full max-w-xs">
      <Tabs
        tabs={[
          { value: "overview", label: "Overview" },
          { value: "analytics", label: "Analytics" },
          { value: "reports", label: "Reports" },
          { value: "notifications", label: "Notifications" },
          { value: "settings", label: "Settings" },
          { value: "billing", label: "Billing" },
          { value: "security", label: "Security" },
          { value: "integrations", label: "Integrations" },
        ]}
        selectedValue="overview"
      />
    </div>
  );
}

export function TabsDynamicCountDemo() {
  const [showExtraTabs, setShowExtraTabs] = useState(true);
  const tabs = showExtraTabs
    ? [...productionLikeTabs, ...productionLikeExtraTabs]
    : productionLikeTabs;

  return (
    <div className="space-y-3">
      <div className="w-full max-w-[588px]">
        <Tabs tabs={tabs} selectedValue="settings" />
      </div>
      <div className="flex items-center gap-3 text-sm text-kumo-subtle">
        <button
          type="button"
          className="rounded-md border border-kumo-line bg-kumo-base px-2.5 py-1 text-kumo-default hover:bg-kumo-tint focus:ring-2 focus:ring-kumo-brand focus:outline-none"
          onClick={() => setShowExtraTabs((current) => !current)}
        >
          Toggle extra tabs
        </button>
        <span>{showExtraTabs ? "10 tabs" : "7 tabs"}</span>
      </div>
    </div>
  );
}

export function TabsSmDemo() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="mb-2 text-sm text-kumo-subtle">Segmented sm</p>
        <Tabs
          variant="segmented"
          size="sm"
          tabs={[
            { value: "tab1", label: "Tab 1" },
            { value: "tab2", label: "Tab 2" },
            { value: "tab3", label: "Tab 3" },
          ]}
          selectedValue="tab1"
        />
      </div>
      <div>
        <p className="mb-2 text-sm text-kumo-subtle">Underline sm</p>
        <Tabs
          variant="underline"
          size="sm"
          tabs={[
            { value: "tab1", label: "Tab 1" },
            { value: "tab2", label: "Tab 2" },
            { value: "tab3", label: "Tab 3" },
          ]}
          selectedValue="tab1"
        />
      </div>
    </div>
  );
}

export function TabsRenderPropDemo() {
  return (
    <Tabs
      tabs={[
        {
          value: "tab1",
          label: "Regular Tab",
        },
        {
          value: "tab2",
          label: "Link Tab",
          nativeButton: false,
          render: (props) => <a {...props} href="#tab2" />,
        },
        {
          value: "tab3",
          label: "Cloudflare",
          nativeButton: false,
          render: (props) => (
            <a {...props} href="https://cloudflare.com" target="_blank" />
          ),
        },
      ]}
      selectedValue="tab1"
    />
  );
}
