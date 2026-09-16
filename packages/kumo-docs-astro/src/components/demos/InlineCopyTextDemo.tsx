import { InlineCopyText } from "@cloudflare/kumo";

/** Compact copy control for a short identifier. */
export function InlineCopyTextBasicDemo() {
  return (
    <InlineCopyText
      labels={{ copyAction: "Copy database ID", copied: "Database ID copied" }}
    >
      f86b3f10-32e9-4db7-ae95-84a1b2c3d4e5
    </InlineCopyText>
  );
}

/** Inline copy text inside a dense, hoverable resource row. */
export function InlineCopyTextResourceRowDemo() {
  return (
    <div className="group flex w-full max-w-xl items-center justify-between gap-4 rounded-lg bg-kumo-base px-4 py-3 ring ring-kumo-line">
      <span className="min-w-0 truncate text-sm text-kumo-default">
        Production database
      </span>
      <InlineCopyText
        labels={{
          copyAction: "Copy database ID",
          copied: "Database ID copied",
        }}
      >
        f86b3f10-32e9-4db7-ae95-84a1b2c3d4e5
      </InlineCopyText>
    </div>
  );
}

/** Display rich content while copying its underlying value. */
export function InlineCopyTextRichContentDemo() {
  return (
    <InlineCopyText
      value="f86b3f10-32e9-4db7-ae95-84a1b2c3d4e5"
      variant="body"
      labels={{ copyAction: "Copy database ID", copied: "Database ID copied" }}
    >
      <span>
        Database ID: <strong>f86b3f10…</strong>
      </span>
    </InlineCopyText>
  );
}
