import { forwardRef } from "react";
import { cn } from "../../utils/cn";
import { resolveVariant } from "../../utils/resolve-variant";
import { useLink, type UseLinkOptions } from "../../utils/link-provider";

/** Link variant definitions mapping variant names to their Tailwind classes. */
export const KUMO_LINK_VARIANTS = {
  variant: {
    inline: {
      classes:
        // text-kumo-link provides defensive color that won't be overridden by global `a` styles
        "text-kumo-link underline underline-offset-[0.15em] decoration-[0.0625em] link-current transition-colors",
      description: "Inline text link that flows with content",
    },
    current: {
      classes:
        "text-current underline underline-offset-[0.15em] decoration-[0.0625em] link-current transition-colors",
      description: "Link that inherits color from parent text",
    },
    plain: {
      classes:
        // text-kumo-link provides defensive color that won't be overridden by global `a` styles
        "text-kumo-link hover:text-kumo-link/70 transition-colors",
      description: "Link without underline decoration",
    },
  },
} as const;

export const KUMO_LINK_DEFAULT_VARIANTS = {
  variant: "inline",
} as const;

export type KumoLinkVariant = keyof typeof KUMO_LINK_VARIANTS.variant;

export interface KumoLinkVariantsProps {
  /**
   * Visual style of the link.
   * - `"inline"` — Inline text link that flows with content
   * - `"current"` — Link that inherits color from parent text
   * - `"plain"` — Link without underline decoration
   * @default "inline"
   */
  variant?: KumoLinkVariant;
}

export function linkVariants({
  variant = KUMO_LINK_DEFAULT_VARIANTS.variant,
}: KumoLinkVariantsProps = {}) {
  return cn(
    resolveVariant(
      KUMO_LINK_VARIANTS.variant,
      variant,
      KUMO_LINK_DEFAULT_VARIANTS.variant,
    ).classes,
  );
}

/**
 * Link component props.
 *
 * Use `href` for every destination. `LinkProvider` decides whether the link
 * renders through the app's router or a plain anchor, and whether it opens in
 * a new tab. Use `useLink` for custom link UI.
 *
 * @example Internal link
 * ```tsx
 * <Link href="/docs">Learn more</Link>
 * ```
 *
 * @example New tab
 * ```tsx
 * <Link href="https://cloudflare.com" target="_blank">Visit Cloudflare</Link>
 * ```
 */
export type LinkProps = UseLinkOptions & KumoLinkVariantsProps;

/**
 * Inline text link. Resolves `href` through `LinkProvider`: internal routes
 * render the app's router link and everything else renders an `<a>`. Links
 * that open in a new tab show an icon and announce it to screen readers.
 *
 * @example
 * ```tsx
 * <Link href="/docs">Learn more</Link>
 * <Link href="https://developers.cloudflare.com">Docs</Link>
 * ```
 */
export const Link = forwardRef<HTMLAnchorElement, LinkProps>(function Link(
  {
    className,
    variant = KUMO_LINK_DEFAULT_VARIANTS.variant,
    children,
    ...props
  },
  ref,
) {
  const { Component, linkProps, newTabCue } = useLink(props);

  return (
    <Component
      ref={ref}
      data-kumo-component="Link"
      {...linkProps}
      className={cn(
        linkVariants({ variant }),
        // Inline by default so the new-tab icon wraps with the last word. Links
        // that wrap an icon or Badge keep the flex layout for alignment.
        "group/link items-center gap-[0.1875em] has-[>[data-kumo-component=Badge]]:inline-flex has-[>[data-kumo-component=Badge]]:rounded-full has-[>svg]:inline-flex",
        className,
      )}
    >
      {children}
      {newTabCue}
    </Component>
  );
});

Link.displayName = "Link";
