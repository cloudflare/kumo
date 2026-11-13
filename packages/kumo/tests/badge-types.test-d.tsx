import { CheckCircleIcon } from "@phosphor-icons/react";
import { expectTypeOf } from "vite-plus/test";
import { Badge, type BadgeProps } from "../src/components/badge/badge";

type DotBadgeProps = Extract<BadgeProps, { appearance: "dot" }>;

expectTypeOf<Required<DotBadgeProps>["icon"]>().toEqualTypeOf<never>();

function FilledBadgeWithIcon() {
  return <Badge icon={CheckCircleIcon}>Verified</Badge>;
}

function ExplicitFilledBadgeWithIcon() {
  return (
    <Badge appearance="filled" icon={CheckCircleIcon}>
      Verified
    </Badge>
  );
}

function DotBadgeWithoutIcon() {
  return (
    <Badge appearance="dot" variant="success">
      Healthy
    </Badge>
  );
}

function DotBadgeWithIcon() {
  return (
    // @ts-expect-error Dot badges use their status dot instead of an icon.
    <Badge appearance="dot" icon={CheckCircleIcon} variant="success">
      Healthy
    </Badge>
  );
}

export {
  DotBadgeWithIcon,
  DotBadgeWithoutIcon,
  ExplicitFilledBadgeWithIcon,
  FilledBadgeWithIcon,
};
