import { useState, useEffect, useCallback, useRef } from "react";
import { Dialog, cn, Loader } from "@cloudflare/kumo";
import { MagnifyingGlassIcon, FileTextIcon } from "@phosphor-icons/react";

export interface SearchResult {
  url: string;
  content: string;
  excerpt: string;
  meta: {
    title?: string;
  };
  sub_results?: Array<{
    title: string;
    url: string;
    excerpt: string;
  }>;
}

interface PagefindResult {
  id: string;
  score: number;
  data: () => Promise<SearchResult>;
}

interface PagefindSearchResponse {
  results: PagefindResult[];
}

interface Pagefind {
  init: () => void;
  options: (opts: Record<string, unknown>) => Promise<void>;
  search: (query: string) => Promise<PagefindSearchResponse>;
  debouncedSearch: (
    query: string,
    options?: Record<string, unknown>,
    ms?: number,
  ) => Promise<PagefindSearchResponse | null>;
}

interface SearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/** Extract a readable title from a URL path */
function getTitleFromUrl(url: string): string {
  return (
    url
      .replace(/^\//, "")
      .replace(/\/$/, "")
      .split("/")
      .pop()
      ?.replace(/-/g, " ")
      ?.replace(/\b\w/g, (c) => c.toUpperCase()) || url
  );
}

/** Extract category from URL path (e.g., "components" from "/components/button") */
function getCategoryFromUrl(url: string): string | null {
  const parts = url.split("/").filter(Boolean);
  return parts.length > 1 ? parts[0] : null;
}

export function SearchDialog({ open, onOpenChange }: SearchDialogProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [pagefind, setPagefind] = useState<Pagefind | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  // Initialize pagefind
  useEffect(() => {
    async function initPagefind() {
      try {
        const pagefindUrl = new URL(
          "/pagefind/pagefind.js",
          window.location.origin,
        ).href;
        const pf = await import(/* @vite-ignore */ pagefindUrl);
        pf.init();
        await pf.options({
          basePath: "/pagefind/",
          ranking: {
            termFrequency: 1.0,
            termSimilarity: 1.0,
            pageLength: 0,
            termSaturation: 0.5,
          },
        });
        setPagefind(pf as Pagefind);
        setError(null);
      } catch (err) {
        console.warn("Pagefind not available:", err);
        setError(
          "Search not available. Run `pnpm build` first to enable search.",
        );
      }
    }
    initPagefind();
  }, []);

  // Search when query changes
  useEffect(() => {
    if (!pagefind || !query.trim()) {
      setResults([]);
      return;
    }

    let cancelled = false;
    setLoading(true);

    async function doSearch() {
      try {
        const response = await pagefind!.debouncedSearch(query, {}, 300);
        if (cancelled || !response) return;

        const searchResults = await Promise.all(
          response.results.slice(0, 10).map(async (result) => {
            const data = await result.data();
            return data;
          }),
        );

        if (!cancelled) {
          setResults(searchResults);
          setSelectedIndex(0);
        }
      } catch (err) {
        console.error("Search failed:", err);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    doSearch();

    return () => {
      cancelled = true;
    };
  }, [query, pagefind]);

  // Reset state when dialog opens/closes
  useEffect(() => {
    if (open) {
      setQuery("");
      setResults([]);
      setSelectedIndex(0);
      // Focus input after dialog animation
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((i) => Math.min(i + 1, results.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((i) => Math.max(i - 1, 0));
      } else if (e.key === "Enter" && results[selectedIndex]) {
        e.preventDefault();
        window.location.href = results[selectedIndex].url;
        onOpenChange(false);
      } else if (e.key === "Escape") {
        onOpenChange(false);
      }
    },
    [results, selectedIndex, onOpenChange],
  );

  // Scroll selected item into view
  useEffect(() => {
    const container = resultsRef.current;
    const selected = container?.querySelector(
      `[data-index="${selectedIndex}"]`,
    );
    if (selected) {
      selected.scrollIntoView({ block: "nearest" });
    }
  }, [selectedIndex]);

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog
        size="lg"
        className="flex max-h-[80vh] flex-col overflow-hidden p-0"
      >
        {/* Search input */}
        <div className="flex items-center gap-3 border-b border-kumo-line p-4">
          <MagnifyingGlassIcon
            size={20}
            className="shrink-0 text-kumo-subtle"
          />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search documentation..."
            className="flex-1 bg-transparent text-base text-kumo-default outline-none placeholder:text-kumo-subtle"
            aria-label="Search documentation"
          />
          {loading && <Loader size="sm" />}
          <kbd className="hidden items-center gap-1 rounded border border-kumo-line bg-kumo-control px-2 py-1 text-xs text-kumo-subtle sm:inline-flex">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div ref={resultsRef} className="min-h-[300px] flex-1 overflow-y-auto">
          {error ? (
            <div className="flex h-full flex-col items-center justify-center p-8 text-center text-kumo-subtle">
              <FileTextIcon size={48} className="mb-4 opacity-50" />
              <p>{error}</p>
            </div>
          ) : !query.trim() ? (
            <div className="flex h-full flex-col items-center justify-center p-8 text-center text-kumo-subtle">
              <FileTextIcon size={48} className="mb-4 opacity-50" />
              <p>Type to search documentation</p>
            </div>
          ) : results.length === 0 && !loading ? (
            <div className="flex h-full flex-col items-center justify-center p-8 text-center text-kumo-subtle">
              <FileTextIcon size={48} className="mb-4 opacity-50" />
              <p>No results found for "{query}"</p>
            </div>
          ) : loading && results.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center p-8 text-center text-kumo-subtle">
              <Loader size="base" />
              <p className="mt-4">Searching...</p>
            </div>
          ) : (
            <ul className="divide-y divide-kumo-line">
              {results.map((result, index) => {
                const displayTitle =
                  result.meta?.title || getTitleFromUrl(result.url);
                const category = getCategoryFromUrl(result.url);

                return (
                  <li key={result.url}>
                    <a
                      href={result.url}
                      data-index={index}
                      onClick={() => onOpenChange(false)}
                      className={cn(
                        "block px-4 py-3 transition-colors",
                        index === selectedIndex
                          ? "bg-kumo-tint"
                          : "hover:bg-kumo-control",
                      )}
                    >
                      <div className="mb-1 flex items-center gap-2">
                        {category && (
                          <span className="text-xs text-kumo-subtle capitalize">
                            {category}
                          </span>
                        )}
                        {category && (
                          <span className="text-kumo-subtle">/</span>
                        )}
                        <h3 className="font-medium text-kumo-default">
                          {displayTitle}
                        </h3>
                      </div>
                      {result.excerpt && (
                        <p
                          className="line-clamp-2 text-sm text-kumo-strong [&_mark]:rounded-sm [&_mark]:bg-kumo-warning-tint [&_mark]:px-0.5 [&_mark]:text-kumo-default"
                          dangerouslySetInnerHTML={{ __html: result.excerpt }}
                        />
                      )}
                    </a>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Footer */}
        {results.length > 0 && (
          <div className="flex items-center justify-between border-t border-kumo-line bg-kumo-control px-4 py-2 text-xs text-kumo-subtle">
            <span>
              {results.length} result{results.length === 1 ? "" : "s"}
            </span>
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <kbd className="rounded border border-kumo-line bg-kumo-base px-1.5 py-0.5">
                  ↑
                </kbd>
                <kbd className="rounded border border-kumo-line bg-kumo-base px-1.5 py-0.5">
                  ↓
                </kbd>
                <span>to navigate</span>
              </span>
              <span className="flex items-center gap-1">
                <kbd className="rounded border border-kumo-line bg-kumo-base px-1.5 py-0.5">
                  ↵
                </kbd>
                <span>to select</span>
              </span>
            </div>
          </div>
        )}
      </Dialog>
    </Dialog.Root>
  );
}
