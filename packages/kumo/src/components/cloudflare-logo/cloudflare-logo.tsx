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

const CLOUDFLARE_WORDMARK_PATH =
  "M100.5,27.2a.9.9,0,1,1,.9-.9.89626.89626,0,0,1-.9.9m0-1.6a.7.7,0,1,0,.7.7.68354.68354,0,0,0-.7-.7m.4,1.2h-.2l-.2-.3h-.2v.3h-.2v-.9h.5a.26517.26517,0,0,1,.3.3c0,.1-.1.2-.2.3l.2.3Zm-.3-.5c.1,0,.1,0,.1-.1a.09794.09794,0,0,0-.1-.1h-.3v.3h.3Zm-89.7-.9h2.2v6h3.8v1.9h-6Zm8.3,3.9a4.10491,4.10491,0,0,1,4.3-4.1,4.02,4.02,0,0,1,4.2,4.1,4.10491,4.10491,0,0,1-4.3,4.1,4.07888,4.07888,0,0,1-4.2-4.1m6.3,0a2.05565,2.05565,0,0,0-2-2.2,2.1025,2.1025,0,0,0,0,4.2c1.2.2,2-.8,2-2m4.9.5V25.4h2.2v4.4c0,1.1.6,1.7,1.5,1.7a1.39926,1.39926,0,0,0,1.5-1.6V25.4h2.2v4.4c0,2.6-1.5,3.7-3.7,3.7-2.3-.1-3.7-1.2-3.7-3.7m10.7-4.4h3.1c2.8,0,4.5,1.6,4.5,3.9s-1.7,4-4.5,4h-3V25.4Zm3.1,5.9a2.00909,2.00909,0,1,0,0-4h-.9v4Zm7.6-5.9h6.3v1.9H54v1.3h3.7v1.8H54v2.9H51.8Zm9.4,0h2.2v6h3.8v1.9h-6Zm11.7-.1h2.2l3.4,8H76.1l-.6-1.4H72.4l-.6,1.4H69.5Zm2,4.9L74,28l-.9,2.2Zm6.4-4.8H85a3.41818,3.41818,0,0,1,2.6.9,2.62373,2.62373,0,0,1-.9,4.2l1.9,2.8H86.1l-1.6-2.4h-1v2.4H81.3Zm3.6,3.8c.7,0,1.2-.4,1.2-.9,0-.6-.5-.9-1.2-.9H83.5v1.9h1.4Zm6.5-3.8h6.4v1.8H93.6v1.2h3.8v1.8H93.6v1.2h4.3v1.9H91.4ZM6.1,30.3a1.97548,1.97548,0,0,1-1.8,1.2,2.1025,2.1025,0,0,1,0-4.2,2.0977,2.0977,0,0,1,1.9,1.3H8.5a4.13459,4.13459,0,0,0-4.2-3.3A4.1651,4.1651,0,0,0,0,29.4a4.07888,4.07888,0,0,0,4.2,4.1,4.31812,4.31812,0,0,0,4.2-3.2Z";

const CLOUDFLARE_FULL_LOGO_ORANGE_PATH =
  "M84.2,20.4a2.85546,2.85546,0,0,0-.3-2.6,3.09428,3.09428,0,0,0-2.1-1.1l-17.4-.2c-.1,0-.2-.1-.3-.1a.1875.1875,0,0,1,0-.3c.1-.2.2-.3.4-.3L82,15.6a6.29223,6.29223,0,0,0,5.1-3.8l1-2.6c0-.1.1-.2,0-.3A11.39646,11.39646,0,0,0,66.2,7.7a5.45941,5.45941,0,0,0-3.6-1A5.20936,5.20936,0,0,0,58,11.3a5.46262,5.46262,0,0,0,.1,1.8A7.30177,7.30177,0,0,0,51,20.4a4.102,4.102,0,0,0,.1,1.1.3193.3193,0,0,0,.3.3H83.5c.2,0,.4-.1.4-.3Z";

const CLOUDFLARE_FULL_LOGO_YELLOW_PATH =
  "M89.7,9.2h-.5c-.1,0-.2.1-.3.2l-.7,2.4a2.85546,2.85546,0,0,0,.3,2.6,3.09428,3.09428,0,0,0,2.1,1.1l3.7.2c.1,0,.2.1.3.1a.1875.1875,0,0,1,0,.3c-.1.2-.2.3-.4.3l-3.8.2a6.29223,6.29223,0,0,0-5.1,3.8l-.2.9c-.1.1,0,.3.2.3H98.5a.26517.26517,0,0,0,.3-.3,10.87184,10.87184,0,0,0,.4-2.6,9.56045,9.56045,0,0,0-9.5-9.5";

const CLOUDFLARE_GLYPH_VIEWBOX = "0 0 49 22";
const CLOUDFLARE_FULL_LOGO_VIEWBOX = "0 0 101.4 33.5";

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
        <path
          d="M84.2,20.4a2.85546,2.85546,0,0,0-.3-2.6,3.09428,3.09428,0,0,0-2.1-1.1l-17.4-.2c-.1,0-.2-.1-.3-.1a.1875.1875,0,0,1,0-.3c.1-.2.2-.3.4-.3L82,15.6a6.29223,6.29223,0,0,0,5.1-3.8l1-2.6c0-.1.1-.2,0-.3A11.39646,11.39646,0,0,0,66.2,7.7a5.45941,5.45941,0,0,0-3.6-1A5.20936,5.20936,0,0,0,58,11.3a5.46262,5.46262,0,0,0,.1,1.8A7.30177,7.30177,0,0,0,51,20.4a4.102,4.102,0,0,0,.1,1.1.3193.3193,0,0,0,.3.3H83.5c.2,0,.4-.1.4-.3Z"
          fill={fillOrange}
        />
        <path
          d="M89.7,9.2h-.5c-.1,0-.2.1-.3.2l-.7,2.4a2.85546,2.85546,0,0,0,.3,2.6,3.09428,3.09428,0,0,0,2.1,1.1l3.7.2c.1,0,.2.1.3.1a.1875.1875,0,0,1,0,.3c-.1.2-.2.3-.4.3l-3.8.2a6.29223,6.29223,0,0,0-5.1,3.8l-.2.9c-.1.1,0,.3.2.3H98.5a.26517.26517,0,0,0,.3-.3,10.87184,10.87184,0,0,0,.4-2.6,9.56045,9.56045,0,0,0-9.5-9.5"
          fill={fillYellow}
        />
        {/* Wordmark */}
        <path
          d="M100.5,27.2a.9.9,0,1,1,.9-.9.89626.89626,0,0,1-.9.9m0-1.6a.7.7,0,1,0,.7.7.68354.68354,0,0,0-.7-.7m.4,1.2h-.2l-.2-.3h-.2v.3h-.2v-.9h.5a.26517.26517,0,0,1,.3.3c0,.1-.1.2-.2.3l.2.3Zm-.3-.5c.1,0,.1,0,.1-.1a.09794.09794,0,0,0-.1-.1h-.3v.3h.3Zm-89.7-.9h2.2v6h3.8v1.9h-6Zm8.3,3.9a4.10491,4.10491,0,0,1,4.3-4.1,4.02,4.02,0,0,1,4.2,4.1,4.10491,4.10491,0,0,1-4.3,4.1,4.07888,4.07888,0,0,1-4.2-4.1m6.3,0a2.05565,2.05565,0,0,0-2-2.2,2.1025,2.1025,0,0,0,0,4.2c1.2.2,2-.8,2-2m4.9.5V25.4h2.2v4.4c0,1.1.6,1.7,1.5,1.7a1.39926,1.39926,0,0,0,1.5-1.6V25.4h2.2v4.4c0,2.6-1.5,3.7-3.7,3.7-2.3-.1-3.7-1.2-3.7-3.7m10.7-4.4h3.1c2.8,0,4.5,1.6,4.5,3.9s-1.7,4-4.5,4h-3V25.4Zm3.1,5.9a2.00909,2.00909,0,1,0,0-4h-.9v4Zm7.6-5.9h6.3v1.9H54v1.3h3.7v1.8H54v2.9H51.8Zm9.4,0h2.2v6h3.8v1.9h-6Zm11.7-.1h2.2l3.4,8H76.1l-.6-1.4H72.4l-.6,1.4H69.5Zm2,4.9L74,28l-.9,2.2Zm6.4-4.8H85a3.41818,3.41818,0,0,1,2.6.9,2.62373,2.62373,0,0,1-.9,4.2l1.9,2.8H86.1l-1.6-2.4h-1v2.4H81.3Zm3.6,3.8c.7,0,1.2-.4,1.2-.9,0-.6-.5-.9-1.2-.9H83.5v1.9h1.4Zm6.5-3.8h6.4v1.8H93.6v1.2h3.8v1.8H93.6v1.2h4.3v1.9H91.4ZM6.1,30.3a1.97548,1.97548,0,0,1-1.8,1.2,2.1025,2.1025,0,0,1,0-4.2,2.0977,2.0977,0,0,1,1.9,1.3H8.5a4.13459,4.13459,0,0,0-4.2-3.3A4.1651,4.1651,0,0,0,0,29.4a4.07888,4.07888,0,0,0,4.2,4.1,4.31812,4.31812,0,0,0,4.2-3.2Z"
          fill={fillText}
        />
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
          color === "color" && "bg-kumo-base text-kumo-default ring-kumo-line",
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
  return `<svg viewBox="${CLOUDFLARE_FULL_LOGO_VIEWBOX}" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Cloudflare logo">
  <path d="${CLOUDFLARE_FULL_LOGO_ORANGE_PATH}" fill="${fillOrange}"/>
  <path d="${CLOUDFLARE_FULL_LOGO_YELLOW_PATH}" fill="${fillYellow}"/>
  <path d="${CLOUDFLARE_WORDMARK_PATH}" fill="${fillText}"/>
</svg>`;
}
