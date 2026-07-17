import { LinkButton } from "@cloudflare/kumo";
import { ArrowSquareOutIcon, BookOpenIcon } from "@phosphor-icons/react";

/** Default LinkButton — anchor styled as a button. */
export function LinkButtonBasicDemo() {
  return <LinkButton href="/components/link">Read Link docs</LinkButton>;
}

/** Variants follow Button's classes; default is `"ghost"`. */
export function LinkButtonVariantsDemo() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <LinkButton href="/components/link" variant="primary">
        Primary
      </LinkButton>
      <LinkButton href="/components/link" variant="secondary">
        Secondary
      </LinkButton>
      <LinkButton href="/components/link" variant="ghost">
        Ghost
      </LinkButton>
    </div>
  );
}

/** `external` opens in a new tab with `rel="noopener noreferrer"`. */
export function LinkButtonExternalDemo() {
  return (
    <LinkButton
      href="https://developers.cloudflare.com"
      variant="ghost"
      icon={ArrowSquareOutIcon}
      external
    >
      Cloudflare Docs
    </LinkButton>
  );
}

/** With an icon — same `icon` prop as `Button`. */
export function LinkButtonWithIconDemo() {
  return (
    <LinkButton href="/components/link" variant="secondary" icon={BookOpenIcon}>
      Read the docs
    </LinkButton>
  );
}
