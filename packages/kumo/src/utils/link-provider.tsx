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
