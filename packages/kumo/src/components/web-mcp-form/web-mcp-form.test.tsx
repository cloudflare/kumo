import { createRef } from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vite-plus/test";
import { WebMCPForm } from "./web-mcp-form";

describe("WebMCPForm", () => {
  it("renders declarative WebMCP attributes on a native form", () => {
    render(
      <WebMCPForm
        toolName="search-products"
        toolDescription="Search products by name"
        aria-label="Product search"
      />,
    );

    const form = screen.getByRole("form");
    expect(form.getAttribute("toolname")).toBe("search-products");
    expect(form.getAttribute("tooldescription")).toBe(
      "Search products by name",
    );
    expect(form.hasAttribute("toolautosubmit")).toBe(false);
  });

  it("only renders toolautosubmit when explicitly enabled", () => {
    render(
      <WebMCPForm
        toolName="search-products"
        toolDescription="Search products by name"
        autoSubmit
        aria-label="Product search"
      />,
    );

    expect(screen.getByRole("form").hasAttribute("toolautosubmit")).toBe(true);
  });

  it("forwards native form props and refs", () => {
    const ref = createRef<HTMLFormElement>();
    render(
      <WebMCPForm
        ref={ref}
        toolName="search-products"
        toolDescription="Search products by name"
        aria-label="Product search"
        method="post"
        className="custom-class"
      />,
    );

    expect(ref.current).toBeInstanceOf(HTMLFormElement);
    expect(ref.current?.method).toContain("post");
    expect(ref.current?.className).toContain("custom-class");
  });
});
