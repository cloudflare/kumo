import {
  createContext,
  forwardRef,
  type AnchorHTMLAttributes,
  type ForwardRefExoticComponent,
  type ReactNode,
  type RefAttributes,
  useContext,
} from "react";

type LinkComponentProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  /**
   * @deprecated Use `href` instead. The `to` prop is a routing-framework concept
   * (e.g. React Router) that does not belong on a presentational component.
   *
   * If your application uses a client-side router, configure the `LinkProvider`
   * with a wrapper component that maps `href` to your router's navigation prop:
   *
   * ```tsx
   * const AppLink = forwardRef(({ href, ...rest }, ref) => (
   *   <ReactRouterLink ref={ref} to={href} {...rest} />
   * ));
   *
   * <LinkProvider component={AppLink}>
   *   <App />
   * </LinkProvider>
   * ```
   */
  to?: string;
};

const DefaultLinkComponent = forwardRef<HTMLAnchorElement, LinkComponentProps>(
  function DefaultAnchor({ to, href, ...rest }, ref) {
    // Children and other content props are passed via ...rest spread
    // oxlint-disable-next-line anchor-has-content
    return <a ref={ref} href={href ?? to ?? undefined} {...rest} />;
  },
);

type ForwardLinkComponent = ForwardRefExoticComponent<
  LinkComponentProps & RefAttributes<HTMLAnchorElement>
>;

const LinkComponentContext =
  createContext<ForwardLinkComponent>(DefaultLinkComponent);

export function useLinkComponent() {
  return useContext(LinkComponentContext);
}

/**
 * Provides a custom link component for all Kumo Link instances in the tree.
 *
 * Use this to integrate framework-specific routing (React Router, Next.js, etc.)
 * while keeping Kumo's Link component framework-agnostic.
 *
 * Your custom component receives standard anchor props (including `href`) and
 * is responsible for bridging to your router's API:
 *
 * @example React Router integration
 * ```tsx
 * import { Link as ReactRouterLink } from "react-router-dom";
 *
 * const AppLink = forwardRef<HTMLAnchorElement, LinkComponentProps>(
 *   ({ href, ...rest }, ref) => (
 *     <ReactRouterLink ref={ref} to={href ?? ""} {...rest} />
 *   ),
 * );
 *
 * <LinkProvider component={AppLink}>
 *   <App />
 * </LinkProvider>
 * ```
 *
 * @example Next.js integration
 * ```tsx
 * import NextLink from "next/link";
 *
 * const AppLink = forwardRef<HTMLAnchorElement, LinkComponentProps>(
 *   (props, ref) => <NextLink ref={ref} {...props} />,
 * );
 *
 * <LinkProvider component={AppLink}>
 *   <App />
 * </LinkProvider>
 * ```
 */
export function LinkProvider({
  component,
  children,
}: {
  component?: ForwardLinkComponent;
  children: ReactNode;
}) {
  return (
    <LinkComponentContext.Provider value={component ?? DefaultLinkComponent}>
      {children}
    </LinkComponentContext.Provider>
  );
}

export type { LinkComponentProps };
