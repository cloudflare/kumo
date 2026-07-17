import { describe, it, expect } from "vitest";
import { createRef } from "react";
import { render, screen } from "@testing-library/react";
import { ButtonGroup } from "./button-group";
import { Button } from "../button/button";

describe("ButtonGroup", () => {
  it("should be importable", () => {
    expect(ButtonGroup).toBeDefined();
  });

  it("should have correct display name", () => {
    expect(ButtonGroup.displayName).toBe("ButtonGroup");
  });

  it("renders its children", () => {
    render(
      <ButtonGroup>
        <Button>One</Button>
        <Button>Two</Button>
      </ButtonGroup>,
    );
    expect(screen.getByText("One")).toBeTruthy();
    expect(screen.getByText("Two")).toBeTruthy();
  });

  it('defaults to role="group"', () => {
    render(
      <ButtonGroup>
        <Button>One</Button>
      </ButtonGroup>,
    );
    expect(screen.getByRole("group")).toBeTruthy();
  });

  it("allows overriding the role", () => {
    render(
      <ButtonGroup role="toolbar" aria-label="Actions">
        <Button>One</Button>
      </ButtonGroup>,
    );
    expect(screen.getByRole("toolbar", { name: "Actions" })).toBeTruthy();
  });

  it("applies horizontal orientation classes by default", () => {
    render(
      <ButtonGroup>
        <Button>One</Button>
      </ButtonGroup>,
    );
    expect(screen.getByRole("group").className).toContain("flex-row");
  });

  it("applies vertical orientation classes when requested", () => {
    render(
      <ButtonGroup orientation="vertical">
        <Button>One</Button>
      </ButtonGroup>,
    );
    expect(screen.getByRole("group").className).toContain("flex-col");
  });

  it("merges a custom className", () => {
    render(
      <ButtonGroup className="custom-class">
        <Button>One</Button>
      </ButtonGroup>,
    );
    expect(screen.getByRole("group").className).toContain("custom-class");
  });

  it("forwards a ref to the container", () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <ButtonGroup ref={ref}>
        <Button>One</Button>
      </ButtonGroup>,
    );
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });
});
