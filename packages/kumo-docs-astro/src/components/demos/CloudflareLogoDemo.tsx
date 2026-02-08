import { useState } from "react";
import {
  CloudflareLogo,
  PoweredByCloudflare,
  DropdownMenu,
  CLOUDFLARE_ORANGE,
  CLOUDFLARE_YELLOW,
  CLOUDFLARE_TEXT_GRAY,
  CLOUDFLARE_GLYPH_ORANGE_PATH,
  CLOUDFLARE_GLYPH_YELLOW_PATH,
  CLOUDFLARE_WORDMARK_PATH,
  CLOUDFLARE_GLYPH_VIEWBOX,
  CLOUDFLARE_FULL_LOGO_VIEWBOX,
  CLOUDFLARE_FULL_LOGO_ORANGE_PATH,
  CLOUDFLARE_FULL_LOGO_YELLOW_PATH,
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
      <div className="rounded-lg bg-neutral-100 p-4">
        <CloudflareLogo className="w-28" color="black" />
      </div>
      <div className="rounded-lg bg-neutral-900 p-4">
        <CloudflareLogo className="w-28" color="white" />
      </div>
    </div>
  );
}

export function CloudflareLogoGlyphVariantsDemo() {
  return (
    <div className="flex flex-wrap items-center gap-8">
      <CloudflareLogo variant="glyph" className="w-12" color="color" />
      <div className="rounded-lg bg-neutral-100 p-4">
        <CloudflareLogo variant="glyph" className="w-12" color="black" />
      </div>
      <div className="rounded-lg bg-neutral-900 p-4">
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

// Helper to generate SVG strings
function generateGlyphSvg() {
  return `<svg viewBox="${CLOUDFLARE_GLYPH_VIEWBOX}" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="${CLOUDFLARE_GLYPH_ORANGE_PATH}" fill="${CLOUDFLARE_ORANGE}"/>
  <path d="${CLOUDFLARE_GLYPH_YELLOW_PATH}" fill="${CLOUDFLARE_YELLOW}"/>
</svg>`;
}

function generateFullLogoSvg() {
  return `<svg viewBox="${CLOUDFLARE_FULL_LOGO_VIEWBOX}" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="${CLOUDFLARE_FULL_LOGO_ORANGE_PATH}" fill="${CLOUDFLARE_ORANGE}"/>
  <path d="${CLOUDFLARE_FULL_LOGO_YELLOW_PATH}" fill="${CLOUDFLARE_YELLOW}"/>
  <path d="${CLOUDFLARE_WORDMARK_PATH}" fill="${CLOUDFLARE_TEXT_GRAY}"/>
</svg>`;
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
            className="flex items-center gap-2 rounded-lg bg-neutral-900 px-4 py-3 text-white transition-opacity hover:opacity-80"
          >
            <CloudflareLogo variant="glyph" color="white" className="w-8" />
            <span className="font-medium">Logo</span>
          </button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Content>
          <DropdownMenu.Item
            icon={CloudIcon}
            onSelect={() => copyToClipboard(generateGlyphSvg(), "glyph")}
          >
            {copied === "glyph" ? "Copied!" : "Copy logo as SVG"}
          </DropdownMenu.Item>
          <DropdownMenu.Item
            icon={CodeIcon}
            onSelect={() => copyToClipboard(generateFullLogoSvg(), "wordmark")}
          >
            {copied === "wordmark" ? "Copied!" : "Copy wordmark as SVG"}
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
      <div className="rounded-lg bg-neutral-900 p-3">
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
