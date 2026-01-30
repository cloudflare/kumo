import { SkeletonLine } from "@cloudflare/kumo";

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

export function SkeletonLineCardDemo() {
  return (
    <div className="w-64 rounded-lg p-4 ring ring-kumo-line">
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
