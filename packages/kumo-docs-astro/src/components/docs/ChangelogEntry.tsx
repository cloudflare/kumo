import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@cloudflare/kumo";
import { Text, Link } from "@cloudflare/kumo";

const GITHUB_COMMIT_URL = "https://github.com/cloudflare/kumo/commit/";

const proseStyles = cn(
  "kumo-prose prose prose-sm max-w-none flex-1",
  "[&>:first-child]:mt-0 [&>:last-child]:mb-0",
  "[&_h1]:text-xl [&_h1]:font-semibold [&_h1]:text-kumo-default",
  "[&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-kumo-default",
  "[&_h3]:text-base [&_h3]:font-semibold [&_h3]:text-kumo-default",
  "[&_p]:text-kumo-default",
  "[&_pre]:overflow-x-auto",
);

interface ChangelogEntryProps {
  hash: string;
  text: string;
}

export function ChangelogEntry({ hash, text }: ChangelogEntryProps) {
  return (
    <li className="flex flex-col gap-1 mb-3 last:mb-0 md:mb-0 md:flex-row md:items-baseline md:gap-3.5">
      <Link
        href={`${GITHUB_COMMIT_URL}${hash}`}
        target="_blank"
        variant="plain"
        className="shrink-0 text-xs !text-kumo-subtle !decoration-kumo-subtle"
      >
        <Text as="span" variant="mono-secondary">
          {hash}
        </Text>
      </Link>
      <div className={proseStyles}>
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{text}</ReactMarkdown>
      </div>
    </li>
  );
}
