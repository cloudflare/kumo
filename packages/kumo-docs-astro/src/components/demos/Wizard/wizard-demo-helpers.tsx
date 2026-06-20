import type { ComponentType } from "react";
import { Text } from "@cloudflare/kumo";
import {
  GlobeSimpleIcon,
  CompassIcon,
  FolderOpenIcon,
  GithubLogoIcon,
  GitlabLogoSimpleIcon,
  ArrowRightIcon,
  DatabaseIcon,
  ChatsCircleIcon,
  BrainIcon,
  SquareSplitHorizontalIcon,
  PlanetIcon,
  LightningIcon,
  GitForkIcon,
  IslandIcon,
  FadersIcon,
} from "@phosphor-icons/react";
import type { IconProps } from "@phosphor-icons/react";

export const CREATION_METHODS = [
  {
    title: "Connect GitHub",
    icon: GithubLogoIcon,
    iconClassName: "text-kumo-default",
    dashed: false,
  },
  {
    title: "Connect GitLab",
    icon: GitlabLogoSimpleIcon,
    iconClassName: "text-kumo-brand",
    dashed: false,
  },
  {
    title: "Start with Hello World!",
    icon: GlobeSimpleIcon,
    iconClassName: "text-kumo-success",
    dashed: false,
  },
  {
    title: "Select a template",
    icon: CompassIcon,
    iconClassName: "text-kumo-info",
    dashed: false,
  },
  {
    title: "Upload your static files",
    icon: FolderOpenIcon,
    iconClassName: "text-kumo-warning",
    dashed: true,
  },
] as const;

export function CreationMethodCard({
  title,
  icon: Icon,
  iconClassName,
  dashed = false,
  onClick,
}: {
  title: string;
  icon: ComponentType<IconProps>;
  iconClassName: string;
  dashed?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group relative flex h-14 w-full cursor-pointer items-center gap-3 rounded-[10px] bg-kumo-base px-3.5 text-left shadow-xs ring-1 ring-kumo-line outline-none transition-colors hover:bg-kumo-elevated"
    >
      {dashed && (
        <div className="pointer-events-none absolute inset-1 rounded-md border border-dashed border-kumo-hairline opacity-0 transition-all duration-[250ms] group-hover:opacity-100 group-focus-visible:opacity-100" />
      )}
      <div className="flex size-[30px] shrink-0 items-center justify-center rounded-md bg-kumo-base ring-1 ring-kumo-line transition-all">
        <Icon size={16} weight="duotone" className={iconClassName} />
      </div>
      <div className="min-w-0 flex-1">
        <Text>{title}</Text>
      </div>
      <ArrowRightIcon
        size={16}
        className="text-kumo-subtle opacity-0 -translate-x-2 transition-all duration-100 group-hover:opacity-100 group-hover:translate-x-0"
      />
    </button>
  );
}

// Template cards matching dash TemplateLinkThumb layout

export interface DemoTemplate {
  name: string;
  alias: string;
  description: string;
  icon: ComponentType<IconProps>;
  iconClassName: string;
}

// Real templates from the cloudflare/templates catalog (github.com/cloudflare/templates). Names and descriptions sourced from each template's package.json `cloudflare.label` and `description` fields.
export const DEMO_TEMPLATES: DemoTemplate[] = [
  // Framework starters first
  {
    name: "Vinext",
    alias: "vinext-template",
    description: "Slop fork drop-in replacement for Next.js",
    icon: GitForkIcon,
    iconClassName: "text-kumo-info",
  },
  {
    name: "Astro",
    alias: "astro-template",
    description: "Build a personal website or blog with Astro",
    icon: PlanetIcon,
    iconClassName: "text-kumo-success",
  },
  {
    name: "Vite",
    alias: "vite-template",
    description:
      "A template for building a React application with Vite and Hono",
    icon: LightningIcon,
    iconClassName: "text-kumo-badge-purple",
  },
  {
    name: "TanStack Start",
    alias: "tanstack-start-template",
    description:
      "Full-stack framwork powered by TanStack Router and Vite for React",
    icon: IslandIcon,
    iconClassName: "text-kumo-danger",
  },
  {
    name: "Remix",
    alias: "remix-template",
    description: "Full-stack framework built on web standards",
    icon: FadersIcon,
    iconClassName: "text-kumo-info",
  },
  {
    name: "Worker + D1 Database",
    alias: "d1-template",
    description: "Cloudflare's native serverless SQL database",
    icon: DatabaseIcon,
    iconClassName: "text-kumo-success",
  },
  {
    name: "Durable Chat App",
    alias: "durable-chat-template",
    description:
      "Chat with other users in real-time using Durable Objects and PartyKit",
    icon: ChatsCircleIcon,
    iconClassName: "text-kumo-danger",
  },
  {
    name: "LLM Chat App",
    alias: "llm-chat-app-template",
    description: "A simple chat application powered by Cloudflare Workers AI",
    icon: BrainIcon,
    iconClassName: "text-kumo-warning",
  },
  {
    name: "Create Microfrontend",
    alias: "microfrontend-template",
    description: "Build a vertical micro-frontend under a single domain",
    icon: SquareSplitHorizontalIcon,
    iconClassName: "text-kumo-info",
  },
];

export function TemplateCard({
  template,
  onClick,
}: {
  template: DemoTemplate;
  onClick: () => void;
}) {
  const Icon = template.icon;

  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex w-full cursor-pointer items-center gap-3.5 rounded-[10px] bg-kumo-base p-3.5 text-left shadow-xs outline-none ring-1 ring-kumo-line transition-colors hover:bg-kumo-elevated"
    >
      <div className="flex size-[34px] shrink-0 items-center justify-center rounded-md bg-kumo-base ring-1 ring-kumo-line">
        <Icon size={20} weight="duotone" className={template.iconClassName} />
      </div>
      <div className="min-w-0 flex-1 gap-0.5 flex flex-col">
        <Text size="sm" bold DANGEROUS_className="truncate">
          {template.name}
        </Text>
        <Text size="xs" variant="secondary" DANGEROUS_className="line-clamp-1">
          {template.description}
        </Text>
      </div>
      <ArrowRightIcon
        size={16}
        className="shrink-0 text-kumo-subtle opacity-0 -translate-x-2 transition-all duration-100 group-hover:opacity-100 group-hover:translate-x-0"
      />
    </button>
  );
}

export const HELLO_WORLD_CODE = `/**
 * Welcome to Cloudflare Workers! This is your first worker.
 * - Run "npm run dev" and open http://localhost:8787/ to see your worker in action
 * - Run "npm run deploy" to publish your worker
 */

export default {
  async fetch(request, env, ctx) {
    console.info({ message: 'Hello World Worker received a request!' });
    return new Response('Hello World!');
  },
};`;
