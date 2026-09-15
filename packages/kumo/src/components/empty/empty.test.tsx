import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vite-plus/test";
import { Empty } from "./empty";

describe("Empty", () => {
  it("renders the title as a large heading when a description is present", () => {
    render(
      <Empty
        title="No results found"
        description="Try adjusting your search."
      />,
    );

    const title = screen.getByText("No results found");
    const description = screen.getByText("Try adjusting your search.");

    expect(title.tagName).toBe("H2");
    expect(title.className).toContain("text-xl");
    expect(title.className).toContain("font-semibold");
    expect(description.className).toContain("text-base/[inherit]");
    expect(description.className).toContain("text-kumo-subtle");
    expect(description.className).toContain("text-balance");
    expect(description.className).toContain("leading-normal");
    expect(title.parentElement).toBe(description.parentElement);
    expect(title.parentElement?.className).toContain("gap-2.5");
  });

  it("renders the title as base secondary text without a description", () => {
    render(<Empty title="Nothing here" />);

    const title = screen.getByText("Nothing here");

    expect(title.className).toContain("text-base/[inherit]");
    expect(title.className).toContain("text-kumo-subtle");
    expect(title.className).not.toContain("font-semibold");
  });

  it("renders the command line without a background or brand-colored text", () => {
    render(<Empty title="Install Kumo" commandLine="npm install kumo" />);

    const command = screen.getByText("npm install kumo");
    const commandTextGroup = command.parentElement;
    const commandContainer = commandTextGroup?.parentElement;

    expect(command.className).not.toContain("text-kumo-brand");
    expect(commandContainer?.className).not.toContain("bg-kumo-overlay");
    expect(commandContainer?.className.split(" ")).not.toContain("border");
    expect(commandContainer?.className.split(" ")).toContain("ring");
    expect(commandContainer?.className).toContain("ring-kumo-line");
    expect(commandContainer?.className).toContain("items-center");
    expect(commandTextGroup?.className).toContain("items-baseline");
    expect(commandContainer?.className).toContain("shadow-sm");
    expect(commandContainer?.className).not.toContain("shadow-xs");
    expect(commandContainer?.className).not.toContain("hover:");

    const prompt = screen.getByText("$");
    expect(prompt.className).toContain("text-kumo-subtle");
    expect(prompt.className).not.toContain("text-xs");

    const copyButton = screen.getByRole("button", { name: "Copy command" });
    expect(copyButton.className).toContain("text-kumo-subtle");

    const copyIcon = copyButton.querySelector("svg");
    expect(copyIcon?.getAttribute("class") ?? "").not.toContain("group-hover:");
  });
});
