import { GearIcon } from "@phosphor-icons/react";
import { expectTypeOf } from "vite-plus/test";
import {
  Button,
  type ButtonElementProps,
  type ButtonLinkProps,
} from "./button";

type ButtonWrapperProps = Omit<ButtonElementProps, "variant">;

expectTypeOf<ButtonWrapperProps["form"]>().toEqualTypeOf<string | undefined>();
expectTypeOf<ButtonWrapperProps["name"]>().toEqualTypeOf<string | undefined>();
expectTypeOf<ButtonWrapperProps["type"]>().toEqualTypeOf<
  "submit" | "reset" | "button" | undefined
>();
expectTypeOf<ButtonLinkProps["href"]>().toEqualTypeOf<string>();

function ButtonOrLink({ url }: { url: string | undefined }) {
  return url ? (
    <Button href={url}>Open</Button>
  ) : (
    <Button disabled>Open</Button>
  );
}

function IconOnlyLinkWithoutName() {
  // @ts-expect-error icon-only links need aria-label, aria-labelledby, or title
  return <Button href="/settings" shape="square" icon={GearIcon} />;
}

export { ButtonOrLink, IconOnlyLinkWithoutName };
