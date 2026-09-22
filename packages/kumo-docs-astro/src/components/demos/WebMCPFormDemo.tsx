import { useState } from "react";
import { Button, Input, WebMCPForm } from "@cloudflare/kumo";

interface WebMCPSubmitEvent extends SubmitEvent {
  respondWith?: (response: Promise<unknown>) => void;
}

/** A user-reviewed search form exposed as a declarative WebMCP tool. */
export function WebMCPFormBasicDemo() {
  const [query, setQuery] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");

  return (
    <WebMCPForm
      toolName="search-products"
      toolDescription="Search the product catalog by name"
      className="flex max-w-md flex-col gap-4"
      onSubmit={(event) => {
        event.preventDefault();
        setSubmittedQuery(query);
        (event.nativeEvent as WebMCPSubmitEvent).respondWith?.(
          Promise.resolve({ query }),
        );
      }}
    >
      <Input
        name="query"
        label="Product name"
        placeholder="Workers"
        required
        toolParamDescription="Product name or keyword to search for"
        value={query}
        onValueChange={setQuery}
      />
      <Button type="submit" variant="primary">
        Search
      </Button>
      {submittedQuery && (
        <p role="status" className="text-sm text-kumo-subtle">
          Searching for &quot;{submittedQuery}&quot;
        </p>
      )}
    </WebMCPForm>
  );
}
