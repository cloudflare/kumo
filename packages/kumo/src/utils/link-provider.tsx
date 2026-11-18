import {
  createContext,
  forwardRef,
  useContext,
  useId,
  useMemo,
  type AnchorHTMLAttributes,
  type ComponentType,
  type ReactNode,
  type RefAttributes,
  type SVGProps,
} from "react";
import { useKumoLocale } from "./locale-provider";

/**
 * Props received by the router component passed to `LinkProvider`.
 *
 * Kumo only renders the router component for internal routes, so `href` is
 * always a string. Map it to your router's destination prop (e.g. React
 * Router's `to`) and forward everything else.
 */
export type RouterLinkProps = Omit<
  AnchorHTMLAttributes<HTMLAnchorElement>,
  "href"
> & {
  href: string;
};

export type RouterLinkComponent = ComponentType<
  RouterLinkProps & RefAttributes<HTMLAnchorElement>
>;

/**
 * How links to other origins open when the link has no explicit `target`.
 * - `"same-tab"` — open in the current tab (default)
 * - `"new-tab"` — open in a new tab with a visible icon and an announcement
 */
export type ExternalLinksPolicy = "same-tab" | "new-tab";

export interface LinkProviderProps {
  /**
   * Router link component used for internal routes. Receives `href` and the
   * remaining anchor props. When omitted, every link renders a plain `<a>`.
   */
  router?: RouterLinkComponent;
  /**
   * Whether links to other origins open in the current tab or a new tab.
   * An explicit `target` on a link always wins.
   * @default "same-tab"
   */
  externalLinks?: ExternalLinksPolicy;
  /**
   * Decides whether an internal URL is handled by `router`. Return `false`
   * to render a plain `<a>` instead, for example for paths owned by another
   * app on the same origin. Without `origin`, relative URLs are resolved
   * against a placeholder origin, so read `pathname`, `search`, and `hash`.
   *
   * Pass a stable function (module-level or `useCallback`). A new function on
   * every render re-renders every link under the provider.
   * @default () => true
   */
  isClientRoute?: (url: URL) => boolean;
  /**
   * The app's own origin, e.g. `"https://dash.cloudflare.com"`. Absolute URLs
   * on this origin are treated as internal routes. Pass the same value during
   * server rendering and hydration.
   */
  origin?: string;
  children: ReactNode;
}

interface LinkConfig {
  router?: RouterLinkComponent;
  externalLinks: ExternalLinksPolicy;
  isClientRoute?: (url: URL) => boolean;
  origin?: string;
}

const DEFAULT_LINK_CONFIG: LinkConfig = { externalLinks: "same-tab" };

const LinkConfigContext = createContext<LinkConfig>(DEFAULT_LINK_CONFIG);

/**
 * Configures how every Kumo link-like component navigates.
 *
 * Kumo resolves each `href` before rendering: internal routes render through
 * `router`; everything else renders a plain `<a>`. Links that open in a new
 * tab get a visible icon and a localized screen-reader announcement.
 *
 * @example React Router
 * ```tsx
 * import { forwardRef } from "react";
 * import { LinkProvider, type RouterLinkProps } from "@cloudflare/kumo";
 * import { Link as ReactRouterLink } from "react-router-dom";
 *
 * const RouterLink = forwardRef<HTMLAnchorElement, RouterLinkProps>(
 *   ({ href, ...props }, ref) => (
 *     <ReactRouterLink ref={ref} to={href} {...props} />
 *   ),
 * );
 * RouterLink.displayName = "RouterLink";
 *
 * <LinkProvider router={RouterLink}>
 *   <App />
 * </LinkProvider>
 * ```
 */
export function LinkProvider({
  router,
  externalLinks = "same-tab",
  isClientRoute,
  origin,
  children,
}: LinkProviderProps) {
  const value = useMemo<LinkConfig>(
    () => ({ router, externalLinks, isClientRoute, origin }),
    [router, externalLinks, isClientRoute, origin],
  );

  return (
    <LinkConfigContext.Provider value={value}>
      {children}
    </LinkConfigContext.Provider>
  );
}

// A scheme, or two leading slashes/backslashes in any mix ("//", "/\\", "\\\\"),
// after optional leading whitespace/control characters that URL parsing strips.
const ABSOLUTE_HREF_PATTERN =
  // oxlint-disable-next-line no-control-regex
  /^[\u0000-\u0020]*(?:[a-z][a-z\d+.-]*:|[\\/]{2})/i;
// Characters the URL parser removes or rewrites. Hrefs containing them are
// passed to the router as a normalized path rather than as written.
const NORMALIZED_HREF_PATTERN = /[\\\t\n\r]/;
// Base for parsing relative URLs when no `origin` is configured. `.invalid`
// is reserved, so no real link shares this origin.
const PLACEHOLDER_ORIGIN = new URL("https://kumo.invalid");
const SAME_CONTEXT_TARGETS = new Set(["_self", "_parent", "_top"]);

function parseOrigin(origin: string | undefined): URL | undefined {
  if (!origin) return undefined;
  try {
    return new URL(origin);
  } catch {
    return undefined;
  }
}

type LinkDestination =
  | { kind: "internal"; url: URL; routerHref: string }
  | { kind: "external" }
  | { kind: "other" };

function classifyHref(
  href: string,
  appOrigin: URL | undefined,
): LinkDestination {
  const base = appOrigin ?? PLACEHOLDER_ORIGIN;

  let url: URL;
  try {
    url = new URL(href, base);
  } catch {
    return { kind: "other" };
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    return { kind: "other" };
  }

  // Classify by the parsed result, not the string: "/\\evil.com" and
  // "/\t/evil.com" look relative but resolve to another host.
  const looksAbsolute = ABSOLUTE_HREF_PATTERN.test(href);
  const isInternal =
    url.origin === base.origin && (appOrigin !== undefined || !looksAbsolute);

  if (!isInternal) {
    return { kind: "external" };
  }

  return {
    kind: "internal",
    url,
    routerHref:
      looksAbsolute || NORMALIZED_HREF_PATTERN.test(href)
        ? `${url.pathname}${url.search}${url.hash}`
        : href,
  };
}

export interface LinkResolutionInput {
  href?: string;
  target?: string;
  rel?: string;
  download?: AnchorHTMLAttributes<HTMLAnchorElement>["download"];
}

export interface ResolvedLinkTarget {
  /** Whether the configured router component renders this link. */
  useRouter: boolean;
  /** Destination to render. Same-origin absolute URLs become paths for the router. */
  href?: string;
  target?: string;
  rel?: string;
  /** Whether the resolved target opens a new browsing context. */
  opensInNewTab: boolean;
}

/** @internal Pure link resolution shared by `useLink`. Exported for tests. */
export function resolveLink(
  { href, target, rel, download }: LinkResolutionInput,
  config: Omit<LinkConfig, "router"> & { hasRouter: boolean },
): ResolvedLinkTarget {
  const destination =
    href === undefined
      ? undefined
      : classifyHref(href, parseOrigin(config.origin));

  const resolvedTarget =
    target ??
    (destination?.kind === "external" && config.externalLinks === "new-tab"
      ? "_blank"
      : undefined);

  const opensInNewTab =
    resolvedTarget !== undefined && !SAME_CONTEXT_TARGETS.has(resolvedTarget);

  const useRouter =
    config.hasRouter &&
    destination?.kind === "internal" &&
    download === undefined &&
    (resolvedTarget === undefined || resolvedTarget === "_self") &&
    (config.isClientRoute?.(destination.url) ?? true);

  return {
    useRouter,
    href:
      useRouter && destination?.kind === "internal"
        ? destination.routerHref
        : href,
    target: resolvedTarget,
    rel: rel ?? (opensInNewTab ? "noopener noreferrer" : undefined),
    opensInNewTab,
  };
}

/** Visual cue for links that open in a new tab. Decorative; the announcement is separate. */
function NewTabIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="1em"
      height="1em"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className="link-external-icon shrink-0"
      {...props}
    >
      <path d="M9 4H8.8C7.11984 4 6.27976 4 5.63803 4.32698C5.07354 4.6146 4.6146 5.07354 4.32698 5.63803C4 6.27976 4 7.11984 4 8.8V15.2C4 16.8802 4 17.7202 4.32698 18.362C4.6146 18.9265 5.07354 19.3854 5.63803 19.673C6.27976 20 7.11984 20 8.8 20H15.2C16.8802 20 17.7202 20 18.362 19.673C18.9265 19.3854 19.3854 18.9265 19.673 18.362C20 17.7202 20 16.8802 20 15.2V15" />
      <path d="M14 4H20M20 4V10M20 4L11 13" />
    </svg>
  );
}

export type UseLinkOptions = AnchorHTMLAttributes<HTMLAnchorElement> & {
  /**
   * Show the visible new-tab icon. The screen-reader announcement is always
   * included when the link opens in a new tab.
   * @default true
   */
  newTabIcon?: boolean;
};

/** Element returned by `useLink`: the provider's router component or `"a"`. */
export type LinkElementType =
  | "a"
  | ComponentType<
      AnchorHTMLAttributes<HTMLAnchorElement> & RefAttributes<HTMLAnchorElement>
    >;

export interface UseLinkResult {
  /** Render this element. Pass your `ref` to it. */
  Component: LinkElementType;
  /** Resolved anchor props, including `href`, `target`, `rel`, and accessible-name props. */
  linkProps: AnchorHTMLAttributes<HTMLAnchorElement>;
  /** Render inside `Component`, after the link content. `null` when the link stays in the current tab. */
  newTabCue: ReactNode;
  /** Whether the link opens in a new tab. */
  opensInNewTab: boolean;
}

/**
 * Resolves a link the same way Kumo's `Link` does, for custom link UI such as
 * cards. Render `Component` with `linkProps` and place `newTabCue` inside it.
 *
 * @example
 * ```tsx
 * function ZoneCard({ href, name }: { href: string; name: string }) {
 *   const { Component, linkProps, newTabCue } = useLink({ href });
 *   return (
 *     <Component {...linkProps} className="block rounded-lg bg-kumo-elevated p-4">
 *       {name}{newTabCue}
 *     </Component>
 *   );
 * }
 * ```
 */
export function useLink({
  newTabIcon = true,
  ...props
}: UseLinkOptions): UseLinkResult {
  const config = useContext(LinkConfigContext);
  const { link: translations } = useKumoLocale();
  const cueId = useId();

  const resolved = resolveLink(props, {
    externalLinks: config.externalLinks,
    isClientRoute: config.isClientRoute,
    origin: config.origin,
    hasRouter: config.router !== undefined,
  });

  const announcement = translations.opensInNewTab;
  const {
    "aria-label": ariaLabel,
    "aria-labelledby": ariaLabelledBy,
    ...rest
  } = props;

  const linkProps: AnchorHTMLAttributes<HTMLAnchorElement> = {
    ...rest,
    href: resolved.href,
    target: resolved.target,
    rel: resolved.rel,
    "aria-label":
      ariaLabel && resolved.opensInNewTab && !ariaLabelledBy
        ? `${ariaLabel} ${announcement}`
        : ariaLabel,
    "aria-labelledby":
      ariaLabelledBy && resolved.opensInNewTab
        ? `${ariaLabelledBy} ${cueId}`
        : ariaLabelledBy,
  };

  const newTabCue = resolved.opensInNewTab ? (
    <>
      {newTabIcon ? <NewTabIcon /> : null}
      <span id={cueId} className="sr-only" data-kumo-part="new-tab-cue">
        {` ${announcement}`}
      </span>
    </>
  ) : null;

  return {
    Component:
      resolved.useRouter && config.router
        ? (config.router as LinkElementType)
        : "a",
    linkProps,
    newTabCue,
    opensInNewTab: resolved.opensInNewTab,
  };
}

/**
 * @internal Renders children through `useLink`. Used by Kumo's link-like
 * components; not part of the public API.
 */
export const ResolvedLink = forwardRef<HTMLAnchorElement, UseLinkOptions>(
  function ResolvedLink({ children, ...props }, ref) {
    const { Component, linkProps, newTabCue } = useLink(props);
    return (
      <Component ref={ref} {...linkProps}>
        {children}
        {newTabCue}
      </Component>
    );
  },
);

ResolvedLink.displayName = "ResolvedLink";
