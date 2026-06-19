import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { DeleteResource } from "./delete-resource";

const defaultProps = {
  open: true,
  onOpenChange: vi.fn(),
  resourceType: "Zone",
  resourceName: "example.com",
  onDelete: vi.fn(),
};

describe("DeleteResource", () => {
  it("uses alert-dialog semantics with title and description", () => {
    render(<DeleteResource {...defaultProps} />);

    expect(
      screen.getByRole("alertdialog", {
        name: "Delete example.com",
        description:
          "This action cannot be undone. This will permanently delete the example.com zone.",
      }),
    ).toBeTruthy();
  });

  it("announces delete errors", () => {
    render(
      <DeleteResource {...defaultProps} errorMessage="Delete request failed" />,
    );

    const error = screen.getByRole("alert");
    expect(error.textContent).toContain("Delete request failed");
    expect(error.getAttribute("aria-live")).toBe("assertive");
    expect(error.getAttribute("aria-atomic")).toBe("true");
  });
});
