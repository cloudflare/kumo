import { useState } from "react";
import { DropdownMenu, Popover, Tag, Tooltip, TooltipProvider } from "@cloudflare/kumo";
import {
  GlobeSimpleIcon,
  StackIcon,
  ShieldCheckIcon,
  DiamondIcon,
  FunnelIcon,
  TrashIcon,
  ArrowSquareOutIcon,
} from "@phosphor-icons/react";

/** Basic static tags with text only. */
export function TagBasicDemo() {
  return (
    <div className="flex flex-wrap gap-2">
      <Tag>Personal Website</Tag>
      <Tag>devportal</Tag>
      <Tag>website-assets</Tag>
    </div>
  );
}

/** Tags with leading icons indicating resource type. */
export function TagWithIconDemo() {
  return (
    <div className="flex flex-wrap gap-2">
      <Tag icon={<GlobeSimpleIcon size={14} />}>Personal Website</Tag>
      <Tag icon={<DiamondIcon size={14} />}>devportal</Tag>
      <Tag icon={<StackIcon size={14} />}>website-assets</Tag>
      <Tag icon={<ShieldCheckIcon size={14} />}>security-routing</Tag>
    </div>
  );
}

/** Tags with a dismiss button that actually removes them. */
export function TagDismissibleDemo() {
  const [tags, setTags] = useState([
    { label: "Personal Website" },
    { label: "devportal" },
    { label: "website-assets", icon: true },
  ]);

  const remove = (label: string) => setTags((prev) => prev.filter((tag) => tag.label !== label));

  if (tags.length === 0) {
    return <p className="text-sm text-kumo-subtle">No tags!</p>;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((tag) => (
        <Tag
          key={tag.label}
          icon={tag.icon ? <StackIcon size={14} /> : undefined}
          onDismiss={() => remove(tag.label)}
        >
          {tag.label}
        </Tag>
      ))}
    </div>
  );
}

/** Tag composed with DropdownMenu and Tooltip. */
export function TagClickableDemo() {
  const [regionSelected, setRegionSelected] = useState(false);
  const [stagingVisible, setStagingVisible] = useState(true);

  return (
    <TooltipProvider>
      <div className="flex flex-wrap items-center gap-2">
        <DropdownMenu>
          <Tag.Root>
            <DropdownMenu.Trigger render={<Tag.Main>production</Tag.Main>} />
          </Tag.Root>
          <DropdownMenu.Content>
            <DropdownMenu.Item>
              <FunnelIcon size={14} />
              Filter by tag
            </DropdownMenu.Item>
            <DropdownMenu.Item>
              <ArrowSquareOutIcon size={14} />
              Go to tag overview
            </DropdownMenu.Item>
            <DropdownMenu.Separator />
            <DropdownMenu.Item className="text-kumo-danger">
              <TrashIcon size={14} />
              Remove tag
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu>
        <Tooltip content="Region: US East 1" asChild>
          <Tag
            icon={<GlobeSimpleIcon size={14} />}
            onClick={() => setRegionSelected((prev) => !prev)}
          >
            us-east-1
          </Tag>
        </Tooltip>
        {regionSelected && <span className="text-sm text-kumo-subtle">Region selected</span>}
        {stagingVisible ? (
          <Popover>
            <Tag.Root dismissible aria-label="staging tag">
              <Popover.Trigger asChild>
                <Tag.Main>staging</Tag.Main>
              </Popover.Trigger>
              <Tag.Dismiss
                dismissLabel="Dismiss staging"
                onClick={() => setStagingVisible(false)}
              />
            </Tag.Root>
            <Popover.Content>
              <Popover.Title>Tag details</Popover.Title>
              <Popover.Description>
                Status: staging. Use dismiss to remove this tag.
              </Popover.Description>
            </Popover.Content>
          </Popover>
        ) : (
          <span className="text-sm text-kumo-subtle">Staging dismissed</span>
        )}
      </div>
    </TooltipProvider>
  );
}

/** Tags with a key prefix. */
export function TagKeyDemo() {
  return (
    <div className="flex flex-wrap gap-2">
      <Tag tagKey="ENV">production</Tag>
      <Tag tagKey="REGION" icon={<GlobeSimpleIcon size={14} />}>
        us-east-1
      </Tag>
      <Tag tagKey="STATUS">active</Tag>
    </div>
  );
}

/** Tags with a split aside section. */
export function TagAsideDemo() {
  return (
    <div className="flex flex-wrap gap-2">
      <Tag icon={<DiamondIcon size={14} />} aside="999">
        production
      </Tag>
      <Tag
        tagKey="KEY"
        icon={<DiamondIcon size={14} />}
        aside={
          <>
            <DiamondIcon size={12} /> 999
          </>
        }
      >
        All tags
      </Tag>
    </div>
  );
}

/** Disabled tags. */
export function TagDisabledDemo() {
  return (
    <>
      <div className="flex flex-wrap gap-2">
        <Tag disabled>Locked</Tag>
        <Tag disabled>Cannot edit</Tag>
        <Tag disabled>Cannot remove</Tag>
      </div>
    </>
  );
}
