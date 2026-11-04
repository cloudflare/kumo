import { Link } from "@cloudflare/kumo";
import { BookIcon } from "@phosphor-icons/react";

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

export function LinkExternalDemo() {
  return (
    <Link href="https://cloudflare.com" external className="text-base">
      Visit Cloudflare
    </Link>
  );
}

/** Icon-only links use explicit accessible names instead of a title fallback. */
export function LinkIconOnlyDemo() {
  return (
    <Link
      href="https://developers.cloudflare.com"
      external
      title="Documentation"
      aria-label="Documentation (opens in a new tab)"
      className="text-base"
    >
      <BookIcon aria-hidden="true" size={20} />
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

// Helper component simulating a framework link (e.g., React Router's Link)
const CustomRouterLink = ({
  children,
  ...props
}: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
  <a data-custom-router-link {...props}>
    {children}
  </a>
);

export function LinkRenderDemo() {
  return (
    <div className="flex flex-col gap-x-6 gap-y-4 text-base md:flex-row">
      <Link render={<CustomRouterLink href="/dashboard" />} variant="inline">
        Dashboard (via render)
      </Link>
      <Link
        render={
          <CustomRouterLink
            href="https://developers.cloudflare.com"
            target="_blank"
            rel="noopener noreferrer"
          />
        }
        variant="inline"
      >
        Cloudflare Docs <Link.ExternalIcon />
      </Link>
    </div>
  );
}
