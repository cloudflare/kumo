import { Wizard } from "@cloudflare/kumo";
import { KumoMenuIcon } from "~/components/KumoMenuIcon";
import { ThemeToggle } from "~/components/ThemeToggle";

// Demo header for the Wizard playground. Recreates the docs header treatment from Header.astro/StickyDocHeader.tsx with Wizard.CloseButton as the final cell.
export function WizardDemoHeader() {
  return (
    <div className="flex h-12 border-b border-kumo-hairline bg-kumo-elevated">
      <div className="flex w-12 shrink-0 items-center justify-center border-r border-kumo-hairline">
        <KumoMenuIcon className="pointer-events-none cursor-default" />
      </div>
      <div className="flex items-center px-3">
        <span className="text-base font-medium">Kumo</span>
      </div>
      <div className="flex min-w-0 flex-1 items-center justify-end border-r border-kumo-hairline px-4">
        <a
          href="https://github.com/cloudflare/kumo"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden truncate font-mono text-sm text-kumo-subtle hover:text-kumo-default sm:inline"
        >
          @cloudflare/kumo
        </a>
      </div>
      <div className="flex w-12 shrink-0 items-center justify-center border-r border-kumo-hairline">
        <ThemeToggle />
      </div>
      <div className="flex w-12 shrink-0 items-center justify-center">
        <Wizard.CloseButton />
      </div>
    </div>
  );
}
