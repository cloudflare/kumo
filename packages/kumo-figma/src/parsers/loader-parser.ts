/**
 * Loader SVG Parser
 *
 * Parses loader.tsx and extracts the SVG structure.
 * This ensures the Figma plugin stays in sync with the code.
 *
 * Runs at BUILD TIME (not in Figma runtime), so Node.js fs/path are available.
 * The parsed data will be inlined into the plugin bundle.
 *
 * @example
 * const loaderData = parseLoaderSvg();
 * // {
 * //   viewBox: "0 0 24 24",
 * //   width: 24,
 * //   height: 24,
 * //   circles: [
 * //     { cx: 12, cy: 12, r: 9.5, strokeWidth: 2, ... },
 * //     ...
 * //   ],
 * //   sizes: { sm: 16, base: 24, lg: 32 }
 * // }
 */

import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

/**
 * Circle data extracted from loader SVG
 */
export type CircleData = {
  cx: number;
  cy: number;
  r: number;
  fill: string;
  strokeWidth: number;
  strokeLinecap: string;
  opacity?: number;
  /** Animation values at midpoint (for static representation) */
  strokeDasharray?: string;
  strokeDashoffset?: string;
};

/**
 * Loader data extracted from loader.tsx
 */
export type LoaderData = {
  /** SVG viewBox */
  viewBox: string;
  /** SVG width */
  width: number;
  /** SVG height */
  height: number;
  /** Circle elements */
  circles: CircleData[];
  /** Size variants from KUMO_LOADER_VARIANTS */
  sizes: Record<string, { value: number; description: string }>;
  /** Raw SVG string for Figma (static representation) */
  svgString: string;
};

/**
 * Parse loader.tsx and extract SVG structure
 *
 * @returns LoaderData with SVG structure and size variants
 */
export function parseLoaderSvg(): LoaderData {
  // Resolve loader.tsx path - reference sibling kumo package
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);
  const loaderPath = join(
    __dirname,
    "../../../kumo/src/components/loader/loader.tsx",
  );

  const content = readFileSync(loaderPath, "utf-8");

  // Extract KUMO_LOADER_VARIANTS
  const sizesMatch = content.match(
    /KUMO_LOADER_VARIANTS\s*=\s*\{[\s\S]*?size:\s*\{([\s\S]*?)\}\s*,?\s*\}/,
  );
  const sizes: Record<string, { value: number; description: string }> = {};

  if (sizesMatch) {
    // Parse each size variant
    const sizeRegex =
      /(\w+):\s*\{\s*value:\s*(\d+),\s*description:\s*"([^"]+)"/g;
    let match;
    while ((match = sizeRegex.exec(sizesMatch[1])) !== null) {
      sizes[match[1]] = {
        value: parseInt(match[2], 10),
        description: match[3],
      };
    }
  }

  // Extract SVG attributes
  const svgMatch = content.match(
    /<svg[\s\S]*?width="(\d+)"[\s\S]*?height="(\d+)"[\s\S]*?viewBox="([^"]+)"/,
  );
  const width = svgMatch ? parseInt(svgMatch[1], 10) : 24;
  const height = svgMatch ? parseInt(svgMatch[2], 10) : 24;
  const viewBox = svgMatch ? svgMatch[3] : "0 0 24 24";

  // Extract circle elements
  const circles: CircleData[] = [];

  // First circle (animated foreground)
  const circle1Match = content.match(
    /<circle[\s\S]*?cx="(\d+)"[\s\S]*?cy="(\d+)"[\s\S]*?r="([\d.]+)"[\s\S]*?strokeWidth="(\d+)"[\s\S]*?strokeLinecap="(\w+)"[\s\S]*?>[\s\S]*?<animate[\s\S]*?attributeName="stroke-dasharray"[\s\S]*?values="([^"]+)"[\s\S]*?<animate[\s\S]*?attributeName="stroke-dashoffset"[\s\S]*?values="([^"]+)"/,
  );

  if (circle1Match) {
    // Parse animation values to get midpoint
    const dashArrayValues = circle1Match[6].split(";");
    const dashOffsetValues = circle1Match[7].split(";");

    // Use midpoint values (index 1 for keyTimes="0;0.5;1")
    const midpointDashArray =
      dashArrayValues.length > 1 ? dashArrayValues[1] : dashArrayValues[0];
    const midpointDashOffset =
      dashOffsetValues.length > 1 ? dashOffsetValues[1] : dashOffsetValues[0];

    circles.push({
      cx: parseInt(circle1Match[1], 10),
      cy: parseInt(circle1Match[2], 10),
      r: parseFloat(circle1Match[3]),
      fill: "none",
      strokeWidth: parseInt(circle1Match[4], 10),
      strokeLinecap: circle1Match[5],
      strokeDasharray: midpointDashArray,
      strokeDashoffset: midpointDashOffset,
    });
  }

  // Second circle (background with opacity)
  const circle2Match = content.match(
    /<circle[\s\S]*?cx="(\d+)"[\s\S]*?cy="(\d+)"[\s\S]*?r="([\d.]+)"[\s\S]*?fill="(\w+)"[\s\S]*?opacity=\{?([\d.]+)\}?[\s\S]*?strokeWidth="(\d+)"[\s\S]*?strokeLinecap="(\w+)"/,
  );

  if (circle2Match) {
    circles.push({
      cx: parseInt(circle2Match[1], 10),
      cy: parseInt(circle2Match[2], 10),
      r: parseFloat(circle2Match[3]),
      fill: circle2Match[4],
      opacity: parseFloat(circle2Match[5]),
      strokeWidth: parseInt(circle2Match[6], 10),
      strokeLinecap: circle2Match[7],
    });
  }

  // Generate static SVG string for Figma
  // Background circle first (lower z-index), then foreground arc
  const bgCircle = circles.find((c) => c.opacity !== undefined);
  const fgCircle = circles.find((c) => c.strokeDasharray !== undefined);

  let svgString = `<svg width="${width}" height="${height}" viewBox="${viewBox}" xmlns="http://www.w3.org/2000/svg">`;

  // Background circle (full ring at low opacity)
  if (bgCircle) {
    svgString += `
  <circle
    cx="${bgCircle.cx}"
    cy="${bgCircle.cy}"
    r="${bgCircle.r}"
    fill="none"
    stroke="currentColor"
    stroke-width="${bgCircle.strokeWidth}"
    stroke-linecap="${bgCircle.strokeLinecap}"
    opacity="${bgCircle.opacity}"
  />`;
  }

  // Foreground arc (the animated spinner, shown at midpoint)
  // Instead of stroke-dasharray (which Figma renders as dashes), use an actual arc path
  // The animation shows ~70% of the circle at midpoint (42/60 ≈ 0.7)
  if (fgCircle) {
    // Create an arc path that represents ~70% of the circle
    // Starting from top (-90°), going clockwise for about 250° (70% of 360°)
    const cx = fgCircle.cx;
    const cy = fgCircle.cy;
    const r = fgCircle.r;

    // Arc parameters: start at top, sweep ~250 degrees clockwise
    const startAngle = -90; // Start from top
    const sweepAngle = 250; // ~70% of circle
    const endAngle = startAngle + sweepAngle;

    // Convert to radians
    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;

    // Calculate start and end points
    const x1 = cx + r * Math.cos(startRad);
    const y1 = cy + r * Math.sin(startRad);
    const x2 = cx + r * Math.cos(endRad);
    const y2 = cy + r * Math.sin(endRad);

    // Large arc flag: 1 if sweep > 180°
    const largeArc = sweepAngle > 180 ? 1 : 0;

    // SVG arc path: M x1,y1 A rx,ry rotation large-arc-flag sweep-flag x2,y2
    const arcPath = `M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}`;

    svgString += `
  <path
    d="${arcPath}"
    fill="none"
    stroke="currentColor"
    stroke-width="${fgCircle.strokeWidth}"
    stroke-linecap="${fgCircle.strokeLinecap}"
  />`;
  }

  svgString += "\n</svg>";

  return {
    viewBox,
    width,
    height,
    circles,
    sizes,
    svgString,
  };
}
