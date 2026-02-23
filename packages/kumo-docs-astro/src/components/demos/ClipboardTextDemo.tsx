import { ClipboardText } from "@cloudflare/kumo";

export function ClipboardTextBasicDemo() {
  return <ClipboardText text="0c239dd2" />;
}

export function ClipboardTextShortDemo() {
  return <ClipboardText text="abc123" />;
}

export function ClipboardTextApiKeyDemo() {
  return <ClipboardText text="sk_live_51H8..." />;
}

export function ClipboardTextLongDemo() {
  return <ClipboardText text="https://example.com/very/long/url/path" />;
}

/** With tooltip on hover showing "Copy", and anchored toast on click showing "Copied" */
export function ClipboardTextWithTooltipDemo() {
  return (
    <ClipboardText
      text="npx kumo add button"
      tooltip={{ text: "Copy", copiedText: "Copied!", side: "top" }}
    />
  );
}
