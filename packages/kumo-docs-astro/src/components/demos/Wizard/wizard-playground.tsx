import { Button, LayerCard, Switch, Tabs, Text } from "@cloudflare/kumo";
import type { WizardWidth } from "@cloudflare/kumo";
import { XIcon } from "@phosphor-icons/react";

export interface WizardDemoPlaygroundProps {
  width: WizardWidth;
  onWidthChange: (v: WizardWidth) => void;
  sidebar: boolean;
  onSidebarChange: (v: boolean) => void;
  wireframe: boolean;
  onWireframeChange: (v: boolean) => void;
  header: boolean;
  onHeaderChange: (v: boolean) => void;
  controlsOpen: boolean;
  onControlsOpenChange: (v: boolean) => void;
}

// Playground panel for the Wizard docs demo.
export function WizardDemoPlayground({
  width,
  onWidthChange,
  sidebar,
  onSidebarChange,
  wireframe,
  onWireframeChange,
  header,
  onHeaderChange,
  controlsOpen,
  onControlsOpenChange,
}: WizardDemoPlaygroundProps) {
  if (!controlsOpen) {
    return (
      <Button
        className="absolute bottom-4 start-4 z-10 hidden md:flex"
        onClick={() => onControlsOpenChange(true)}
        size="sm"
        variant="ghost"
      >
        Open playground
      </Button>
    );
  }

  return (
    <LayerCard className="absolute bottom-4 start-4 z-10 hidden w-56 md:block">
      <LayerCard.Secondary className="justify-between px-4 py-3">
        <Text size="sm" bold>
          Playground
        </Text>
        <Button
          aria-label="Close playground"
          icon={<XIcon weight="bold" />}
          onClick={() => onControlsOpenChange(false)}
          shape="square"
          size="sm"
          variant="ghost"
        />
      </LayerCard.Secondary>
      <LayerCard.Primary className="gap-0 px-0 py-1">
        <PlaygroundRow label="Header">
          <Switch
            aria-label="Header"
            size="sm"
            checked={header}
            onCheckedChange={onHeaderChange}
          />
        </PlaygroundRow>
        <PlaygroundRow label="Wireframe">
          <Switch
            aria-label="Wireframe"
            size="sm"
            checked={wireframe}
            onCheckedChange={onWireframeChange}
          />
        </PlaygroundRow>
        <PlaygroundRow label="Sidebar">
          <Switch
            aria-label="Sidebar"
            size="sm"
            checked={sidebar}
            onCheckedChange={onSidebarChange}
          />
        </PlaygroundRow>
        <PlaygroundRow label="Width">
          <Tabs
            className="w-max"
            onValueChange={(v) => onWidthChange(v as WizardWidth)}
            size="sm"
            tabs={[
              { value: "narrow", label: "Narrow" },
              { value: "wide", label: "Wide" },
            ]}
            value={width}
            variant="segmented"
          />
        </PlaygroundRow>
      </LayerCard.Primary>
    </LayerCard>
  );
}

function PlaygroundRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between px-4 py-2">
      <Text size="sm" bold>
        {label}
      </Text>
      {children}
    </div>
  );
}
