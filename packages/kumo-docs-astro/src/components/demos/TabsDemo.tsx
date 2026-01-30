import { useState } from "react";
import { Tabs } from "@cloudflare/kumo";

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
    <Tabs
      tabs={[
        { value: "overview", label: "Overview" },
        { value: "analytics", label: "Analytics" },
        { value: "reports", label: "Reports" },
        { value: "notifications", label: "Notifications" },
        { value: "settings", label: "Settings" },
        { value: "billing", label: "Billing" },
      ]}
      selectedValue="overview"
    />
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
          render: (props) => <a {...props} href="#tab2" />,
        },
        {
          value: "tab3",
          label: "Another Link",
          render: (props) => <a {...props} href="#tab3" />,
        },
      ]}
      selectedValue="tab1"
    />
  );
}
