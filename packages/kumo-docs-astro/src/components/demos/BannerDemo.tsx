import { Banner, Text, Link } from "@cloudflare/kumo";
import { Info, WarningCircle, Warning, X } from "@phosphor-icons/react";

/** Shows all banner variants with structured title and description. */
export function BannerVariantsDemo() {
  return (
    <div className="w-full space-y-3">
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
      <Banner
        icon={<Info weight="fill" />}
        variant="secondary"
        title="Maintenance scheduled"
        description="This service will be unavailable for 10 minutes."
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

/** Neutral secondary banner for contextual messages. */
export function BannerSecondaryDemo() {
  return (
    <Banner
      icon={<Info weight="fill" />}
      variant="secondary"
      title="Maintenance scheduled"
      description="This service will be unavailable for 10 minutes."
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

/** Banner with action buttons: CTA and dismissable. */
export function BannerWithActionDemo() {
  return (
    <div className="w-full space-y-3">
      <Banner
        icon={<Info weight="fill" />}
        title="Update available"
        description="A new version is ready to install."
        action={
          <>
            <Banner.Action>Update</Banner.Action>
            <Banner.Action variant="ghost" icon={<X />} aria-label="Dismiss" />
          </>
        }
      />
      <Banner
        variant="error"
        icon={<WarningCircle weight="fill" />}
        title="Save failed"
        description="We couldn't save your changes. Please try again."
        action={
          <>
            <Banner.Action>Retry</Banner.Action>
            <Banner.Action variant="ghost" icon={<X />} aria-label="Dismiss" />
          </>
        }
      />
      <Banner
        variant="alert"
        icon={<WarningCircle weight="fill" />}
        title="Save failed"
        description="We couldn't save your changes. Please try again."
        action={
          <>
            <Banner.Action>Retry</Banner.Action>
            <Banner.Action variant="ghost" icon={<X />} aria-label="Dismiss" />
          </>
        }
      />
      <Banner
        variant="secondary"
        icon={<WarningCircle weight="fill" />}
        title="Save failed"
        description="We couldn't save your changes. Please try again."
        action={
          <>
            <Banner.Action>Retry</Banner.Action>
            <Banner.Action variant="ghost" icon={<X />} aria-label="Dismiss" />
          </>
        }
      />
    </div>
  );
}

/** Banner with multiple action buttons. */
export function BannerWithActionsDemo() {
  return (
    <div className="space-y-3 w-full">
      <Banner
        icon={<Warning weight="fill" />}
        variant="error"
        title="Your account is 90 days past due."
        description="Pay now to avoid interruption."
        action={
          <>
            <Banner.Action>Pay now</Banner.Action>
            <Banner.Action variant="secondary">Go to billing</Banner.Action>
          </>
        }
      />
    </div>
  );
}

/* Accent-aware CTAs via the `Banner.Action` compound. */
export function BannerActionCompoundDemo() {
  return (
    <div className="w-full space-y-3">
      <Banner
        icon={<Info weight="fill" />}
        title="Update available"
        description="A new version is ready to install."
        action={
          <>
            <Banner.Action>Update</Banner.Action>
            <Banner.Action variant="ghost" icon={<X />} aria-label="Dismiss" />
          </>
        }
      />
      <Banner
        variant="alert"
        icon={<Warning weight="fill" />}
        title="Session expiring"
        description="Your session will expire in 5 minutes."
        action={
          <>
            <Banner.Action>Extend</Banner.Action>
            <Banner.Action variant="ghost" icon={<X />} aria-label="Dismiss" />
          </>
        }
      />
      <Banner
        variant="error"
        icon={<WarningCircle weight="fill" />}
        title="Save failed"
        description="We couldn't save your changes. Please try again."
        action={
          <>
            <Banner.Action>Retry</Banner.Action>
            <Banner.Action variant="ghost" icon={<X />} aria-label="Dismiss" />
          </>
        }
      />
      <Banner
        variant="secondary"
        icon={<Info weight="fill" />}
        title="Heads up"
        description="This is a secondary informational banner."
        action={
          <>
            <Banner.Action>Got it</Banner.Action>
            <Banner.Action variant="ghost" icon={<X />} aria-label="Dismiss" />
          </>
        }
      />
    </div>
  );
}

/**
 * Compact `size="sm"` banner for dialogs and other tight spaces.
 */
export function BannerCompactDemo() {
  return (
    <Banner
      size="sm"
      description="A DNS record for puppies.cloudflare.dev already exists in this zone."
      action={<Link href="#">Manage DNS for puppies.cloudflare.dev</Link>}
    />
  );
}

/** Compact banner with a trailing CTA. */
export function BannerCompactWithCtaDemo() {
  return (
    <Banner
      size="sm"
      description="A DNS record for puppies.cloudflare.dev already exists in this zone."
      action={
        <>
          <Banner.Action>Manage DNS</Banner.Action>
          <Banner.Action variant="ghost">
            <X />
          </Banner.Action>
        </>
      }
    />
  );
}

/** Compact banner without an action. */
export function BannerCompactWithoutActionDemo() {
  return (
    <Banner
      size="sm"
      description="A DNS record for puppies.cloudflare.dev already exists in this zone."
    />
  );
}

/** Legacy banner using children prop (backwards compatible). */
export function BannerLegacyDemo() {
  return (
    <Banner icon={<Info />}>This is a simple banner using children.</Banner>
  );
}
