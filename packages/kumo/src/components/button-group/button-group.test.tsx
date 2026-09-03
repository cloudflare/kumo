import { describe, it, expect } from "vite-plus/test";
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

  it("forwards aria-label to the group", () => {
    render(
      <ButtonGroup aria-label="Deploy">
        <Button>One</Button>
      </ButtonGroup>,
    );
    expect(screen.getByRole("group", { name: "Deploy" })).toBeTruthy();
  });

  it("lays buttons out horizontally", () => {
    render(
      <ButtonGroup>
        <Button>One</Button>
      </ButtonGroup>,
    );
    expect(screen.getByRole("group").className).toContain("flex-row");
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
