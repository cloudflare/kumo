import { useState } from "react";
import {
  CloudflareLogo,
  PoweredByCloudflare,
  DropdownMenu,
  generateCloudflareLogoSvg,
} from "@cloudflare/kumo";
import {
  CloudIcon,
  CodeIcon,
  DownloadSimpleIcon,
  ArrowSquareOutIcon,
} from "@phosphor-icons/react";

export function CloudflareLogoBasicDemo() {
  return <CloudflareLogo className="w-72" />;
}

export function CloudflareLogoGlyphDemo() {
  return <CloudflareLogo variant="glyph" className="w-24" />;
}

export function CloudflareLogoColorVariantsDemo() {
  return (
    <div className="flex flex-wrap items-center gap-8">
      <CloudflareLogo className="w-28" color="color" />
      <div className="rounded-lg bg-white p-4">
        <CloudflareLogo className="w-28" color="black" />
      </div>
      <div className="rounded-lg bg-black p-4">
        <CloudflareLogo className="w-28" color="white" />
      </div>
    </div>
  );
}

export function CloudflareLogoGlyphVariantsDemo() {
  return (
    <div className="flex flex-wrap items-center gap-8">
      <CloudflareLogo variant="glyph" className="w-12" color="color" />
      <div className="rounded-lg bg-white p-4">
        <CloudflareLogo variant="glyph" className="w-12" color="black" />
      </div>
      <div className="rounded-lg bg-black p-4">
        <CloudflareLogo variant="glyph" className="w-12" color="white" />
      </div>
    </div>
  );
}

export function CloudflareLogoSizesDemo() {
  return (
    <div className="flex flex-wrap items-end gap-6">
      <CloudflareLogo className="w-20" />
      <CloudflareLogo className="w-28" />
      <CloudflareLogo className="w-44" />
    </div>
  );
}

export function CloudflareLogoCopyDemo() {
  const [copied, setCopied] = useState<string | null>(null);

  const copyToClipboard = async (text: string, label: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="flex items-center gap-4">
      <DropdownMenu>
        <DropdownMenu.Trigger>
          <button
            type="button"
            className="flex items-center gap-2 rounded-lg bg-black px-4 py-3 text-white transition-opacity hover:opacity-80"
          >
            <CloudflareLogo variant="glyph" color="white" className="w-8" />
            <span className="font-medium">Logo</span>
          </button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Content>
          <DropdownMenu.Item
            icon={CloudIcon}
            onSelect={() =>
              copyToClipboard(
                generateCloudflareLogoSvg({ variant: "glyph" }),
                "glyph",
              )
            }
          >
            {copied === "glyph" ? "Copied!" : "Copy logo as SVG"}
          </DropdownMenu.Item>
          <DropdownMenu.Item
            icon={CodeIcon}
            onSelect={() =>
              copyToClipboard(
                generateCloudflareLogoSvg({ variant: "full" }),
                "full",
              )
            }
          >
            {copied === "full" ? "Copied!" : "Copy full logo as SVG"}
          </DropdownMenu.Item>
          <DropdownMenu.Item
            icon={DownloadSimpleIcon}
            onSelect={() =>
              window.open(
                "https://www.cloudflare.com/press-kit/",
                "_blank",
                "noopener",
              )
            }
          >
            Download brand assets
          </DropdownMenu.Item>
          <DropdownMenu.Separator />
          <DropdownMenu.Item
            icon={ArrowSquareOutIcon}
            onSelect={() =>
              window.open(
                "https://www.cloudflare.com/brand-assets/",
                "_blank",
                "noopener",
              )
            }
          >
            Visit brand guidelines
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu>

      <span className="text-sm text-kumo-subtle">
        Click to open the brand assets menu
      </span>
    </div>
  );
}

// =============================================================================
// PoweredByCloudflare Demos
// =============================================================================

export function PoweredByCloudflareBasicDemo() {
  return <PoweredByCloudflare />;
}

export function PoweredByCloudflareVariantsDemo() {
  return (
    <div className="flex flex-wrap items-center gap-4">
      <PoweredByCloudflare />
      <PoweredByCloudflare color="black" />
      <div className="rounded-lg bg-black p-3">
        <PoweredByCloudflare color="white" />
      </div>
    </div>
  );
}

export function PoweredByCloudflareFooterDemo() {
  return (
    <footer className="flex w-full items-center justify-between rounded-lg border border-kumo-line bg-kumo-elevated px-6 py-4">
      <span className="text-sm text-kumo-subtle">
        &copy; 2026 Your Company. All rights reserved.
      </span>
      <PoweredByCloudflare />
    </footer>
  );
}
