import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vite-plus/test";
import { DeleteResource } from "./delete-resource";

describe("DeleteResource", () => {
  it("renders a copy control for the resource name", () => {
    render(
      <DeleteResource
        open
        onOpenChange={() => {}}
        resourceType="Worker"
        resourceName="my-worker"
        onDelete={() => {}}
      />,
    );

    expect(
      screen.getByRole("button", { name: "Copy my-worker to clipboard" }),
    ).toBeDefined();
  });
});
