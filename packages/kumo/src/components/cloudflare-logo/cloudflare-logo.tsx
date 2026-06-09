import { forwardRef } from "react";
import { cn } from "../../utils/cn";

// =============================================================================
// Brand Colors (internal)
// =============================================================================

const CLOUDFLARE_ORANGE = "#F48120";
const CLOUDFLARE_YELLOW = "#FAAD3F";
const CLOUDFLARE_TEXT_GRAY = "#404041";

// =============================================================================
// SVG Path Data (internal)
// =============================================================================

const CLOUDFLARE_GLYPH_ORANGE_PATH =
  "M33.204 20.4C33.3649 19.9741 33.4217 19.5159 33.3695 19.0636C33.3173 18.6113 33.1577 18.1781 32.904 17.8C32.6435 17.4876 32.3239 17.2297 31.9636 17.0409C31.6032 16.8522 31.2092 16.7363 30.804 16.7L13.404 16.5C13.304 16.5 13.204 16.4 13.104 16.4C13.0808 16.3825 13.0618 16.3599 13.0488 16.3339C13.0358 16.3078 13.029 16.2791 13.029 16.25C13.029 16.2209 13.0358 16.1922 13.0488 16.1662C13.0618 16.1401 13.0808 16.1175 13.104 16.1C13.204 15.9 13.304 15.8 13.504 15.8L31.004 15.6C32.115 15.4767 33.1731 15.0597 34.0695 14.3918C34.9659 13.7239 35.6681 12.8293 36.104 11.8L37.104 9.20002C37.104 9.10002 37.204 9.00001 37.104 8.90001C36.5604 6.47843 35.2411 4.30052 33.3466 2.69721C31.4521 1.09391 29.086 0.152865 26.6079 0.0170769C24.1298 -0.118712 21.675 0.558179 19.6167 1.94489C17.5584 3.33161 16.009 5.35233 15.204 7.70002C14.159 6.95365 12.8843 6.59957 11.604 6.70002C10.4291 6.83102 9.33369 7.35777 8.49774 8.19372C7.66179 9.02966 7.13505 10.1251 7.00404 11.3C6.93745 11.9014 6.97125 12.5097 7.10404 13.1C5.20298 13.1526 3.39743 13.9448 2.07147 15.3081C0.745511 16.6714 0.00377461 18.4982 0.00403983 20.4C-0.0123708 20.7695 0.0212659 21.1395 0.104038 21.5C0.10863 21.5781 0.141713 21.6517 0.19701 21.707C0.252307 21.7623 0.325975 21.7954 0.404041 21.8H32.504C32.704 21.8 32.904 21.7 32.904 21.5L33.204 20.4Z";

const CLOUDFLARE_GLYPH_YELLOW_PATH =
  "M38.704 9.20002H38.204C38.104 9.20002 38.004 9.30001 37.904 9.40001L37.204 11.8C37.0431 12.2259 36.9864 12.6841 37.0386 13.1364C37.0908 13.5887 37.2504 14.0219 37.504 14.4C37.7646 14.7124 38.0842 14.9704 38.4445 15.1591C38.8049 15.3479 39.1989 15.4637 39.604 15.5L43.304 15.7C43.404 15.7 43.504 15.8 43.604 15.8C43.6273 15.8175 43.6462 15.8401 43.6592 15.8662C43.6723 15.8922 43.679 15.9209 43.679 15.95C43.679 15.9791 43.6723 16.0078 43.6592 16.0339C43.6462 16.0599 43.6273 16.0826 43.604 16.1C43.504 16.3 43.404 16.4 43.204 16.4L39.404 16.6C38.293 16.7233 37.2349 17.1403 36.3386 17.8082C35.4422 18.4761 34.74 19.3707 34.304 20.4L34.104 21.3C34.004 21.4 34.104 21.6 34.304 21.6H47.504C47.5448 21.6058 47.5863 21.6021 47.6254 21.5891C47.6644 21.5761 47.6999 21.5541 47.729 21.525C47.7581 21.4959 47.7801 21.4604 47.7931 21.4214C47.8061 21.3823 47.8099 21.3408 47.804 21.3C48.0421 20.4527 48.1764 19.5797 48.204 18.7C48.1882 16.1854 47.1822 13.7782 45.404 12C43.6259 10.2218 41.2187 9.21587 38.704 9.20002Z";

// Wordmark paths from official SVG (no trademark symbol)
const CLOUDFLARE_WORDMARK_PATHS = [
  // L
  "M47.34 108.53 L56.88 108.53 L56.88 134.59 L73.54 134.59 L73.54 142.94 L47.34 142.94 L47.34 108.53",
  // O
  "M83.42,125.84v-.10c0-9.88,8-17.9,18.58-17.9s18.48,7.92,18.48,17.8v.1c0,9.88-8,17.89-18.58,17.89s-18.48-7.91-18.48-17.79m27.33,0v-.1c0-5-3.59-9.29-8.85-9.29s-8.7,4.23-8.7,9.19v.1c0,5,3.59,9.29,8.8,9.29s8.75-4.23,8.75-9.19",
  // U
  "M132.15,127.85V108.53h9.69v19.13c0,5,2.51,7.32,6.34,7.32s6.34-2.26,6.34-7.08V108.53h9.69v19.08c0,11.11-6.34,16-16.13,16s-15.93-5-15.93-15.73",
  // D
  "M178.8,108.53h13.27c12.29,0,19.42,7.08,19.42,17v.1c0,9.93-7.22,17.3-19.61,17.3H178.8Zm13.42,26c5.71,0,9.49-3.15,9.49-8.7v-.1c0-5.51-3.78-8.7-9.49-8.7h-3.88v17.5Z",
  // F
  "M225.35 108.53 L252.88 108.53 L252.88 116.89 L234.89 116.89 L234.89 122.74 L251.16 122.74 L251.16 130.65 L234.89 130.65 L234.89 142.94 L225.35 142.94 L225.35 108.53",
  // L
  "M266.15 108.53 L275.69 108.53 L275.69 134.59 L292.35 134.59 L292.35 142.94 L266.15 142.94 L266.15 108.53",
  // A
  "M317.27,108.29h9.19l14.65,34.65H330.89l-2.51-6.14H315.11l-2.46,6.14h-10Zm8.36,21.09-3.84-9.79-3.88,9.79Z",
  // R
  "M353.4,108.53h16.27c5.26,0,8.89,1.38,11.21,3.74a10.69,10.69,0,0,1,3,8v.1A10.89,10.89,0,0,1,376.85,131l8.21,12H374l-6.93-10.42h-4.18v10.42H353.4Zm15.83,16.52c3.24,0,5.11-1.57,5.11-4.08v-.1c0-2.7-2-4.08-5.16-4.08h-6.25v8.26Z",
  // E
  "M397.68 108.53 L425.36 108.53 L425.36 116.64 L407.12 116.64 L407.12 121.85 L423.64 121.85 L423.64 129.38 L407.12 129.38 L407.12 134.83 L425.61 134.83 L425.61 142.94 L397.68 142.94 L397.68 108.53",
  // C
  "M26.46,129.87A8.44,8.44,0,0,1,18.58,135c-5.21,0-8.8-4.33-8.8-9.29v-.1c0-5,3.49-9.19,8.7-9.19a8.63,8.63,0,0,1,8.18,5.7H36.72c-1.61-8.19-8.81-14.31-18.14-14.31C8,107.84,0,115.86,0,125.74v.09c0,9.89,7.86,17.8,18.48,17.8,9.08,0,16.18-5.88,18.05-13.76Z",
];

const CLOUDFLARE_FULL_LOGO_ORANGE_PATH =
  "M360.8,90.69l1-3.6c1.24-4.28.78-8.24-1.3-11.15a11.32,11.32,0,0,0-9-4.43l-73.35-.94a1.49,1.49,0,0,1-1.16-.61,1.51,1.51,0,0,1-.15-1.33,2,2,0,0,1,1.7-1.3l74-.94c8.78-.4,18.29-7.53,21.62-16.22l4.22-11a2.51,2.51,0,0,0,.16-.94,2.35,2.35,0,0,0-.05-.52,48.21,48.21,0,0,0-92.7-5,21.69,21.69,0,0,0-34.58,15.15,22,22,0,0,0,.56,7.59,30.83,30.83,0,0,0-29.93,30.82,31.22,31.22,0,0,0,.32,4.46A1.44,1.44,0,0,0,223.68,92H359.13A1.79,1.79,0,0,0,360.8,90.69Z";

const CLOUDFLARE_FULL_LOGO_YELLOW_PATH =
  "M385.24,40c-.68,0-1.36,0-2,0a1.55,1.55,0,0,0-.31.07,1.14,1.14,0,0,0-.74.78l-2.89,10c-1.24,4.28-.77,8.24,1.31,11.14a11.3,11.3,0,0,0,9,4.44l15.63.94a1.44,1.44,0,0,1,1.12.6,1.5,1.5,0,0,1,.16,1.34,2,2,0,0,1-1.7,1.3l-16.24.94c-8.82.4-18.33,7.52-21.66,16.21l-1.17,3.07a.87.87,0,0,0,.77,1.18h55.94a1.49,1.49,0,0,0,1.45-1.07A40.15,40.15,0,0,0,385.24,40Z";

const CLOUDFLARE_GLYPH_VIEWBOX = "0 0 49 22";
const CLOUDFLARE_FULL_LOGO_VIEWBOX = "0 0 425.6 143.63";

// =============================================================================
// Component Variants
// =============================================================================

export const KUMO_CLOUDFLARE_LOGO_VARIANTS = {
  variant: {
    glyph: {
      description: "Cloud glyph only (logomark)",
    },
    full: {
      description: "Full logo with cloud glyph and wordmark stacked",
    },
  },
  color: {
    color: {
      description:
        "Brand colors (orange/yellow gradient cloud, dark gray text)",
    },
    black: {
      description: "Solid black logo",
    },
    white: {
      description: "Solid white logo (for dark backgrounds)",
    },
  },
} as const;

export const KUMO_CLOUDFLARE_LOGO_DEFAULT_VARIANTS = {
  variant: "full",
  color: "color",
} as const;

export type CloudflareLogoVariant =
  keyof typeof KUMO_CLOUDFLARE_LOGO_VARIANTS.variant;
export type CloudflareLogoColor =
  keyof typeof KUMO_CLOUDFLARE_LOGO_VARIANTS.color;

export interface CloudflareLogoProps
  extends React.SVGAttributes<SVGSVGElement> {
  /**
   * Logo variant
   * - `glyph`: Cloud icon only
   * - `full`: Cloud icon with "CLOUDFLARE" wordmark below
   * @default "full"
   */
  variant?: CloudflareLogoVariant;
  /**
   * Color scheme
   * - `color`: Brand colors (orange/yellow cloud, dark gray wordmark)
   * - `black`: Solid black
   * - `white`: Solid white (for dark backgrounds)
   * @default "color"
   */
  color?: CloudflareLogoColor;
}

/**
 * Cloudflare logo component.
 *
 * @example Glyph only (cloud icon)
 * ```tsx
 * <CloudflareLogo variant="glyph" className="w-12" />
 * ```
 *
 * @example Full logo with wordmark
 * ```tsx
 * <CloudflareLogo variant="full" className="w-40" />
 * ```
 *
 * @example White logo for dark backgrounds
 * ```tsx
 * <CloudflareLogo color="white" className="w-32" />
 * ```
 *
 * @example Black logo
 * ```tsx
 * <CloudflareLogo color="black" className="w-32" />
 * ```
 */
export const CloudflareLogo = forwardRef<SVGSVGElement, CloudflareLogoProps>(
  (
    {
      variant = KUMO_CLOUDFLARE_LOGO_DEFAULT_VARIANTS.variant,
      color = KUMO_CLOUDFLARE_LOGO_DEFAULT_VARIANTS.color,
      className,
      ...props
    },
    ref,
  ) => {
    const isGlyph = variant === "glyph";

    // Determine fill colors
    // Cloud glyph always uses brand colors when color="color", otherwise currentColor
    const fillOrange = color === "color" ? CLOUDFLARE_ORANGE : "currentColor";
    const fillYellow = color === "color" ? CLOUDFLARE_YELLOW : "currentColor";
    // Wordmark uses currentColor to respect dark mode (via text-kumo-default class)
    const fillText = "currentColor";

    if (isGlyph) {
      return (
        <svg
          ref={ref}
          viewBox={CLOUDFLARE_GLYPH_VIEWBOX}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          role="img"
          aria-label="Cloudflare logo"
          className={cn(
            color === "white" && "text-white",
            color === "black" && "text-black",
            className,
          )}
          {...props}
        >
          <path
            d="M33.204 20.4C33.3649 19.9741 33.4217 19.5159 33.3695 19.0636C33.3173 18.6113 33.1577 18.1781 32.904 17.8C32.6435 17.4876 32.3239 17.2297 31.9636 17.0409C31.6032 16.8522 31.2092 16.7363 30.804 16.7L13.404 16.5C13.304 16.5 13.204 16.4 13.104 16.4C13.0808 16.3825 13.0618 16.3599 13.0488 16.3339C13.0358 16.3078 13.029 16.2791 13.029 16.25C13.029 16.2209 13.0358 16.1922 13.0488 16.1662C13.0618 16.1401 13.0808 16.1175 13.104 16.1C13.204 15.9 13.304 15.8 13.504 15.8L31.004 15.6C32.115 15.4767 33.1731 15.0597 34.0695 14.3918C34.9659 13.7239 35.6681 12.8293 36.104 11.8L37.104 9.20002C37.104 9.10002 37.204 9.00001 37.104 8.90001C36.5604 6.47843 35.2411 4.30052 33.3466 2.69721C31.4521 1.09391 29.086 0.152865 26.6079 0.0170769C24.1298 -0.118712 21.675 0.558179 19.6167 1.94489C17.5584 3.33161 16.009 5.35233 15.204 7.70002C14.159 6.95365 12.8843 6.59957 11.604 6.70002C10.4291 6.83102 9.33369 7.35777 8.49774 8.19372C7.66179 9.02966 7.13505 10.1251 7.00404 11.3C6.93745 11.9014 6.97125 12.5097 7.10404 13.1C5.20298 13.1526 3.39743 13.9448 2.07147 15.3081C0.745511 16.6714 0.00377461 18.4982 0.00403983 20.4C-0.0123708 20.7695 0.0212659 21.1395 0.104038 21.5C0.10863 21.5781 0.141713 21.6517 0.19701 21.707C0.252307 21.7623 0.325975 21.7954 0.404041 21.8H32.504C32.704 21.8 32.904 21.7 32.904 21.5L33.204 20.4Z"
            fill={fillOrange}
          />
          <path
            d="M38.704 9.20002H38.204C38.104 9.20002 38.004 9.30001 37.904 9.40001L37.204 11.8C37.0431 12.2259 36.9864 12.6841 37.0386 13.1364C37.0908 13.5887 37.2504 14.0219 37.504 14.4C37.7646 14.7124 38.0842 14.9704 38.4445 15.1591C38.8049 15.3479 39.1989 15.4637 39.604 15.5L43.304 15.7C43.404 15.7 43.504 15.8 43.604 15.8C43.6273 15.8175 43.6462 15.8401 43.6592 15.8662C43.6723 15.8922 43.679 15.9209 43.679 15.95C43.679 15.9791 43.6723 16.0078 43.6592 16.0339C43.6462 16.0599 43.6273 16.0826 43.604 16.1C43.504 16.3 43.404 16.4 43.204 16.4L39.404 16.6C38.293 16.7233 37.2349 17.1403 36.3386 17.8082C35.4422 18.4761 34.74 19.3707 34.304 20.4L34.104 21.3C34.004 21.4 34.104 21.6 34.304 21.6H47.504C47.5448 21.6058 47.5863 21.6021 47.6254 21.5891C47.6644 21.5761 47.6999 21.5541 47.729 21.525C47.7581 21.4959 47.7801 21.4604 47.7931 21.4214C47.8061 21.3823 47.8099 21.3408 47.804 21.3C48.0421 20.4527 48.1764 19.5797 48.204 18.7C48.1882 16.1854 47.1822 13.7782 45.404 12C43.6259 10.2218 41.2187 9.21587 38.704 9.20002Z"
            fill={fillYellow}
          />
        </svg>
      );
    }

    // Full logo with wordmark
    return (
      <svg
        ref={ref}
        viewBox={CLOUDFLARE_FULL_LOGO_VIEWBOX}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label="Cloudflare logo"
        className={cn(
          // Wordmark text color - respects dark mode
          color === "color" && "text-kumo-default",
          color === "white" && "text-white",
          color === "black" && "text-black",
          className,
        )}
        {...props}
      >
        {/* Cloud glyph */}
        <path d={CLOUDFLARE_FULL_LOGO_ORANGE_PATH} fill={fillOrange} />
        <path d={CLOUDFLARE_FULL_LOGO_YELLOW_PATH} fill={fillYellow} />
        {/* Wordmark */}
        {CLOUDFLARE_WORDMARK_PATHS.map((d, i) => (
          <path key={i} d={d} fill={fillText} />
        ))}
      </svg>
    );
  },
);

CloudflareLogo.displayName = "CloudflareLogo";

// =============================================================================
// PoweredByCloudflare Component
// =============================================================================

export interface PoweredByCloudflareProps
  extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  /**
   * Color scheme for the logo and text
   * @default "color"
   */
  color?: CloudflareLogoColor;
}

/**
 * "Powered by Cloudflare" badge component.
 *
 * Renders a link to cloudflare.com with the Cloudflare glyph and "Powered by Cloudflare" text.
 *
 * @example Basic usage
 * ```tsx
 * <PoweredByCloudflare />
 * ```
 *
 * @example White variant for dark backgrounds
 * ```tsx
 * <PoweredByCloudflare color="white" />
 * ```
 *
 * @example Custom link
 * ```tsx
 * <PoweredByCloudflare href="https://cloudflare.com/products/workers" />
 * ```
 */
export const PoweredByCloudflare = forwardRef<
  HTMLAnchorElement,
  PoweredByCloudflareProps
>(
  (
    {
      color = "color",
      href = "https://www.cloudflare.com",
      className,
      ...props
    },
    ref,
  ) => {
    return (
      <a
        ref={ref}
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(
          // Base badge styles
          "inline-flex items-center gap-2 rounded-lg py-2 pl-2.5 pr-3 text-sm font-medium",
          "ring-1 ring-inset transition-all hover:shadow-sm",
          // Color variants using semantic tokens
          color === "color" && "bg-kumo-base text-kumo-default ring-kumo-hairline",
          color === "black" && "bg-white text-black ring-black/20",
          color === "white" && "bg-black text-white ring-white/20",
          className,
        )}
        {...props}
      >
        <CloudflareLogo variant="glyph" color={color} className="h-4 w-auto" />
        <span>
          Powered by <span className="font-semibold">Cloudflare</span>
        </span>
      </a>
    );
  },
);

PoweredByCloudflare.displayName = "PoweredByCloudflare";

// =============================================================================
// SVG Generation Helper
// =============================================================================

export type CloudflareLogoSvgVariant = "glyph" | "full";
export type CloudflareLogoSvgColor = "color" | "black" | "white";

export interface GenerateCloudflareLogoSvgOptions {
  /**
   * Logo variant
   * - `glyph`: Cloud icon only
   * - `full`: Cloud icon with "CLOUDFLARE" wordmark
   * @default "full"
   */
  variant?: CloudflareLogoSvgVariant;
  /**
   * Color scheme
   * - `color`: Brand colors (orange/yellow cloud, dark gray wordmark)
   * - `black`: Solid black
   * - `white`: Solid white
   * @default "color"
   */
  color?: CloudflareLogoSvgColor;
}

/**
 * Generates SVG markup string for the Cloudflare logo.
 *
 * Useful for copying to clipboard or embedding in non-React contexts.
 *
 * @example Copy glyph SVG to clipboard
 * ```tsx
 * const svg = generateCloudflareLogoSvg({ variant: "glyph" });
 * await navigator.clipboard.writeText(svg);
 * ```
 *
 * @example Generate full logo in black
 * ```tsx
 * const svg = generateCloudflareLogoSvg({ variant: "full", color: "black" });
 * ```
 */
export function generateCloudflareLogoSvg(
  options: GenerateCloudflareLogoSvgOptions = {},
): string {
  const { variant = "full", color = "color" } = options;

  const isGlyph = variant === "glyph";

  // Determine fill colors
  const fillOrange = color === "color" ? CLOUDFLARE_ORANGE : color;
  const fillYellow = color === "color" ? CLOUDFLARE_YELLOW : color;
  const fillText = color === "color" ? CLOUDFLARE_TEXT_GRAY : color;

  if (isGlyph) {
    return `<svg viewBox="${CLOUDFLARE_GLYPH_VIEWBOX}" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Cloudflare logo">
  <path d="${CLOUDFLARE_GLYPH_ORANGE_PATH}" fill="${fillOrange}"/>
  <path d="${CLOUDFLARE_GLYPH_YELLOW_PATH}" fill="${fillYellow}"/>
</svg>`;
  }

  // Full logo with wordmark
  const wordmarkPaths = CLOUDFLARE_WORDMARK_PATHS.map(
    (d) => `  <path d="${d}" fill="${fillText}"/>`,
  ).join("\n");

  return `<svg viewBox="${CLOUDFLARE_FULL_LOGO_VIEWBOX}" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Cloudflare logo">
  <path d="${CLOUDFLARE_FULL_LOGO_ORANGE_PATH}" fill="${fillOrange}"/>
  <path d="${CLOUDFLARE_FULL_LOGO_YELLOW_PATH}" fill="${fillYellow}"/>
${wordmarkPaths}
</svg>`;
}
