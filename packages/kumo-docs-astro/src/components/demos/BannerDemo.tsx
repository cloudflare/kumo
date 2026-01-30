import { Banner, Text } from "@cloudflare/kumo";
import { Info, WarningCircle } from "@phosphor-icons/react";

export function BannerVariantsDemo() {
  return (
    <div className="space-y-3">
      <Banner>This is an informational banner.</Banner>
      <Banner variant="alert">This is an alert banner.</Banner>
      <Banner variant="error">This is an error banner.</Banner>
    </div>
  );
}

export function BannerDefaultDemo() {
  return <Banner>This is an informational banner.</Banner>;
}

export function BannerAlertDemo() {
  return <Banner variant="alert">Your session will expire soon.</Banner>;
}

export function BannerErrorDemo() {
  return <Banner variant="error">We couldn't save your changes.</Banner>;
}

export function BannerWithIconDemo() {
  return (
    <Banner icon={<WarningCircle />} variant="alert">
      Review your billing information.
    </Banner>
  );
}

export function BannerCustomContentDemo() {
  return (
    <Banner icon={<Info />}>
      <Text DANGEROUS_className="text-inherit">
        This banner supports <strong>custom content</strong> with Text.
      </Text>
    </Banner>
  );
}
