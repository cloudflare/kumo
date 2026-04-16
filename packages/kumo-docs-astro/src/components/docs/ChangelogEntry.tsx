import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@cloudflare/kumo";
import { Text } from "@cloudflare/kumo";

const GITHUB_COMMIT_URL = "https://github.com/cloudflare/kumo/commit/";

// Override prose defaults for rendered markdown inside changelog entries.
const proseStyles = cn(
  "kumo-prose prose prose-sm max-w-none flex-1",
  "[&>:first-child]:mt-0 [&>:last-child]:mb-0",
  "[&_h1]:text-xl [&_h2]:text-lg [&_h3]:text-base",
  "[&_:is(h1,h2,h3)]:font-semibold [&_:is(h1,h2,h3)]:text-kumo-default",
  "[&_pre]:overflow-x-auto [&_pre]:text-base",
);

interface ChangelogEntryProps {
  hash: string;
  text: string;
}

export function ChangelogEntry({ hash, text }: ChangelogEntryProps) {
  return (
    <li className="flex flex-col gap-1 mb-3 last:mb-0 md:mb-0 md:flex-row md:items-baseline md:gap-3.5">
      <a
        href={`${GITHUB_COMMIT_URL}${hash}`}
        target="_blank"
        rel="noopener noreferrer"
        className="shrink-0 text-xs text-kumo-subtle hover:text-kumo-strong transition-colors"
      >
        <Text as="span" variant="mono-secondary">
          {hash}
        </Text>
      </a>
      <div className={proseStyles}>
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{text}</ReactMarkdown>
      </div>
    </li>
  );
}
