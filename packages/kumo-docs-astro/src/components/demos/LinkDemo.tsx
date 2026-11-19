import { Link, LinkProvider, useLink } from "@cloudflare/kumo";

export function LinkBasicDemo() {
  return (
    <div className="grid gap-x-6 gap-y-4 text-base md:grid-cols-3">
      <Link href="#">Default inline link</Link>
      <Link href="#" variant="current">
        Current color link
      </Link>
      <Link href="#" variant="plain">
        Plain inline link
      </Link>
    </div>
  );
}

export function LinkInParagraphDemo() {
  return (
    <p className="mx-auto max-w-md text-base leading-relaxed text-kumo-default">
      This is a paragraph with an <Link href="#">inline link</Link> that flows
      naturally with the surrounding text. Links maintain proper underline
      offset for readability.
    </p>
  );
}

/** Links that open in a new tab get an icon and a screen-reader announcement. */
export function LinkExternalDemo() {
  return (
    <Link href="https://cloudflare.com" target="_blank" className="text-base">
      Visit Cloudflare
    </Link>
  );
}

export function LinkCurrentVariantDemo() {
  return (
    <p className="text-base text-kumo-danger">
      This error message contains a{" "}
      <Link href="#" variant="current">
        link
      </Link>{" "}
      that inherits the red color from its parent.
    </p>
  );
}

/** `externalLinks="new-tab"` opens every external link in a new tab. */
export function LinkNewTabPolicyDemo() {
  return (
    <LinkProvider externalLinks="new-tab">
      <div className="flex flex-col gap-x-6 gap-y-4 text-base md:flex-row">
        <Link href="#">Internal link</Link>
        <Link href="https://developers.cloudflare.com">External link</Link>
        <Link href="https://developers.cloudflare.com" target="_self">
          External, same tab
        </Link>
      </div>
    </LinkProvider>
  );
}

function ZoneCard({ href, name }: { href: string; name: string }) {
  const { Component, linkProps, newTabCue } = useLink({ href });
  return (
    <Component
      {...linkProps}
      className="flex items-center gap-1 rounded-lg bg-kumo-elevated p-4 text-kumo-default no-underline ring ring-kumo-hairline"
    >
      {name}
      {newTabCue}
    </Component>
  );
}

/** `useLink` resolves a link for custom UI such as cards. */
export function LinkUseLinkDemo() {
  return (
    <LinkProvider externalLinks="new-tab">
      <div className="grid gap-3 text-base md:grid-cols-2">
        <ZoneCard href="#" name="example.com" />
        <ZoneCard href="https://www.cloudflare.com" name="cloudflare.com" />
      </div>
    </LinkProvider>
  );
}
