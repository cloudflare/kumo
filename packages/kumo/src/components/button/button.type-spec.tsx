/** Type regressions checked by the package's `tsc --noEmit`, not Vitest. */
import {
  createRef,
  type ComponentPropsWithRef,
  type ReactElement,
} from "react";
import { Button, type ButtonProps } from "./button";
import { Banner, type BannerActionProps } from "../banner/banner";

const buttonRef = createRef<HTMLButtonElement>();
const anchorRef = createRef<HTMLAnchorElement>();
const elementRef = createRef<HTMLElement>();

const nativeButton = (
  <Button
    ref={buttonRef}
    onClick={(event) => {
      event.currentTarget.disabled = true;
    }}
  >
    Save
  </Button>
);

const nativeAction = (
  <Banner.Action
    ref={(node) => {
      node?.checkValidity();
    }}
    onClick={(event) => {
      event.currentTarget.disabled = true;
    }}
  >
    Save
  </Banner.Action>
);

const composedButton = (
  <Button
    ref={elementRef}
    render={<a href="/billing" />}
    onClick={(event) => {
      event.currentTarget.focus();
      // @ts-expect-error - a composed element is not necessarily a button.
      event.currentTarget.disabled = true;
    }}
  >
    Manage payments
  </Button>
);

const composedAction = (
  <Banner.Action
    ref={(node) => {
      node?.focus();
      // @ts-expect-error - a composed ref does not promise button methods.
      node?.checkValidity();
    }}
    render={
      <a
        ref={anchorRef}
        href="/billing"
        onClick={(event) => {
          event.currentTarget.href = "/billing";
        }}
      />
    }
    onClick={(event) => {
      event.currentTarget.focus();
      // @ts-expect-error - composed actions use HTMLElement events.
      event.currentTarget.disabled = true;
    }}
  >
    Manage payments
  </Banner.Action>
);

const renderCallback = (
  <Banner.Action
    render={(props) => (
      <a
        {...props}
        href="/billing"
        onClick={(event) => {
          props.onClick?.(event);
          const forwardedEvent: Parameters<
            NonNullable<typeof props.onClick>
          >[0] = event;
          // @ts-expect-error - render callback handlers also use HTMLElement.
          forwardedEvent.currentTarget.disabled = true;
        }}
      />
    )}
  >
    Manage payments
  </Banner.Action>
);

function RouterLink({
  to,
  ...props
}: ComponentPropsWithRef<"a"> & { to: string }) {
  return <a href={to} {...props} />;
}

const routerAction = (
  <Banner.Action
    render={<RouterLink to="/billing" />}
    onKeyDown={(event) => {
      event.currentTarget.focus();
      // @ts-expect-error - router components do not promise button-only targets.
      event.currentTarget.disabled = true;
    }}
  >
    Manage payments
  </Banner.Action>
);

const buttonRenderCallback = (
  <Button
    render={(props) => <a {...props} href="/billing" />}
    ref={(node) => {
      node?.focus();
      // @ts-expect-error - callback composition uses HTMLElement refs.
      node?.checkValidity();
    }}
  >
    Manage payments
  </Button>
);

function OptionalRenderButton({ render }: { render?: ReactElement }) {
  return (
    <Button
      render={render}
      onClick={(event) => {
        event.currentTarget.focus();
        // @ts-expect-error - an optional render prop can still replace the button.
        event.currentTarget.disabled = true;
      }}
    >
      Save
    </Button>
  );
}

const composedButtonProps: ButtonProps<ReactElement> = {
  render: <a href="/billing" />,
  ref: anchorRef,
  onClick: (event) => {
    // @ts-expect-error - exported props must not claim button-only event targets.
    event.currentTarget.disabled = true;
  },
};

const composedActionProps: BannerActionProps<ReactElement> = {
  render: <a href="/billing" />,
  ref: anchorRef,
  onClick: (event) => {
    // @ts-expect-error - BannerActionProps preserve the composed event type.
    event.currentTarget.disabled = true;
  },
};

const spreadButtonProps = <Button {...composedButtonProps} />;
const spreadActionProps = <Banner.Action {...composedActionProps} />;

// @ts-expect-error - native buttons cannot receive an anchor ref.
const invalidNativeRef = <Button ref={anchorRef}>Save</Button>;
const invalidNativeActionRef = (
  // @ts-expect-error - native banner actions cannot receive an anchor ref.
  <Banner.Action ref={anchorRef}>Save</Banner.Action>
);
const unlabeledIconAction = (
  // @ts-expect-error - composition must preserve the icon-only accessible-name requirement.
  <Banner.Action shape="square" render={<a href="/billing" />} />
);

export const __typeSpec = {
  nativeButton,
  nativeAction,
  composedButton,
  composedAction,
  renderCallback,
  routerAction,
  buttonRenderCallback,
  OptionalRenderButton,
  composedButtonProps,
  composedActionProps,
  spreadButtonProps,
  spreadActionProps,
  invalidNativeRef,
  invalidNativeActionRef,
  unlabeledIconAction,
};
