import React from "react";
import { cn } from "../utils";

interface DocLayoutProps {
  title: string;
  description: string;
  children: React.ReactNode;
  className?: string;
}

/**
 * Standard layout for component documentation pages
 */
export function DocLayout({ title, description, children, className }: DocLayoutProps) {
  return (
    <div className={cn("min-h-screen flex flex-col", className)}>
      {/* Header */}
      <header className="border-b border-neutral-200 dark:border-neutral-800 pr-12 sticky top-0 z-10 bg-surface-secondary">
        <div className="flex items-center border-r border-neutral-200 dark:border-neutral-800 h-12 px-4 mx-auto">
          <p className="font-mono ml-auto text-base text-neutral-500">
            @cloudflare/kumo
          </p>
        </div>
      </header>

      {/* Page Header */}
      <div className="border-b border-neutral-200 dark:border-neutral-800 pr-12 bg-surface-secondary">
        <div className="border-r border-neutral-200 dark:border-neutral-800 mx-auto">
          <div className="max-w-5xl mx-auto px-8 py-12">
            <h1 className="text-4xl font-bold mb-3 text-surface">{title}</h1>
            <p className="text-lg text-neutral-600 dark:text-neutral-400">{description}</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="pr-12 grow flex flex-col">
        <div className="border-r border-neutral-200 dark:border-neutral-800 grow mx-auto w-full">
          <div className="max-w-5xl mx-auto px-8 py-12">
            <div className="prose prose-neutral dark:prose-invert max-w-none">
              {children}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
