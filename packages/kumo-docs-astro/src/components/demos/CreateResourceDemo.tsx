import { useState, useEffect } from "react";
import {
  CreateResource,
  CreateResourceStep,
  Breadcrumbs,
  Button,
  Input,
  Select,
  Combobox,
  ClipboardText,
  Text,
  Label,
  Grid,
  GridItem,
  Tooltip,
  Table,
  LayerCard,
  Radio,
  Link,
  DropdownMenu,
} from "@cloudflare/kumo";
import {
  SubwayIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  DotsThreeIcon,
} from "@phosphor-icons/react";
import { createPortal } from "react-dom";

// =============================================================================
// Hero Demo - Full tunnel creation wizard example
// =============================================================================

export function CreateResourceHeroDemo() {
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [tunnelName, setTunnelName] = useState("");
  const [selectedOS, setSelectedOS] = useState("macOS");
  const [selectedArch, setSelectedArch] = useState("arm64");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const sidebarWidth = 450;

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleClose = () => {
    setOpen(false);
    setIsSidebarOpen(false);
    // Reset state when closing
    setTimeout(() => {
      setStep(0);
      setTunnelName("");
      setSelectedOS("macOS");
      setSelectedArch("arm64");
    }, 300);
  };

  const handleAskAI = () => {
    setIsSidebarOpen(true);
  };

  const steps = [
    {
      key: "name",
      label: "Name your tunnel",
      content: (
        <CreateResourceStep
          title="Name your tunnel"
          description="Give your tunnel a name to identify it in your dashboard."
          footer={
            <>
              <div />
              <Button
                variant="primary"
                disabled={!tunnelName.trim()}
                onClick={() => setStep(1)}
              >
                Continue
              </Button>
            </>
          }
        >
          <Input
            label="Tunnel name"
            placeholder="my-tunnel"
            value={tunnelName}
            onChange={(e) => setTunnelName(e.target.value)}
          />
        </CreateResourceStep>
      ),
    },
    {
      key: "environment",
      label: "Configure",
      content: (
        <CreateResourceStep
          title="Select operating system"
          description="Choose your operating system and architecture."
          footer={
            <>
              <Button variant="ghost" onClick={() => setStep(0)}>
                Back
              </Button>
              <Button variant="primary" onClick={() => setStep(2)}>
                Continue
              </Button>
            </>
          }
        >
          <Grid variant="side-by-side" gap="sm">
            <GridItem>
              <Select
                label="Operating System"
                value={selectedOS}
                onValueChange={(value) => {
                  if (value) {
                    setSelectedOS(value);
                    if (value === "Windows") {
                      setSelectedArch("amd64");
                    } else {
                      setSelectedArch("arm64");
                    }
                  }
                }}
                items={{
                  macOS: "macOS",
                  Linux: "Linux",
                  Windows: "Windows",
                }}
                className="w-full"
              />
            </GridItem>
            <GridItem>
              <Select
                label="Architecture"
                value={selectedArch}
                onValueChange={(value) => {
                  if (value) {
                    setSelectedArch(value);
                  }
                }}
                items={{
                  arm64: "arm64",
                  amd64: "amd64",
                }}
                className="w-full"
              />
            </GridItem>
          </Grid>

          <div className="space-y-1.5">
            <div className="flex flex-col gap-1">
              <Label>Installation</Label>
              <Text variant="secondary" size="xs">
                Run this command to install the connector.
              </Text>
            </div>
            <ClipboardText text="curl -L https://pkg.cloudflare.com/install.sh | sudo bash" />
          </div>
        </CreateResourceStep>
      ),
    },
    {
      key: "review",
      label: "Review & create",
      content: (
        <CreateResourceStep
          title="Review your tunnel"
          description="Confirm the details below to create your tunnel."
          footer={
            <>
              <Button variant="ghost" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button variant="primary" onClick={handleClose}>
                Create tunnel
              </Button>
            </>
          }
        >
          <LayerCard>
            <LayerCard.Primary className="flex flex-col gap-3 bg-kumo-elevated">
              <div className="flex justify-between">
                <Text variant="secondary" size="sm">
                  Tunnel name
                </Text>
                <Text variant="secondary" size="sm">
                  {tunnelName || "—"}
                </Text>
              </div>
              <div className="flex justify-between">
                <Text variant="secondary" size="sm">
                  Operating System
                </Text>
                <Text variant="secondary" size="sm">
                  {selectedOS}
                </Text>
              </div>
              <div className="flex justify-between">
                <Text variant="secondary" size="sm">
                  Architecture
                </Text>
                <Text variant="secondary" size="sm">
                  {selectedArch}
                </Text>
              </div>
            </LayerCard.Primary>
          </LayerCard>
        </CreateResourceStep>
      ),
    },
  ];

  return (
    <>
      <Button variant="primary" onClick={() => setOpen(true)}>
        Create Tunnel
      </Button>
      {mounted &&
        open &&
        createPortal(
          <>
            <CreateResource
              breadcrumbs={
                <Breadcrumbs>
                  <Breadcrumbs.Link href="#">
                    <span className="flex items-center gap-1.5">
                      <SubwayIcon className="size-4" />
                      Tunnels
                    </span>
                  </Breadcrumbs.Link>
                  <Breadcrumbs.Separator />
                  <Breadcrumbs.Current>Create</Breadcrumbs.Current>
                </Breadcrumbs>
              }
              onClose={handleClose}
              onAskAI={handleAskAI}
              step={step}
              onStepChange={setStep}
              steps={steps}
              sidebarWidth={isSidebarOpen ? sidebarWidth : 0}
            />
            {/* Simulated AI Sidebar */}
            <div
              className={`fixed right-0 top-0 h-full border-l border-kumo-line bg-kumo-overlay transition-transform duration-300 ease-in-out z-[1150] flex flex-col ${
                isSidebarOpen ? "translate-x-0" : "translate-x-full"
              }`}
              style={{ width: sidebarWidth }}
            >
              <div className="flex h-[58px] items-center justify-between border-b border-kumo-line px-4">
                <Text variant="heading3">Ask AI</Text>
                <Button
                  variant="ghost"
                  shape="square"
                  className="h-8"
                  onClick={() => setIsSidebarOpen(false)}
                >
                  ✕
                </Button>
              </div>
              <div className="flex-1 p-4">
                <Text variant="secondary" size="sm">
                  This is a simulated AI sidebar. In your app, wire up the
                  onAskAI callback to open your actual AI assistant.
                </Text>
              </div>
            </div>
          </>,
          document.body,
        )}
    </>
  );
}

// =============================================================================
// Basic Demo - Minimal single-step wizard
// =============================================================================

export function CreateResourceBasicDemo() {
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const profileOptions = ["Profile A", "Profile B", "Profile C"];
  const [applianceType, setApplianceType] = useState("virtual");
  const [name, setName] = useState("");
  const [profile, setProfile] = useState("");
  const [physicalAppliances, setPhysicalAppliances] = useState([
    { id: 1, name: "", serialNumber: "", profile: "" },
  ]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const sidebarWidth = 450;

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleClose = () => {
    setOpen(false);
    setIsSidebarOpen(false);
    setTimeout(() => {
      setStep(0);
      setApplianceType("virtual");
      setName("");
      setProfile("");
      setPhysicalAppliances([
        { id: 1, name: "", serialNumber: "", profile: "" },
      ]);
    }, 300);
  };

  const handleAskAI = () => {
    setIsSidebarOpen(true);
  };

  const addPhysicalAppliance = () => {
    const newId = Math.max(...physicalAppliances.map((a) => a.id)) + 1;
    setPhysicalAppliances([
      ...physicalAppliances,
      { id: newId, name: "", serialNumber: "", profile: "" },
    ]);
  };

  const removePhysicalAppliance = (id: number) => {
    if (physicalAppliances.length > 1) {
      setPhysicalAppliances(
        physicalAppliances.filter((appliance) => appliance.id !== id),
      );
    }
  };

  const updatePhysicalAppliance = (
    id: number,
    field: string,
    value: string,
  ) => {
    setPhysicalAppliances(
      physicalAppliances.map((appliance) =>
        appliance.id === id ? { ...appliance, [field]: value } : appliance,
      ),
    );
  };

  const steps = [
    {
      key: "configure",
      label: "Configure",
      content: (
        <CreateResourceStep
          title="Create appliance"
          description="Configure your new appliance."
          footer={
            <>
              <div />
              <Button
                variant="primary"
                disabled={!name.trim()}
                onClick={handleClose}
              >
                Create
              </Button>
            </>
          }
        >
          <Radio.Group
            legend="Appliance type"
            appearance="card"
            orientation="horizontal"
            value={applianceType}
            onValueChange={setApplianceType}
            className="gap-2"
          >
            <Radio.Item label="Virtual appliance" value="virtual" />
            <Radio.Item label="Physical appliance" value="physical" />
          </Radio.Group>

          {applianceType === "virtual" ? (
            <div className="flex flex-col gap-4">
              <div className="relative flex items-center -mx-6 px-4">
                <div className="absolute inset-x-0 h-px bg-kumo-hairline" />
                <div className="relative bg-kumo-base px-2">
                  <Label className="text-xs">Virtual appliance details</Label>
                </div>
              </div>
              <Grid variant="side-by-side" gap="sm">
                <GridItem>
                  <Input
                    label="Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full"
                  />
                </GridItem>
                <GridItem>
                  <Combobox
                    label="Assign a profile"
                    value={profile || null}
                    onValueChange={(value) =>
                      setProfile((value as string) ?? "")
                    }
                    items={profileOptions}
                  >
                    <Combobox.TriggerInput
                      placeholder="Select a profile"
                      className="max-w-none"
                    />
                    <Combobox.Content>
                      <Combobox.List>
                        {(item) => (
                          <Combobox.Item value={item as string}>
                            {item as string}
                          </Combobox.Item>
                        )}
                      </Combobox.List>
                      <Combobox.Empty>No profiles found</Combobox.Empty>
                    </Combobox.Content>
                  </Combobox>
                </GridItem>
              </Grid>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <div className="relative flex items-center -mx-6 px-4">
                <div className="absolute inset-x-0 h-px bg-kumo-hairline" />
                <div className="relative bg-kumo-base px-2">
                  <Label className="text-xs">Physical appliance details</Label>
                </div>
              </div>
              <div className="flex flex-col gap-3">
                {physicalAppliances.map((appliance) => (
                  <div key={appliance.id} className="flex gap-2">
                    <Grid variant="3up" gap="sm" className="flex-1">
                      <GridItem>
                        <Input
                          label="Name"
                          value={appliance.name}
                          onChange={(e) =>
                            updatePhysicalAppliance(
                              appliance.id,
                              "name",
                              e.target.value,
                            )
                          }
                          className="w-full"
                        />
                      </GridItem>
                      <GridItem>
                        <Input
                          label="Serial number"
                          value={appliance.serialNumber}
                          onChange={(e) =>
                            updatePhysicalAppliance(
                              appliance.id,
                              "serialNumber",
                              e.target.value,
                            )
                          }
                          className="w-full"
                        />
                      </GridItem>
                      <GridItem>
                        <Combobox
                          label="Assign a profile"
                          value={appliance.profile || null}
                          onValueChange={(value) =>
                            updatePhysicalAppliance(
                              appliance.id,
                              "profile",
                              (value as string) ?? "",
                            )
                          }
                          items={profileOptions}
                        >
                          <Combobox.TriggerInput
                            placeholder="Select a profile"
                            className="max-w-none"
                          />
                          <Combobox.Content>
                            <Combobox.List>
                              {(item) => (
                                <Combobox.Item value={item as string}>
                                  {item as string}
                                </Combobox.Item>
                              )}
                            </Combobox.List>
                            <Combobox.Empty>No profiles found</Combobox.Empty>
                          </Combobox.Content>
                        </Combobox>
                      </GridItem>
                    </Grid>
                    <div className="flex items-end pb-1.5">
                      <Tooltip
                        content={
                          <span className="whitespace-nowrap">
                            You have to register at least one appliance
                          </span>
                        }
                        disabled={physicalAppliances.length > 1}
                      >
                        <Button
                          variant="ghost"
                          shape="square"
                          size="sm"
                          aria-label="Delete"
                          onClick={() => removePhysicalAppliance(appliance.id)}
                          disabled={physicalAppliances.length === 1}
                        >
                          <TrashIcon className="size-4" />
                        </Button>
                      </Tooltip>
                    </div>
                  </div>
                ))}
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={addPhysicalAppliance}
                  disabled={physicalAppliances.length >= 4}
                >
                  <PlusIcon className="size-4" />
                  Add an appliance
                </Button>
              </div>
            </div>
          )}
        </CreateResourceStep>
      ),
    },
  ];

  return (
    <>
      <Button variant="primary" onClick={() => setOpen(true)}>
        Create Resource
      </Button>
      {mounted &&
        open &&
        createPortal(
          <>
            <CreateResource
              breadcrumbs={
                <Breadcrumbs>
                  <Breadcrumbs.Link href="#">Home</Breadcrumbs.Link>
                  <Breadcrumbs.Separator />
                  <Breadcrumbs.Current>Create</Breadcrumbs.Current>
                </Breadcrumbs>
              }
              onClose={handleClose}
              onAskAI={handleAskAI}
              step={step}
              onStepChange={setStep}
              steps={steps}
              hideStepNavigation
              size="lg"
              sidebarWidth={isSidebarOpen ? sidebarWidth : 0}
            />
            {/* Simulated AI Sidebar */}
            <div
              className={`fixed right-0 top-0 h-full border-l border-kumo-line bg-kumo-overlay transition-transform duration-300 ease-in-out z-[1150] flex flex-col ${
                isSidebarOpen ? "translate-x-0" : "translate-x-full"
              }`}
              style={{ width: sidebarWidth }}
            >
              <div className="flex h-[58px] items-center justify-between border-b border-kumo-line px-4">
                <Text variant="heading3">Ask AI</Text>
                <Button
                  variant="ghost"
                  shape="square"
                  className="h-8"
                  onClick={() => setIsSidebarOpen(false)}
                >
                  ✕
                </Button>
              </div>
              <div className="flex-1 p-4">
                <Text variant="secondary" size="sm">
                  This is a simulated AI sidebar. In your app, wire up the
                  onAskAI callback to open your actual AI assistant.
                </Text>
              </div>
            </div>
          </>,
          document.body,
        )}
    </>
  );
}

// =============================================================================
// Nested Creation Demo - Creating a sub-resource within a creation flow
// =============================================================================

interface Application {
  id: string;
  name: string;
  category: string;
  type: "Custom" | "Managed";
}

interface CustomAppFormData {
  name: string;
  type: string;
  hostnames: string;
  ipSubnets: string;
  sourceSubnets: string;
}

export function CreateResourceNestedDemo() {
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [selectedApps, setSelectedApps] = useState<string[]>([]);
  const [breakoutPort, setBreakoutPort] = useState("port-1");
  const [searchQuery, setSearchQuery] = useState("");
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [editingAppId, setEditingAppId] = useState<string | null>(null);
  const [viewingManagedApp, setViewingManagedApp] = useState<Application | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const sidebarWidth = 450;

  // Temporary apps list that includes any custom apps added during this session
  const [applications, setApplications] = useState<Application[]>([
    { id: "app-1", name: "Salesforce", category: "CRM", type: "Custom" },
    {
      id: "app-2",
      name: "Microsoft 365",
      category: "Productivity",
      type: "Managed",
    },
    { id: "app-3", name: "Zoom", category: "Communication", type: "Managed" },
    { id: "app-4", name: "Slack", category: "Communication", type: "Managed" },
    { id: "app-5", name: "GitHub", category: "Development", type: "Managed" },
    { id: "app-6", name: "Dropbox", category: "Storage", type: "Managed" },
    {
      id: "app-7",
      name: "Google Workspace",
      category: "Productivity",
      type: "Managed",
    },
    {
      id: "app-8",
      name: "Jira",
      category: "Project Management",
      type: "Managed",
    },
    {
      id: "app-9",
      name: "Confluence",
      category: "Documentation",
      type: "Managed",
    },
    {
      id: "app-10",
      name: "Asana",
      category: "Project Management",
      type: "Managed",
    },
    { id: "app-11", name: "Notion", category: "Productivity", type: "Managed" },
    { id: "app-12", name: "Figma", category: "Design", type: "Managed" },
    {
      id: "app-13",
      name: "Adobe Creative Cloud",
      category: "Design",
      type: "Managed",
    },
    { id: "app-14", name: "Zendesk", category: "Support", type: "Managed" },
    { id: "app-15", name: "HubSpot", category: "CRM", type: "Managed" },
  ]);

  const [customApp, setCustomApp] = useState<CustomAppFormData>({
    name: "",
    type: "",
    hostnames: "",
    ipSubnets: "",
    sourceSubnets: "",
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleClose = () => {
    setOpen(false);
    setIsSidebarOpen(false);
    setTimeout(() => {
      setStep(0);
      setSelectedApps([]);
      setBreakoutPort("port-1");
      setShowCustomForm(false);
      setEditingAppId(null);
      setViewingManagedApp(null);
      setCustomApp({
        name: "",
        type: "",
        hostnames: "",
        ipSubnets: "",
        sourceSubnets: "",
      });
    }, 300);
  };

  const handleAskAI = () => {
    setIsSidebarOpen(true);
  };

  const filteredApplications = applications.filter((app) =>
    app.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const toggleApp = (appId: string) => {
    setSelectedApps((prev) =>
      prev.includes(appId)
        ? prev.filter((id) => id !== appId)
        : [...prev, appId],
    );
  };

  const toggleAll = () => {
    const allFilteredSelected =
      filteredApplications.length > 0 &&
      filteredApplications.every((app) => selectedApps.includes(app.id));
    if (allFilteredSelected) {
      setSelectedApps((prev) =>
        prev.filter((id) => !filteredApplications.some((app) => app.id === id)),
      );
    } else {
      const filteredIds = filteredApplications.map((app) => app.id);
      setSelectedApps((prev) => Array.from(new Set([...prev, ...filteredIds])));
    }
  };

  const handleEditApp = (app: Application) => {
    // Only allow editing custom apps
    if (app.type !== "Custom") return;

    setEditingAppId(app.id);
    setCustomApp({
      name: app.name,
      type: app.category,
      hostnames: "",
      ipSubnets: "",
      sourceSubnets: "",
    });
    setShowCustomForm(true);
  };

  const handleViewApp = (app: Application) => {
    // For managed apps, show read-only view
    setEditingAppId(null);
    setCustomApp({
      name: app.name,
      type: app.category,
      hostnames: "",
      ipSubnets: "",
      sourceSubnets: "",
    });
    setShowCustomForm(true);
    setViewingManagedApp(app);
  };

  const handleDeleteApp = (appId: string) => {
    setApplications((prev) => prev.filter((app) => app.id !== appId));
    setSelectedApps((prev) => prev.filter((id) => id !== appId));
  };

  const handleAddCustomApp = () => {
    if (!customApp.name.trim()) return;

    if (editingAppId) {
      // Update existing custom app
      setApplications((prev) =>
        prev.map((app) =>
          app.id === editingAppId
            ? { ...app, name: customApp.name, category: customApp.type || "Custom" }
            : app,
        ),
      );
      setEditingAppId(null);
    } else {
      // Create new custom app
      const tempId = `temp-custom-${Date.now()}`;
      const newApp: Application = {
        id: tempId,
        name: customApp.name,
        category: customApp.type || "Custom",
        type: "Custom",
      };

      setApplications((prev) => [newApp, ...prev]);
      setSelectedApps((prev) => [...prev, tempId]);
    }

    setCustomApp({
      name: "",
      type: "",
      hostnames: "",
      ipSubnets: "",
      sourceSubnets: "",
    });
    setShowCustomForm(false);
    setViewingManagedApp(null);
  };

  const steps = [
    {
      key: "assign",
      label: "Assign applications",
      content: (
        <CreateResourceStep
          title="Assign application breakout traffic"
          description="Select applications and configure the preferred breakout port."
          footer={
            showCustomForm ? (
              viewingManagedApp ? (
                <>
                  <div />
                  <Button
                    variant="primary"
                    onClick={() => {
                      setShowCustomForm(false);
                      setViewingManagedApp(null);
                    }}
                  >
                    Continue
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setShowCustomForm(false);
                      setEditingAppId(null);
                      setViewingManagedApp(null);
                    }}
                  >
                    Skip
                  </Button>
                  <Button
                    variant="primary"
                    onClick={handleAddCustomApp}
                    disabled={!customApp.name.trim()}
                  >
                    {editingAppId
                      ? "Save changes"
                      : "Confirm adding to application list"}
                  </Button>
                </>
              )
            ) : (
              <>
                <div />
                <Button
                  variant="primary"
                  onClick={() => setStep(1)}
                  disabled={selectedApps.length === 0}
                >
                  Continue{" "}
                  {selectedApps.length > 0 ? `(${selectedApps.length})` : ""}
                </Button>
              </>
            )
          }
        >
          {!showCustomForm ? (
            <div className="flex flex-col gap-3">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Input
                    placeholder="Search applications..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9"
                    size="sm"
                  />
                  <MagnifyingGlassIcon
                    size={16}
                    className="absolute left-2 top-1/2 -translate-y-1/2 text-kumo-subtle"
                  />
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setEditingAppId(null);
                    setViewingManagedApp(null);
                    setCustomApp({
                      name: "",
                      type: "",
                      hostnames: "",
                      ipSubnets: "",
                      sourceSubnets: "",
                    });
                    setShowCustomForm(true);
                  }}
                >
                  <PlusIcon className="size-4" />
                  Add a custom application
                </Button>
              </div>
              <LayerCard.Primary className="p-0">
                <div className="max-h-80 overflow-y-auto">
                  <Table>
                    <Table.Header variant="compact" sticky>
                      <Table.Row>
                        <Table.CheckHead
                          checked={
                            filteredApplications.length > 0 &&
                            filteredApplications.every((app) =>
                              selectedApps.includes(app.id),
                            )
                          }
                          indeterminate={
                            filteredApplications.some((app) =>
                              selectedApps.includes(app.id),
                            ) &&
                            !filteredApplications.every((app) =>
                              selectedApps.includes(app.id),
                            )
                          }
                          onValueChange={toggleAll}
                          label="Select all applications"
                        />
                        <Table.Head>Name</Table.Head>
                        <Table.Head>Category</Table.Head>
                        <Table.Head>Type</Table.Head>
                        <Table.Head />
                      </Table.Row>
                    </Table.Header>
                    <Table.Body>
                      {filteredApplications.map((app) => (
                        <Table.Row key={app.id}>
                          <Table.CheckCell
                            checked={selectedApps.includes(app.id)}
                            onValueChange={() => toggleApp(app.id)}
                            label={`Select ${app.name}`}
                          />
                          <Table.Cell>
                            <Link
                              variant="current"
                              onClick={() =>
                                app.type === "Custom"
                                  ? handleEditApp(app)
                                  : handleViewApp(app)
                              }
                            >
                              {app.name}
                            </Link>
                          </Table.Cell>
                          <Table.Cell>{app.category}</Table.Cell>
                          <Table.Cell>{app.type}</Table.Cell>
                          <Table.Cell>
                            <DropdownMenu>
                              <DropdownMenu.Trigger>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  shape="square"
                                  aria-label="Menu"
                                >
                                  <DotsThreeIcon size={16} weight="bold" />
                                </Button>
                              </DropdownMenu.Trigger>
                              <DropdownMenu.Content align="end">
                                {app.type === "Custom" ? (
                                  <>
                                    <DropdownMenu.Item
                                      onClick={() => handleEditApp(app)}
                                    >
                                      Edit
                                    </DropdownMenu.Item>
                                    <DropdownMenu.Item
                                      variant="danger"
                                      onClick={() => handleDeleteApp(app.id)}
                                    >
                                      Delete
                                    </DropdownMenu.Item>
                                  </>
                                ) : (
                                  <DropdownMenu.Item
                                    onClick={() => handleViewApp(app)}
                                  >
                                    View details
                                  </DropdownMenu.Item>
                                )}
                              </DropdownMenu.Content>
                            </DropdownMenu>
                          </Table.Cell>
                        </Table.Row>
                      ))}
                    </Table.Body>
                  </Table>
                </div>
              </LayerCard.Primary>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <div className="relative flex items-center -mx-6 px-4">
                <div className="absolute inset-x-0 h-px bg-kumo-hairline" />
                <div className="relative bg-kumo-base px-2">
                  <Label className="text-xs">
                    {viewingManagedApp
                      ? "View details"
                      : editingAppId
                        ? "Edit application"
                        : "Add a custom application"}
                  </Label>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Name"
                  placeholder="Display name for the app"
                  value={customApp.name}
                  onChange={(e) =>
                    setCustomApp((prev) => ({ ...prev, name: e.target.value }))
                  }
                  className="w-full"
                  disabled={!!viewingManagedApp}
                />
                <Input
                  label="Category"
                  placeholder="Category of the app"
                  value={customApp.type}
                  onChange={(e) =>
                    setCustomApp((prev) => ({ ...prev, type: e.target.value }))
                  }
                  className="w-full"
                  disabled={!!viewingManagedApp}
                />
              </div>
              {!viewingManagedApp && (
                <>
                  <Input
                    label="Hostnames (optional)"
                    placeholder="FQDNs to associate with traffic decisions"
                    value={customApp.hostnames}
                    onChange={(e) =>
                      setCustomApp((prev) => ({
                        ...prev,
                        hostnames: e.target.value,
                      }))
                    }
                    className="w-full"
                  />
                  <Input
                    label="IP Subnets (optional)"
                    placeholder="IPv4 CIDRs to associate with traffic decisions"
                    value={customApp.ipSubnets}
                    onChange={(e) =>
                      setCustomApp((prev) => ({
                        ...prev,
                        ipSubnets: e.target.value,
                      }))
                    }
                    className="w-full"
                  />
                  <Input
                    label="Source Subnets (optional)"
                    placeholder="IPv4 CIDRs to associate with traffic decisions"
                    value={customApp.sourceSubnets}
                    onChange={(e) =>
                      setCustomApp((prev) => ({
                        ...prev,
                        sourceSubnets: e.target.value,
                      }))
                    }
                    className="w-full"
                  />
                </>
              )}
            </div>
          )}
        </CreateResourceStep>
      ),
    },
    {
      key: "configure",
      label: "Configure port",
      content: (
        <CreateResourceStep
          title="Configure breakout port"
          description="Select the preferred breakout port for the selected applications."
          footer={
            <>
              <Button variant="ghost" onClick={() => setStep(0)}>
                Back
              </Button>
              <Button variant="primary" onClick={handleClose}>
                Assign
              </Button>
            </>
          }
        >
          <Select
            label="Select preferred breakout port"
            value={breakoutPort}
            onValueChange={(value) => value && setBreakoutPort(value)}
            items={{
              "port-1": "Port 1 - Primary",
              "port-2": "Port 2 - Secondary",
              "port-3": "Port 3 - Backup",
            }}
            className="w-full"
          />
        </CreateResourceStep>
      ),
    },
  ];

  return (
    <>
      <Button variant="primary" onClick={() => setOpen(true)}>
        Assign Breakout Traffic
      </Button>
      {mounted &&
        open &&
        createPortal(
          <>
            <CreateResource
              breadcrumbs={
                <Breadcrumbs>
                  <Breadcrumbs.Link href="#">Network</Breadcrumbs.Link>
                  <Breadcrumbs.Separator />
                  <Breadcrumbs.Current>Breakout Traffic</Breadcrumbs.Current>
                </Breadcrumbs>
              }
              onClose={handleClose}
              onAskAI={handleAskAI}
              step={step}
              onStepChange={setStep}
              steps={steps}
              sidebarWidth={isSidebarOpen ? sidebarWidth : 0}
            />
            {/* Simulated AI Sidebar */}
            <div
              className={`fixed right-0 top-0 h-full border-l border-kumo-line bg-kumo-overlay transition-transform duration-300 ease-in-out z-[1150] flex flex-col ${
                isSidebarOpen ? "translate-x-0" : "translate-x-full"
              }`}
              style={{ width: sidebarWidth }}
            >
              <div className="flex h-[58px] items-center justify-between border-b border-kumo-line px-4">
                <Text variant="heading3">Ask AI</Text>
                <Button
                  variant="ghost"
                  shape="square"
                  className="h-8"
                  onClick={() => setIsSidebarOpen(false)}
                >
                  ✕
                </Button>
              </div>
              <div className="flex-1 p-4">
                <Text variant="secondary" size="sm">
                  This is a simulated AI sidebar. In your app, wire up the
                  onAskAI callback to open your actual AI assistant.
                </Text>
              </div>
            </div>
          </>,
          document.body,
        )}
    </>
  );
}
