import { PackageIcon } from "@phosphor-icons/react";
import { Empty } from "~/blocks/empty";

export default function Installation() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-neutral-200 dark:border-neutral-800 pr-12 sticky top-0 z-10 bg-surface-secondary">
        <div className="flex items-center border-r border-neutral-200 dark:border-neutral-800 h-12 px-4 mx-auto">
          <p className="font-mono ml-auto text-base text-neutral-500">
            @cloudflare/kumo
          </p>
        </div>
      </header>

      {/* Content */}
      <main className="pr-12 grow flex flex-col">
        <div className="border-r border-neutral-200 dark:border-neutral-800 grow mx-auto w-full flex items-center justify-center">
          <div className="p-8">
            <Empty
              icon={<PackageIcon size={48} className="text-neutral-400" />}
              title="Installation Guide Coming Soon"
              description="We're working on comprehensive installation instructions for Kumo. Check back soon for step-by-step guides on getting started with the component library."
              commandLine="npm install @cloudflare/kumo"
            />
          </div>
        </div>
      </main>
    </div>
  );
}
