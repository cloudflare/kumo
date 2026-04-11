import { SkeletonLine } from "@cloudflare/kumo";
import type { ReactNode } from "react";

export function SkeletonLineDemo() {
  return (
    <div className="flex w-64 flex-col gap-3">
      <SkeletonLine />
      <SkeletonLine />
      <SkeletonLine />
    </div>
  );
}

export function SkeletonLineWidthDemo() {
  return (
    <div className="flex w-64 flex-col gap-3">
      <SkeletonLine minWidth={80} maxWidth={100} />
      <SkeletonLine minWidth={60} maxWidth={80} />
      <SkeletonLine minWidth={40} maxWidth={60} />
    </div>
  );
}

export function SkeletonLineHeightDemo() {
  return (
    <div className="flex w-64 flex-col gap-3">
      <SkeletonLine className="h-2" />
      <SkeletonLine className="h-4" />
      <SkeletonLine className="h-6" />
      <SkeletonLine className="h-8" />
    </div>
  );
}

function DemoWrapper({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="relative">
      <div className="absolute top-0 bottom-0 right-full mr-2 border-r-2 border-kumo-fill flex items-center pr-2 text-sm">
        {label}
      </div>
      {children}
    </div>
  );
}

export function SkeletonLineBlockHeightDemo() {
  return (
    <div className="flex w-64 flex-col gap-1">
      <DemoWrapper label="32px">
        <SkeletonLine blockHeight={32} />
      </DemoWrapper>
      <DemoWrapper label="48px">
        <SkeletonLine blockHeight={48} />
      </DemoWrapper>
      <DemoWrapper label="64px">
        <SkeletonLine blockHeight={64} />
      </DemoWrapper>
    </div>
  );
}

export function SkeletonLineCardDemo() {
  return (
    <div className="w-64 rounded-lg p-4 ring ring-kumo-hairline">
      <div className="mb-4 h-4">
        <SkeletonLine minWidth={40} maxWidth={60} />
      </div>
      <div className="flex flex-col gap-2">
        <SkeletonLine />
        <SkeletonLine />
        <SkeletonLine minWidth={50} maxWidth={70} />
      </div>
    </div>
  );
}
