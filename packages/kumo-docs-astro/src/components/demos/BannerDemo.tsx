import { Banner, Text } from "@cloudflare/kumo";
import { Info, WarningCircle, Warning } from "@phosphor-icons/react";

/** Shows all banner variants with structured title and description. */
export function BannerVariantsDemo() {
  return (
    <div className="space-y-3">
      <Banner
        icon={<Info weight="fill" />}
        title="Update available"
        description="A new version is ready to install."
      />
      <Banner
        icon={<Warning weight="fill" />}
        variant="alert"
        title="Session expiring"
        description="Your session will expire in 5 minutes."
      />
      <Banner
        icon={<WarningCircle weight="fill" />}
        variant="error"
        title="Save failed"
        description="We couldn't save your changes. Please try again."
      />
    </div>
  );
}

/** Default informational banner with title and description. */
export function BannerDefaultDemo() {
  return (
    <Banner
      icon={<Info weight="fill" />}
      title="Update available"
      description="A new version is ready to install."
    />
  );
}

/** Alert banner for warnings that need attention. */
export function BannerAlertDemo() {
  return (
    <Banner
      icon={<Warning weight="fill" />}
      variant="alert"
      title="Session expiring"
      description="Your session will expire in 5 minutes."
    />
  );
}

/** Error banner for critical issues. */
export function BannerErrorDemo() {
  return (
    <Banner
      icon={<WarningCircle weight="fill" />}
      variant="error"
      title="Save failed"
      description="We couldn't save your changes. Please try again."
    />
  );
}

/** Banner with title only (no description). */
export function BannerTitleOnlyDemo() {
  return (
    <Banner
      icon={<Info weight="fill" />}
      title="Your changes have been saved."
    />
  );
}

/** Banner with custom icon and structured content. */
export function BannerWithIconDemo() {
  return (
    <Banner
      icon={<Warning weight="fill" />}
      variant="alert"
      title="Review required"
      description="Please review your billing information before proceeding."
    />
  );
}

/** Banner with custom React content in description. */
export function BannerCustomContentDemo() {
  return (
    <Banner
      icon={<Info weight="fill" />}
      title="Custom content supported"
      description={
        <Text DANGEROUS_className="text-inherit">
          This banner supports <strong>custom content</strong> with Text.
        </Text>
      }
    />
  );
}

/** Legacy banner using children prop (backwards compatible). */
export function BannerLegacyDemo() {
  return (
    <Banner icon={<Info />}>This is a simple banner using children.</Banner>
  );
}
