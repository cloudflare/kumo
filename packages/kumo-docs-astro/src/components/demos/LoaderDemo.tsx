import { Loader } from "@cloudflare/kumo";

export function LoaderBasicDemo() {
  return <Loader />;
}

export function LoaderSizesDemo() {
  return (
    <div className="flex items-center gap-4">
      <Loader size="sm" />
      <Loader size="base" />
      <Loader size="lg" />
    </div>
  );
}

export function LoaderCustomSizeDemo() {
  return <Loader size={24} />;
}
